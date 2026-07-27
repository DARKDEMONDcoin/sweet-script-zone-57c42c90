import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { streamText, generateText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";

import { createLovableAiGatewayProvider } from "../ai-gateway.server";
import { getAgent, type AgentId } from "./agents/definitions";
import { toAiTools } from "./tools";
import { getTool } from "./tools/registry";
import { createHitlApproval, getHitlApproval } from "./hitl.server";

/**
 * Single agent-turn runner. This is the app-internal RPC entry point for the
 * new AI SDK agent runtime. It:
 *   - resolves the AgentDefinition
 *   - builds tools filtered by the agent's allowlist
 *   - honors `needsApproval` via hitl_tool_approvals
 *   - returns the full text + tool trace for the caller to persist
 *
 * The chat UI keeps using the existing Alibaba streaming path. This runtime
 * is used from the new /agent surface and from orchestrator delegations.
 */

const InputSchema = z.object({
  agent: z.string().optional(),
  messages: z.array(z.any()),
  conversationId: z.string().uuid().optional(),
  /** id of a resolved HITL row that unblocks a paused tool call */
  approvalId: z.string().uuid().optional(),
});

export const runAgentTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing on server");

    const ctx = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };
    const { supabase, userId } = ctx;
    const agent = getAgent(data.agent);

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway(agent.model);

    const tools = toAiTools(
      { userId, conversationId: data.conversationId, signal: undefined },
      agent.tools,
    );

    // Wrap needsApproval tools so they open a HITL row and short-circuit
    // instead of executing.
    for (const [name, tool] of Object.entries(tools)) {
      const def = getTool(name);
      if (!def?.needsApproval) continue;
      const originalExecute = tool.execute;
      tool.execute = async (input, opts) => {
        // Resume path: if the caller passed an approvalId and it's decided, run.
        if (data.approvalId) {
          const row = await getHitlApproval(supabase, data.approvalId);
          if (row && row.status === "approved") {
            const runInput =
              "editedInput" in row && row.editedInput !== undefined ? row.editedInput : input;
            return originalExecute
              ? originalExecute(runInput as never, opts as never)
              : { ok: false, note: "no executor" };
          }
          if (row && row.status === "denied") {
            return { ok: false, denied: true, approvalId: data.approvalId };
          }
        }
        const pending = await createHitlApproval(supabase, {
          userId,
          conversationId: data.conversationId,
          toolName: name,
          input,
        });
        return { _hitl: true, approvalId: pending.id, toolName: name, input };
      };
    }

    const result = await generateText({
      model,
      system: agent.systemPrompt,
      messages: await convertToModelMessages(data.messages as UIMessage[]),
      tools,
      stopWhen: stepCountIs(agent.maxSteps ?? 50),
    });

    return {
      agentId: agent.id as AgentId,
      text: result.text,
      steps: result.steps.length,
      toolCalls: result.steps.flatMap((s) =>
        s.content
          .filter((c) => c.type === "tool-call")
          .map((c) => ({ name: (c as { toolName: string }).toolName })),
      ),
      finishReason: result.finishReason,
      usage: result.usage,
    };
  });

/**
 * Streaming variant — returns the raw AI SDK stream response.
 * Called from a server ROUTE (not a server fn) because streams cross the RPC
 * boundary poorly. See src/routes/api/agent.ts.
 */
export async function streamAgentTurn(args: {
  agentId: string | undefined;
  messages: UIMessage[];
  userId: string;
  conversationId?: string;
}) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing on server");

  const agent = getAgent(args.agentId);
  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway(agent.model);

  const tools = toAiTools(
    { userId: args.userId, conversationId: args.conversationId },
    agent.tools,
  );

  return streamText({
    model,
    system: agent.systemPrompt,
    messages: await convertToModelMessages(args.messages),
    tools,
    stopWhen: stepCountIs(agent.maxSteps ?? 50),
  });
}
