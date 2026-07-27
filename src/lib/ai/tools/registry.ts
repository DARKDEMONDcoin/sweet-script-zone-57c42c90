import { z } from "zod";
import { tool as aiTool, type Tool } from "ai";

/**
 * Unified tool registry — backend (server-executed) + frontend (UI actions).
 *
 * A tool is defined once, then materialized into either:
 *  - an AI SDK `Tool` for the agent runtime (`toAiTool()`), or
 *  - a metadata descriptor for the frontend dispatcher (`toFrontendDescriptor()`).
 *
 * `assistant-ui` toolRegistry can be wired against `frontendTools()` to render
 * matching cards without duplicating definitions.
 */

export type ToolCategory =
  | "search"
  | "media"
  | "code"
  | "data"
  | "workspace"
  | "ui"
  | "meta";

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: z.ZodType<TInput>;
  /** Server-side execution. Omit for frontend-only tools. */
  execute?: (input: TInput, ctx: ToolExecutionContext) => Promise<TOutput>;
  /** Client-side action name. Frontend tools bus dispatches this. */
  frontendAction?: string;
  /** Requires HITL approval before execution. */
  needsApproval?: boolean;
  /** Compact icon key for UI cards. */
  icon?: string;
}

export interface ToolExecutionContext {
  userId: string;
  conversationId?: string;
  supabaseAccessToken?: string;
  signal?: AbortSignal;
}

const REGISTRY = new Map<string, ToolDefinition>();

export function registerTool<TInput, TOutput>(def: ToolDefinition<TInput, TOutput>) {
  if (REGISTRY.has(def.name)) {
    // Overwrite silently in dev to support HMR; keep last registration.
  }
  REGISTRY.set(def.name, def as ToolDefinition);
  return def;
}

export function getTool(name: string): ToolDefinition | undefined {
  return REGISTRY.get(name);
}

export function listTools(filter?: { category?: ToolCategory; backend?: boolean; frontend?: boolean }) {
  return Array.from(REGISTRY.values()).filter((t) => {
    if (filter?.category && t.category !== filter.category) return false;
    if (filter?.backend && !t.execute) return false;
    if (filter?.frontend && !t.frontendAction) return false;
    return true;
  });
}

/**
 * Build an AI SDK tools object for `streamText({ tools })`.
 * `allow` limits which tools the agent sees.
 */
export function toAiTools(ctx: ToolExecutionContext, allow?: string[]): Record<string, Tool> {
  const out: Record<string, Tool> = {};
  for (const def of REGISTRY.values()) {
    if (allow && !allow.includes(def.name)) continue;
    if (!def.execute && !def.frontendAction) continue;

    out[def.name] = aiTool({
      description: def.description,
      inputSchema: def.inputSchema as z.ZodType<unknown>,
      execute: def.execute
        ? async (input) => def.execute!(input, ctx)
        : async (input) => ({
            _frontend: true,
            action: def.frontendAction,
            input,
          }),
    });
  }
  return out;
}

/**
 * Frontend descriptor list — the client uses this to know which incoming
 * tool calls it should handle locally (via the frontend tools bus).
 */
export function frontendTools() {
  return listTools({ frontend: true }).map((t) => ({
    name: t.name,
    action: t.frontendAction!,
    description: t.description,
    icon: t.icon,
  }));
}
