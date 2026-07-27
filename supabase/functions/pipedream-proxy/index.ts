// Pipedream Proxy — runs a Pipedream Connect action on behalf of the signed-in
// user. Enforces that the user has connected the app AND has enabled it for AI
// use (pipedream_tool_settings). All mutating calls should be gated by HITL
// approval on the client side before invoking this function.
//
// Body: { app_slug: string, action_key: string, params?: Record<string,unknown> }
// Returns: { ok: boolean, result?: unknown, error?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

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

    const body = await req.json().catch(() => ({}));
    const appSlug = String(body?.app_slug ?? "").trim();
    const actionKey = String(body?.action_key ?? "").trim();
    const params = (body?.params ?? {}) as Record<string, unknown>;
    if (!appSlug || !actionKey) return json({ ok: false, error: "app_slug and action_key required" }, 400);

    // Enforce user opt-in
    const { data: pref } = await supabase
      .from("pipedream_tool_settings")
      .select("enabled")
      .eq("user_id", userId)
      .eq("app_slug", appSlug)
      .maybeSingle();
    if (pref && pref.enabled === false) {
      return json({ ok: false, error: `App "${appSlug}" is disabled for AI use in your settings.` }, 403);
    }

    const projectId = Deno.env.get("PIPEDREAM_PROJECT_ID");
    const environment = Deno.env.get("PIPEDREAM_ENVIRONMENT") ?? "production";
    if (!projectId) return json({ ok: false, error: "PIPEDREAM_PROJECT_ID not configured" }, 500);

    const token = await getPipedreamAccessToken();

    // Look up the user's account for this app via Pipedream Connect.
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
      return json({ ok: false, error: `Pipedream accounts lookup failed: ${accountsRes.status} ${t}` }, 502);
    }
    const accountsData = await accountsRes.json();
    const account = Array.isArray(accountsData?.data) ? accountsData.data[0] : null;
    if (!account?.id) {
      return json({ ok: false, error: `No connected ${appSlug} account for this user.` }, 404);
    }

    // Invoke the action.
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
    try { runData = JSON.parse(runText); } catch { runData = runText; }

    // Audit
    await supabase.from("edge_audit_log").insert({
      user_id: userId,
      action: "pipedream_proxy_run",
      resource: `${appSlug}:${actionKey}`,
      metadata: { status: runRes.status, params_keys: Object.keys(params) },
    }).catch(() => {});

    if (!runRes.ok) return json({ ok: false, error: `Action failed: ${runRes.status}`, result: runData }, 502);
    return json({ ok: true, result: runData });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
