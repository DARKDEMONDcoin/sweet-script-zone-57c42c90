// Client for the kimi-coder edge function (SSE agent loop).
// Emits typed events the UI can render as: todo list, files, bash logs, text.
import { supabase } from "@/integrations/supabase/client";


export type KimiTodo = { id: string; title: string; done: boolean };
export type KimiFile = { path: string; content: string };

export type KimiEvent =
  | { type: "start"; model: string }
  | { type: "text"; text: string }
  | { type: "todo"; todos: KimiTodo[] }
  | { type: "file"; path: string; content: string }
  | { type: "bash"; command: string; output: string; ok: boolean }
  | { type: "python"; code: string; output: string; ok: boolean }
  | { type: "integration"; kind: "github" | "supabase"; reason: string }
  | { type: "tool_call"; id: string; name: string; args: any }
  | { type: "done"; summary?: string; files: KimiFile[] }
  | { type: "error"; error: string };

const URL_ = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kimi-coder`;

/**
 * Build a "current project state" preamble so the backend edits existing
 * files instead of starting from scratch on every follow-up prompt.
 *
 * Strategy: give the model a full index of every file path first (so it knows
 * the shape of the project), then include full content for small/critical
 * files and truncated content for large ones. Budget is capped to keep total
 * prompt size reasonable.
 */
function buildContextPreamble(files?: KimiFile[]): string {
  if (!files || files.length === 0) return "";
  const CRITICAL = /(^|\/)(App|main|index|routes?|router)\.(tsx?|jsx?)$|package\.json$|index\.html$/i;
  // Aggressive budget so follow-ups stream fast. Bigger context = slower model.
  const totalSize = files.reduce((n, f) => n + f.content.length, 0);
  const TOTAL_BUDGET = totalSize > 200_000 ? 18_000 : totalSize > 100_000 ? 24_000 : 32_000;
  const sorted = [...files].sort((a, b) => {
    const ac = CRITICAL.test(a.path) ? 0 : 1;
    const bc = CRITICAL.test(b.path) ? 0 : 1;
    if (ac !== bc) return ac - bc;
    return a.content.length - b.content.length;
  });
  const index = files.map((f) => `- ${f.path} (${f.content.length} chars)`).join("\n");
  const blocks: string[] = [];
  let used = 0;
  for (const f of sorted) {
    const ext = (f.path.split(".").pop() || "txt").toLowerCase();
    const isCritical = CRITICAL.test(f.path);
    const maxForThis = isCritical ? 6_000 : 1_800;

    const remaining = TOTAL_BUDGET - used;
    if (remaining <= 400) break;
    const cap = Math.min(maxForThis, remaining - 200);
    const content = f.content.length > cap
      ? `${f.content.slice(0, cap)}\n/* …truncated ${f.content.length - cap} chars — ask for the rest if needed */`
      : f.content;
    const block = `\`\`\`${ext} ${f.path}\n${content}\n\`\`\``;
    used += block.length;
    blocks.push(block);
  }
  return [
    "You are continuing work on an EXISTING project. Modify files in place.",
    "Do NOT start over. Preserve routing, styling and structure. Only touch what's needed.",
    "",
    "PREFERRED EDIT FORMAT — search/replace patches (much faster and cheaper):",
    "For small/localized changes to an existing file, output a patch block:",
    "```patch <path>",
    "<<<<<<< SEARCH",
    "<exact existing lines to find, whitespace included>",
    "=======",
    "<new lines to replace them with>",
    ">>>>>>> REPLACE",
    "```",
    "You may include multiple SEARCH/REPLACE pairs per patch block. SEARCH must match EXACTLY.",
    "Use a full-file rewrite (```<lang> <path>) ONLY for new files, or when >60% of a file changes.",
    "",
    "--- Project file index ---",
    index,
    "--- Current file contents ---",
    blocks.join("\n\n"),
    "--- End of project files ---",
    "",
  ].join("\n");
}

export async function runKimiCoder({
  prompt,
  history,
  contextFiles,
  onEvent,
  signal,
}: {
  prompt: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  /** Files from the previous Coder run in this thread. Prepended to the prompt as context. */
  contextFiles?: KimiFile[];
  onEvent: (ev: KimiEvent) => void;
  signal?: AbortSignal;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const token = session?.access_token || anon;
  const preamble = buildContextPreamble(contextFiles);
  const finalPrompt = preamble ? `${preamble}\nUser request:\n${prompt}` : prompt;
  const resp = await fetch(URL_, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anon,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt: finalPrompt, history: (history ?? []).slice(-4) }),
    signal,
  });
  if (!resp.ok || !resp.body) {
    const txt = await resp.text().catch(() => "");
    let msg = txt || `http ${resp.status}`;
    try {
      const j = JSON.parse(txt);
      if (j?.paywall || j?.error === "upgrade_required") {
        msg = j.message || "Coder is available on paid plans only. Please upgrade to continue.";
      } else if (j?.message || j?.error) {
        msg = j.message || j.error;
      }
    } catch {}
    onEvent({ type: "error", error: msg });
    return;
  }
  // Some errors return 200 with a JSON body instead of an SSE stream
  // (e.g. paywall / upgrade_required). Detect and surface them instead of
  // silently waiting for `data:` frames that will never arrive.
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("text/event-stream")) {
    const txt = await resp.text().catch(() => "");
    let msg = txt || "Unexpected non-streaming response from Coder.";
    try {
      const j = JSON.parse(txt);
      if (j?.paywall || j?.error === "upgrade_required") {
        msg = j.message || "Coder is available on paid plans only. Please upgrade to continue.";
      } else if (j?.message || j?.error) {
        msg = j.message || j.error;
      }
    } catch {}
    onEvent({ type: "error", error: msg });
    return;
  }

  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") return;
      try {
        const obj = JSON.parse(payload);
        const ev = obj.event as string | undefined;
        if (!ev) continue;
        onEvent({ ...obj, type: ev } as KimiEvent);
      } catch {
        // ignore
      }
    }
  }
}
