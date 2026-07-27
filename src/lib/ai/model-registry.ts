/**
 * Unified model registry across the app.
 *
 * The existing chat pipeline routes via Alibaba/DashScope directly.
 * The new AI SDK agent runtime uses the Lovable AI Gateway for models
 * that are best served through it (google/*, openai/*, etc).
 *
 * This registry is metadata only — no keys, no requests.
 */

export type ModelCapability = "tools" | "vision" | "reasoning" | "long-context" | "fast";

export type ModelBackend = "alibaba" | "lovable-gateway";

export interface ModelDescriptor {
  /** id as sent to the backend (Alibaba model name, or gateway "vendor/model") */
  id: string;
  /** display label for UI */
  label: string;
  backend: ModelBackend;
  capabilities: ModelCapability[];
  /** approximate context window in tokens */
  contextWindow?: number;
  /** hidden from selectors when true (used only programmatically) */
  hidden?: boolean;
}

export const MODEL_REGISTRY: Record<string, ModelDescriptor> = {
  // ─── Alibaba (existing chat pipeline) ─────────────────────────────
  "qwen-max": {
    id: "qwen-max",
    label: "Qwen Max",
    backend: "alibaba",
    capabilities: ["tools", "vision", "long-context"],
    contextWindow: 32_000,
  },
  "qwen-plus": {
    id: "qwen-plus",
    label: "Qwen Plus",
    backend: "alibaba",
    capabilities: ["tools", "fast"],
    contextWindow: 131_000,
  },
  "qwen-turbo": {
    id: "qwen-turbo",
    label: "Qwen Turbo",
    backend: "alibaba",
    capabilities: ["fast"],
    contextWindow: 8_000,
  },

  // ─── Lovable AI Gateway (new agent runtime) ───────────────────────
  "google/gemini-3.6-flash": {
    id: "google/gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    backend: "lovable-gateway",
    capabilities: ["tools", "vision", "reasoning", "fast", "long-context"],
    contextWindow: 1_000_000,
  },
};

export const DEFAULT_AGENT_MODEL = "google/gemini-3.6-flash";
export const DEFAULT_CHAT_MODEL = "qwen-plus";

export function getModel(id: string): ModelDescriptor | undefined {
  return MODEL_REGISTRY[id];
}

export function listModels(filter?: { backend?: ModelBackend; capability?: ModelCapability }) {
  return Object.values(MODEL_REGISTRY).filter((m) => {
    if (m.hidden) return false;
    if (filter?.backend && m.backend !== filter.backend) return false;
    if (filter?.capability && !m.capabilities.includes(filter.capability)) return false;
    return true;
  });
}

export function hasCapability(id: string, cap: ModelCapability): boolean {
  return getModel(id)?.capabilities.includes(cap) ?? false;
}
