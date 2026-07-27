/**
 * Backend tools — server-executed. Kept intentionally small in this scaffold;
 * extend as agents need more. Each tool receives ToolExecutionContext with
 * the authenticated userId and (optionally) the supabase access token.
 */

import { z } from "zod";
import { registerTool } from "../registry";

/** Simple time/date helper — useful smoke test that never needs approval. */
registerTool({
  name: "get_current_time",
  description: "Get the current server time in ISO 8601 UTC.",
  category: "meta",
  inputSchema: z.object({}),
  icon: "clock",
  execute: async () => ({ iso: new Date().toISOString() }),
});

/** Web search — thin passthrough to the existing brave/tavily wrapper if present. */
registerTool({
  name: "web_search",
  description: "Search the web for recent information and return top results.",
  category: "search",
  inputSchema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(10).optional(),
  }),
  icon: "search",
  execute: async ({ query, limit }, ctx) => {
    // Placeholder: the app's existing search infra lives in edge functions.
    // Agents may call this and downstream code should route to Brave/Tavily.
    return {
      ok: false,
      note: "web_search wiring pending — connect to existing brave/tavily edge fn.",
      query,
      limit: limit ?? 5,
      userId: ctx.userId,
    };
  },
});

/** Sensitive destructive tool — demonstrates the HITL flag. */
registerTool({
  name: "delete_conversation",
  description: "Permanently delete a conversation. Requires user approval.",
  category: "workspace",
  inputSchema: z.object({
    conversationId: z.string().uuid(),
  }),
  icon: "trash",
  needsApproval: true,
  execute: async ({ conversationId }, ctx) => {
    // Actual deletion happens after approval; this is a stub the runtime
    // pauses on when needsApproval is honored.
    return { deleted: false, conversationId, userId: ctx.userId };
  },
});
