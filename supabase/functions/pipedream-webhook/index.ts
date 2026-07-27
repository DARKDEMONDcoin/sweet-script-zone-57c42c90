// Pipedream Webhook receiver — public endpoint that stores incoming events
// from Pipedream workflows into `background_jobs` so the app can react to them.
//
// Security: requires a shared secret in the `x-webhook-secret` header that
// matches PIPEDREAM_WEBHOOK_SECRET. The payload MUST include external_user_id
// so we can attribute the event to a Megsy user.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { timingSafeEqual } from "https://deno.land/std@0.224.0/crypto/timing_safe_equal.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function eq(a: string, b: string) {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return timingSafeEqual(ab, bb);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  const secret = Deno.env.get("PIPEDREAM_WEBHOOK_SECRET");
  if (!secret) return new Response("Not configured", { status: 500, headers: CORS });
  const provided = req.headers.get("x-webhook-secret") ?? "";
  if (!eq(provided, secret)) return new Response("Unauthorized", { status: 401, headers: CORS });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let payload: any = {};
  try { payload = await req.json(); } catch { /* ignore */ }
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
});
