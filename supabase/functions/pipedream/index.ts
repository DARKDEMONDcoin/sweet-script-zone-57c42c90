// Merged Pipedream edge function.
// Routes:
//   - action=proxy  (or path ends with /proxy)   → authenticated action runner
//   - action=webhook (or path ends with /webhook) → public webhook receiver
//
// verify_jwt is disabled for the merged function so the webhook branch can be
// public. The proxy branch validates the caller's Supabase session manually
// exactly like the original pipedream-proxy function did.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { timingSafeEqual } from "https://deno.land/std@0.224.0/crypto/timing_safe_equal.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-pd-action",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function eq(a: string, b: string) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return timingSafeEqual(ab, bb);
}

async function getPipedreamAccessToken() {
  const clientId = Deno.env.get("PIPEDREAM_CLIENT_ID");
  const clientSecret = Deno.env.get("PIPEDREAM_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Pipedream is not configured");
  const res = await fetch("https://api.pipedream.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Pipedream token error: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

// ---------- Proxy branch (verbatim behavior of pipedream-proxy) ----------
async function handleProxy(req: Request, body: any): Promise<Response> {
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ ok: false, error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const appSlug = String(body?.app_slug ?? "").trim();
    const actionKey = String(body?.action_key ?? "").trim();
    const params = (body?.params ?? {}) as Record<string, unknown>;
    if (!appSlug || !actionKey)
      return json({ ok: false, error: "app_slug and action_key required" }, 400);

    const { data: pref } = await supabase
      .from("pipedream_tool_settings")
      .select("enabled")
      .eq("user_id", userId)
      .eq("app_slug", appSlug)
      .maybeSingle();
    if (pref && pref.enabled === false) {
      return json(
        { ok: false, error: `App "${appSlug}" is disabled for AI use in your settings.` },
        403,
      );
    }

    const projectId = Deno.env.get("PIPEDREAM_PROJECT_ID");
    const environment = Deno.env.get("PIPEDREAM_ENVIRONMENT") ?? "production";
    if (!projectId) return json({ ok: false, error: "PIPEDREAM_PROJECT_ID not configured" }, 500);

    const token = await getPipedreamAccessToken();

    const accountsRes = await fetch(
      `https://api.pipedream.com/v1/connect/${projectId}/accounts?external_user_id=${encodeURIComponent(userId)}&app=${encodeURIComponent(appSlug)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-PD-Environment": environment,
        },
      },
    );
    if (!accountsRes.ok) {
      const t = await accountsRes.text();
      return json(
        { ok: false, error: `Pipedream accounts lookup failed: ${accountsRes.status} ${t}` },
        502,
      );
    }
    const accountsData = await accountsRes.json();
    const account = Array.isArray(accountsData?.data) ? accountsData.data[0] : null;
    if (!account?.id) {
      return json({ ok: false, error: `No connected ${appSlug} account for this user.` }, 404);
    }

    const runRes = await fetch(
      `https://api.pipedream.com/v1/connect/${projectId}/actions/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-PD-Environment": environment,
          "X-PD-External-User-ID": userId,
        },
        body: JSON.stringify({
          id: actionKey,
          external_user_id: userId,
          configured_props: {
            ...params,
            [appSlug]: { authProvisionId: account.id },
          },
        }),
      },
    );
    const runText = await runRes.text();
    let runData: unknown;
    try {
      runData = JSON.parse(runText);
    } catch {
      runData = runText;
    }

    await supabase
      .from("edge_audit_log")
      .insert({
        user_id: userId,
        action: "pipedream_proxy_run",
        resource: `${appSlug}:${actionKey}`,
        metadata: { status: runRes.status, params_keys: Object.keys(params) },
      })
      .catch(() => {});

    if (!runRes.ok)
      return json({ ok: false, error: `Action failed: ${runRes.status}`, result: runData }, 502);
    return json({ ok: true, result: runData });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
}

// ---------- Webhook branch (verbatim behavior of pipedream-webhook) ----------
async function handleWebhook(req: Request, payload: any): Promise<Response> {
  const secret = Deno.env.get("PIPEDREAM_WEBHOOK_SECRET");
  if (!secret) return new Response("Not configured", { status: 500, headers: CORS });
  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!eq(provided, secret)) return new Response("Unauthorized", { status: 401, headers: CORS });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const externalUserId = String(
    payload?.external_user_id ?? payload?.user_id ?? payload?.userId ?? "",
  ).trim();
  const eventType = String(payload?.event ?? payload?.type ?? "pipedream_event");

  const { error } = await supabase.from("background_jobs").insert({
    user_id: externalUserId || null,
    kind: `pipedream:${eventType}`,
    status: "pending",
    payload,
  });
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: CORS });

  const url = new URL(req.url);
  const path = url.pathname.toLowerCase();
  const headerAction = (req.headers.get("x-pd-action") ?? "").toLowerCase();

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const bodyAction = String(body?.action ?? "").toLowerCase();
  const action =
    headerAction ||
    bodyAction ||
    (path.endsWith("/webhook") ? "webhook" : path.endsWith("/proxy") ? "proxy" : "");

  if (action === "webhook") return handleWebhook(req, body);
  if (action === "proxy" || action === "") return handleProxy(req, body);

  return json({ ok: false, error: `Unknown action: ${action}` }, 400);
});
