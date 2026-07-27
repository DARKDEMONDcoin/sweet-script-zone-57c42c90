/**
 * HITL (Human-in-the-loop) helpers for the agent runtime.
 *
 * Flow:
 *  1. Agent picks a tool. Runtime inspects registry; if `needsApproval`, the
 *     runtime writes a row into `hitl_tool_approvals` and short-circuits the
 *     tool call with a `pending_approval` result the UI can render.
 *  2. UI shows an ApprovalCard; user approves/denies via a server fn that
 *     updates the row.
 *  3. Runtime resumes (either re-invokes the agent with the approval result,
 *     or terminates the step) on the next turn.
 *
 * This module owns only the create/read/update primitives. Wiring into
 * streamText happens in runAgentTurn.functions.ts.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface HitlPending {
  id: string;
  status: "pending";
  toolName: string;
  input: unknown;
}

export interface HitlDecided {
  id: string;
  status: "approved" | "denied";
  toolName: string;
  input: unknown;
  editedInput?: unknown;
  decidedAt: string;
}

export type HitlRow = HitlPending | HitlDecided;

export async function createHitlApproval(
  supabase: SupabaseClient,
  args: {
    userId: string;
    conversationId?: string;
    toolName: string;
    input: unknown;
  },
): Promise<HitlPending> {
  const { data, error } = await supabase
    .from("hitl_tool_approvals")
    .insert({
      user_id: args.userId,
      conversation_id: args.conversationId ?? null,
      tool_name: args.toolName,
      tool_input: args.input as never,
      status: "pending",
    })
    .select("id, tool_name, tool_input")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create HITL approval: ${error?.message ?? "unknown"}`);
  }

  return {
    id: data.id as string,
    status: "pending",
    toolName: data.tool_name as string,
    input: data.tool_input,
  };
}

export async function getHitlApproval(
  supabase: SupabaseClient,
  id: string,
): Promise<HitlRow | null> {
  const { data, error } = await supabase
    .from("hitl_tool_approvals")
    .select("id, status, tool_name, tool_input, decided_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as {
    id: string;
    status: string;
    tool_name: string;
    tool_input: unknown;
    decided_at: string | null;
  };

  if (row.status === "pending") {
    return { id: row.id, status: "pending", toolName: row.tool_name, input: row.tool_input };
  }

  return {
    id: row.id,
    status: row.status as "approved" | "denied",
    toolName: row.tool_name,
    input: row.tool_input,
    decidedAt: row.decided_at ?? new Date().toISOString(),
  };
}

export async function decideHitlApproval(
  supabase: SupabaseClient,
  args: { id: string; approve: boolean; editedInput?: unknown },
): Promise<void> {
  const payload: Record<string, unknown> = {
    status: args.approve ? "approved" : "denied",
    decided_at: new Date().toISOString(),
  };
  if (args.editedInput !== undefined) payload.edited_input = args.editedInput;

  const { error } = await supabase
    .from("hitl_tool_approvals")
    .update(payload)
    .eq("id", args.id);

  if (error) throw new Error(`Failed to decide HITL approval: ${error.message}`);
}
