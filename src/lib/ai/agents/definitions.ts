/**
 * Agent definitions — system prompts + allowed tools per role.
 * Consumed by runAgentTurn to build the runtime for a given AgentId.
 */

export type AgentId = "general" | "research" | "code" | "media" | "data" | "orchestrator";

export interface AgentDefinition {
  id: AgentId;
  label: string;
  description: string;
  model: string;
  systemPrompt: string;
  /** Undefined = all registered tools. */
  tools?: string[];
  /** Max tool-loop steps. */
  maxSteps?: number;
}

const BASE_STYLE =
  "Be concise. Prefer tools over guessing. Cite sources when available. Respect RTL when replying in Arabic.";

export const AGENTS: Record<AgentId, AgentDefinition> = {
  general: {
    id: "general",
    label: "General Assistant",
    description: "Default agent with access to every tool.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy, a general-purpose assistant. ${BASE_STYLE}`,
    maxSteps: 50,
  },
  research: {
    id: "research",
    label: "Research Agent",
    description: "Focused on gathering, comparing and citing web information.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy Research. Investigate thoroughly using search tools. Always cite sources. ${BASE_STYLE}`,
    tools: ["web_search", "get_current_time"],
    maxSteps: 50,
  },
  code: {
    id: "code",
    label: "Code Agent",
    description: "Reads and writes code, runs quick sandboxes.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy Code. Reason step by step, prefer runnable code and small diffs. ${BASE_STYLE}`,
    tools: ["get_current_time"],
    maxSteps: 50,
  },
  media: {
    id: "media",
    label: "Media Agent",
    description: "Generates and edits images, video, audio.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy Media. Focus on visual generation quality; ask for missing constraints only when critical. ${BASE_STYLE}`,
    tools: ["get_current_time"],
    maxSteps: 30,
  },
  data: {
    id: "data",
    label: "Data Agent",
    description: "Queries and summarizes workspace/user data.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy Data. Query cautiously; ask before destructive actions. ${BASE_STYLE}`,
    tools: ["get_current_time", "delete_conversation"],
    maxSteps: 30,
  },
  orchestrator: {
    id: "orchestrator",
    label: "Orchestrator",
    description: "Delegates to specialized sub-agents in parallel.",
    model: "google/gemini-3.6-flash",
    systemPrompt: `You are Megsy Orchestrator. Break the task down and delegate subtasks to research/code/media/data agents using the delegate_to_agent tool. Combine results into a single final answer. ${BASE_STYLE}`,
    maxSteps: 20,
  },
};

export function getAgent(id: string | undefined): AgentDefinition {
  if (id && id in AGENTS) return AGENTS[id as AgentId];
  return AGENTS.general;
}

export function listAgents(): AgentDefinition[] {
  return Object.values(AGENTS);
}
