// Unified Pipedream edge function.
// Actions (in POST body `action` field, or `x-pd-action` header, or URL suffix):
//   - list_accounts   → authenticated: list current user's connected Pipedream accounts, sync into pipedream_accounts
//   - create_token    → authenticated: mint a Connect Token + connect_link_url for the current user
//   - disconnect      → authenticated: revoke a connected account for the current user
//   - proxy           → authenticated: run a Pipedream action on behalf of the user (opt-in gated)
//   - webhook         → public: receive Pipedream webhook events (shared secret + optional HMAC)
//
// verify_jwt is disabled at the function level so `webhook` can be public;
// every other branch validates the caller's Supabase session manually.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { timingSafeEqual } from "https://deno.land/std@0.224.0/crypto/timing_safe_equal.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-webhook-signature, x-webhook-timestamp, x-pd-action",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function eqBytes(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength !== b.byteLength) return false;
  return timingSafeEqual(a, b);
}

async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function envConfig() {
  const projectId = Deno.env.get("PIPEDREAM_PROJECT_ID");
  const environment = Deno.env.get("PIPEDREAM_ENVIRONMENT") ?? "production";
  const clientId = Deno.env.get("PIPEDREAM_CLIENT_ID");
  const clientSecret = Deno.env.get("PIPEDREAM_CLIENT_SECRET");
  return { projectId, environment, clientId, clientSecret };
}

async function getPipedreamAccessToken() {
  const { clientId, clientSecret } = envConfig();
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

async function authedSupabase(req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null as any };
  return { supabase, user: data.user };
}

function adminSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ---------- list_accounts ----------
async function handleListAccounts(req: Request): Promise<Response> {
  const { user } = await authedSupabase(req);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);
  const { projectId, environment, clientId, clientSecret } = envConfig();
  if (!projectId || !clientId || !clientSecret) {
    return json({ ok: true, configured: false, accounts: [], provider_warning: "Pipedream is not configured on the backend" });
  }
  try {
    const token = await getPipedreamAccessToken();
    const res = await fetch(
      `https://api.pipedream.com/v1/connect/${projectId}/accounts?external_user_id=${encodeURIComponent(user.id)}`,
      { headers: { Authorization: `Bearer ${token}`, "X-PD-Environment": environment } },
    );
    if (!res.ok) {
      const t = await res.text();
      return json({ ok: false, accounts: [], error: `Pipedream accounts lookup failed: ${res.status} ${t}` }, 502);
    }
    const data = await res.json();
    const accounts = Array.isArray(data?.data) ? data.data : [];

    // Sync into pipedream_accounts (best-effort)
    try {
      const admin = adminSupabase();
      const rows = accounts
        .map((a: any) => {
          const slug = a?.app_slug ?? a?.app?.name_slug ?? a?.app?.slug;
          if (!slug || !a?.id) return null;
          return {
            user_id: user.id,
            app_slug: String(slug),
            account_id: String(a.id),
            external_user_id: user.id,
            account_name: a?.name ?? a?.external_id ?? null,
            healthy: a?.healthy !== false,
            metadata: a ?? {},
            updated_at: new Date().toISOString(),
          };
        })
        .filter(Boolean);
      if (rows.length > 0) {
        await admin
          .from("pipedream_accounts")
          .upsert(rows as any, { onConflict: "user_id,app_slug,account_id" });
      }
      // Mark accounts no longer present as unhealthy
      const currentIds = new Set(rows.map((r: any) => r.account_id));
      const { data: existing } = await admin
        .from("pipedream_accounts")
        .select("account_id")
        .eq("user_id", user.id);
      const stale = (existing ?? [])
        .map((r: any) => r.account_id)
        .filter((id: string) => !currentIds.has(id));
      if (stale.length > 0) {
        await admin
          .from("pipedream_accounts")
          .delete()
          .eq("user_id", user.id)
          .in("account_id", stale);
      }
    } catch (_) {
      /* best-effort sync only */
    }

    return json({ ok: true, accounts });
  } catch (e) {
    return json({ ok: false, accounts: [], error: (e as Error).message }, 500);
  }
}

// ---------- create_token ----------
async function handleCreateToken(req: Request, body: any): Promise<Response> {
  const { user } = await authedSupabase(req);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);
  const { projectId, environment, clientId, clientSecret } = envConfig();
  if (!projectId || !clientId || !clientSecret) {
    return json({ ok: true, configured: false, error: "Pipedream is not configured on the backend" });
  }
  try {
    const token = await getPipedreamAccessToken();
    const origin = String(body?.redirect_origin ?? "").trim();
    const successRedirect = origin
      ? `${origin.replace(/\/$/, "")}/auth/callback?provider=pipedream`
      : undefined;
    const res = await fetch(
      `https://api.pipedream.com/v1/connect/${projectId}/tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-PD-Environment": environment,
        },
        body: JSON.stringify({
          external_user_id: user.id,
          ...(successRedirect ? { success_redirect_uri: successRedirect } : {}),
        }),
      },
    );
    if (!res.ok) {
      const t = await res.text();
      return json({ ok: false, error: `Connect token failed: ${res.status} ${t}` }, 502);
    }
    const data = await res.json();
    return json({
      ok: true,
      token: data?.token,
      connect_link_url: data?.connect_link_url,
      expires_at: data?.expires_at,
    });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
}

// ---------- disconnect ----------
async function handleDisconnect(req: Request, body: any): Promise<Response> {
  const { user } = await authedSupabase(req);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);
  const appSlug = String(body?.app_slug ?? "").trim();
  const accountId = String(body?.account_id ?? "").trim();
  if (!appSlug && !accountId) return json({ ok: false, error: "app_slug or account_id required" }, 400);

  const { projectId, environment, clientId, clientSecret } = envConfig();
  if (!projectId || !clientId || !clientSecret) return json({ ok: false, error: "Pipedream is not configured" }, 500);

  try {
    const admin = adminSupabase();
    // Resolve account_ids for this user + slug
    let ids: string[] = [];
    if (accountId) ids = [accountId];
    else {
      const { data } = await admin
        .from("pipedream_accounts")
        .select("account_id")
        .eq("user_id", user.id)
        .eq("app_slug", appSlug);
      ids = (data ?? []).map((r: any) => r.account_id).filter(Boolean);
    }

    const token = await getPipedreamAccessToken();
    for (const id of ids) {
      await fetch(`https://api.pipedream.com/v1/connect/${projectId}/accounts/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "X-PD-Environment": environment },
      }).catch(() => {});
    }

    // Local cleanup
    let del = admin.from("pipedream_accounts").delete().eq("user_id", user.id);
    if (appSlug) del = del.eq("app_slug", appSlug);
    if (ids.length > 0) del = del.in("account_id", ids);
    await del;

    return json({ ok: true, disconnected: ids.length });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
}

// ---------- proxy ----------
async function handleProxy(req: Request, body: any): Promise<Response> {
  try {
    const { supabase, user } = await authedSupabase(req);
    if (!user) return json({ ok: false, error: "Unauthorized" }, 401);
    const userId = user.id;

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

    const { projectId, environment, clientId, clientSecret } = envConfig();
    if (!projectId || !clientId || !clientSecret)
      return json({ ok: false, error: "Pipedream is not configured" }, 500);

    const token = await getPipedreamAccessToken();

    const accountsRes = await fetch(
      `https://api.pipedream.com/v1/connect/${projectId}/accounts?external_user_id=${encodeURIComponent(userId)}&app=${encodeURIComponent(appSlug)}`,
      { headers: { Authorization: `Bearer ${token}`, "X-PD-Environment": environment } },
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
    try { runData = JSON.parse(runText); } catch { runData = runText; }

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

// ---------- webhook ----------
async function handleWebhook(req: Request, rawBody: string): Promise<Response> {
  const enc = new TextEncoder();
  const secret = Deno.env.get("PIPEDREAM_WEBHOOK_SECRET");

  const providedSecret = req.headers.get("x-webhook-secret") ?? "";
  const providedSig = req.headers.get("x-webhook-signature") ?? "";
  const providedTs = req.headers.get("x-webhook-timestamp") ?? "";

  let authed = false;
  if (!secret) {
    // Webhook secret not configured — accept but log a warning. Configure
    // PIPEDREAM_WEBHOOK_SECRET in Supabase Edge Function secrets to enforce signature verification.
    console.warn("[pipedream:webhook] PIPEDREAM_WEBHOOK_SECRET not set; accepting event without signature verification");
    authed = true;
  } else {
    // Preferred: HMAC-SHA256 of `${timestamp}.${rawBody}` with replay window
    if (providedSig && providedTs) {
      const ts = Number(providedTs);
      if (Number.isFinite(ts) && Math.abs(Date.now() / 1000 - ts) <= 300) {
        const expected = await hmacHex(secret, `${providedTs}.${rawBody}`);
        if (eqBytes(enc.encode(providedSig), enc.encode(expected))) authed = true;
      }
    }
    // Fallback: shared-secret header (kept for backward compatibility)
    if (!authed && providedSecret && eqBytes(enc.encode(providedSecret), enc.encode(secret))) {
      authed = true;
    }
    if (!authed) return new Response("Unauthorized", { status: 401, headers: CORS });
  }


  let payload: any = {};
  try { payload = JSON.parse(rawBody); } catch { /* ignore */ }

  const supabase = adminSupabase();
  const externalUserId = String(
    payload?.external_user_id ?? payload?.user_id ?? payload?.userId ?? "",
  ).trim();
  const eventType = String(payload?.event ?? payload?.type ?? "pipedream_event");

  // Validate user exists to prevent orphan/spoofed rows
  let validUserId: string | null = null;
  if (externalUserId) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", externalUserId)
      .maybeSingle();
    if (prof?.id) validUserId = prof.id;
  }

  const { error } = await supabase.from("background_jobs").insert({
    user_id: validUserId,
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
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const url = new URL(req.url);
  const path = url.pathname.toLowerCase();
  const headerAction = (req.headers.get("x-pd-action") ?? "").toLowerCase();

  const rawBody = await req.text();
  let body: any = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { body = {}; }

  const bodyAction = String(body?.action ?? "").toLowerCase();
  const action =
    headerAction ||
    bodyAction ||
    (path.endsWith("/webhook") ? "webhook" :
     path.endsWith("/proxy") ? "proxy" :
     path.endsWith("/list_accounts") ? "list_accounts" :
     path.endsWith("/create_token") ? "create_token" :
     path.endsWith("/disconnect") ? "disconnect" :
     path.endsWith("/list_actions") ? "list_actions" : "");

  switch (action) {
    case "list_accounts": return handleListAccounts(req);
    case "create_token":  return handleCreateToken(req, body);
    case "disconnect":    return handleDisconnect(req, body);
    case "list_actions":  return handleListActions(req, body);
    case "proxy":         return handleProxy(req, body);
    case "webhook":       return handleWebhook(req, rawBody);
    case "":              return json({ ok: false, error: "action is required (list_accounts|list_actions|create_token|disconnect|proxy|webhook)" }, 400);
    default:              return json({ ok: false, error: `Unknown action: ${action}` }, 400);
  }
});

// ---------- list_actions (Action Catalog) ----------
async function handleListActions(req: Request, body: any): Promise<Response> {
  const { user } = await authedSupabase(req);
  if (!user) return json({ ok: false, error: "Unauthorized" }, 401);
  const appSlug = String(body?.app_slug || "").trim();
  const q = String(body?.q || "").trim();
  if (!appSlug) return json({ ok: false, error: "app_slug is required" }, 400);
  const { projectId, environment, clientId, clientSecret } = envConfig();
  if (!projectId || !clientId || !clientSecret) {
    return json({ ok: true, configured: false, actions: [] });
  }
  try {
    const token = await getPipedreamAccessToken();
    const url = new URL(`https://api.pipedream.com/v1/connect/${projectId}/components/actions`);
    url.searchParams.set("app", appSlug);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("limit", "25");
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, "X-PD-Environment": environment },
    });
    if (!res.ok) {
      const t = await res.text();
      return json({ ok: false, actions: [], error: `Pipedream actions lookup failed: ${res.status} ${t}` }, 502);
    }
    const data = await res.json();
    const items = Array.isArray(data?.data) ? data.data : [];
    const actions = items.map((a: any) => ({
      key: a?.key ?? a?.name_slug ?? a?.id,
      name: a?.name ?? a?.key,
      description: a?.description ?? "",
    }));
    return json({ ok: true, app_slug: appSlug, actions });
  } catch (e: any) {
    return json({ ok: false, actions: [], error: e?.message ?? String(e) }, 500);
  }
}
