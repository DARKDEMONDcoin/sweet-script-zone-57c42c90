/**
 * Pipedream/Integrations backend tools — safe read-only helpers that the AI
 * agent runtime can call. Anything mutating a third-party account must go
 * through a dedicated proxy edge function with per-tool HITL, not from here.
 */

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { registerTool } from "../registry";

function serverSupabase(accessToken?: string) {
  const url = process.env.SUPABASE_URL!;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

registerTool({
  name: "list_my_integrations",
  description:
    "List the third-party apps (Pipedream/OAuth) the current user has connected to Megsy. Use before suggesting an action that requires an integration.",
  category: "workspace",
  inputSchema: z.object({}),
  icon: "plug",
  execute: async (_input, ctx) => {
    try {
      const supabase = serverSupabase(ctx.supabaseAccessToken);
      const { data, error } = await supabase.functions.invoke("pipedream-connect", {
        body: { action: "list_accounts" },
      });
      if (error) return { ok: false, error: error.message, connected: [] };
      const accounts = Array.isArray(data?.accounts) ? data.accounts : [];
      const connected = accounts
        .map((a: any) => a?.app_slug ?? a?.app?.name_slug ?? a?.app?.slug)
        .filter(Boolean);

      // Merge in user prefs (which apps the user allowed the AI to use).
      const { data: prefs } = await supabase
        .from("pipedream_tool_settings")
        .select("app_slug,enabled")
        .eq("user_id", ctx.userId);
      const allowed = new Set(
        (prefs || [])
          .filter((p: any) => p.enabled)
          .map((p: any) => p.app_slug),
      );
      const disabled = new Set(
        (prefs || [])
          .filter((p: any) => !p.enabled)
          .map((p: any) => p.app_slug),
      );

      return {
        ok: true,
        connected,
        aiEnabled: connected.filter(
          (slug: string) => allowed.has(slug) || !disabled.has(slug),
        ),
        aiDisabled: connected.filter((slug: string) => disabled.has(slug)),
      };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? String(e), connected: [] };
    }
  },
});

/**
 * Execute a Pipedream Connect action on behalf of the user. Every call is
 * routed through the `pipedream-proxy` edge function which:
 *   - re-validates the caller's Supabase session,
 *   - enforces the user's per-app enable/disable preference,
 *   - looks up the user's connected account,
 *   - runs the action and returns the result.
 *
 * Marked `needsApproval` so the agent runtime opens a HITL row and the UI
 * shows an approval card BEFORE the action fires.
 */
registerTool({
  name: "run_integration_action",
  description:
    "Run an action on a third-party app the user has connected via Pipedream (e.g. send a Slack message, create a GitHub issue, add a Notion page). Requires the user to have connected the app and left it enabled for AI use. Human approval is required before the action runs.",
  category: "workspace",
  icon: "zap",
  needsApproval: true,
  inputSchema: z.object({
    app_slug: z
      .string()
      .min(1)
      .describe("Pipedream app slug (e.g. 'slack', 'gmail', 'github', 'notion')."),
    action_key: z
      .string()
      .min(1)
      .describe(
        "Pipedream action component key, e.g. 'slack-send-message', 'gmail-send-email'.",
      ),
    params: z
      .record(z.string(), z.any())
      .optional()
      .describe("Action parameters. Match the action's configured_props schema."),
    reason: z
      .string()
      .optional()
      .describe("Short human-readable reason shown to the user in the approval card."),
  }),
  execute: async ({ app_slug, action_key, params }, ctx) => {
    try {
      const supabase = serverSupabase(ctx.supabaseAccessToken);
      const { data, error } = await supabase.functions.invoke("pipedream", {
        body: { action: "proxy", app_slug, action_key, params: params ?? {} },
      });
      if (error) return { ok: false, error: error.message };
      return data ?? { ok: false, error: "empty response" };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? String(e) };
    }
  },
});

