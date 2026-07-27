import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from "lucide-react";

type AgentId = "general" | "research" | "code" | "media" | "data" | "orchestrator";

const AGENTS: { id: AgentId; label: string; desc: string }[] = [
  { id: "general", label: "General", desc: "الوكيل الافتراضي" },
  { id: "research", label: "Research", desc: "بحث وتوثيق" },
  { id: "code", label: "Code", desc: "برمجة وتنفيذ" },
  { id: "media", label: "Media", desc: "صور وفيديو وصوت" },
  { id: "data", label: "Data", desc: "بيانات ومساحة العمل" },
  { id: "orchestrator", label: "Orchestrator", desc: "يوزّع على وكلاء متخصصين" },
];

type ToolCall = { id: string; name: string; args: string; output?: unknown; done?: boolean };
type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tools?: ToolCall[];
};

const FN_URL = "https://ltgampdtawuefwwayncx.supabase.co/functions/v1/agent-run";

export default function AgentPage() {
  const [agent, setAgent] = useState<AgentId>("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const abortRef = useRef<AbortController | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    composerRef.current?.focus();
  }, [status]);

  const disabled = status !== "ready" || !input.trim();

  const runTurn = useCallback(
    async (userText: string) => {
      const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: userText };
      const asstId = crypto.randomUUID();
      setMessages((m) => [...m, userMsg, { id: asstId, role: "assistant", text: "", tools: [] }]);
      setStatus("submitted");

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setMessages((m) =>
          m.map((x) => (x.id === asstId ? { ...x, text: "سجّل الدخول أولاً لاستخدام الوكيل." } : x)),
        );
        setStatus("ready");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(FN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: (supabase as unknown as { supabaseKey: string }).supabaseKey ?? "",
          },
          body: JSON.stringify({
            agent,
            stream: true,
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.text })),
          }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`Agent ${res.status}: ${await res.text().catch(() => "")}`);
        }
        setStatus("streaming");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let currentEvent: string | null = null;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const raw of lines) {
            const line = raw.trimEnd();
            if (!line) { currentEvent = null; continue; }
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
              continue;
            }
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;

            if (currentEvent === "tool") {
              try {
                const t = JSON.parse(payload) as { id: string; name: string; args: string };
                setMessages((m) => m.map((x) =>
                  x.id === asstId
                    ? { ...x, tools: [...(x.tools ?? []), { id: t.id, name: t.name, args: t.args }] }
                    : x,
                ));
              } catch { /* ignore */ }
              continue;
            }
            if (currentEvent === "tool_result") {
              try {
                const t = JSON.parse(payload) as { id: string; name: string; output: unknown };
                setMessages((m) => m.map((x) =>
                  x.id === asstId
                    ? {
                        ...x,
                        tools: (x.tools ?? []).map((tc) =>
                          tc.id === t.id ? { ...tc, output: t.output, done: true } : tc,
                        ),
                      }
                    : x,
                ));
              } catch { /* ignore */ }
              continue;
            }
            // Regular chat token.
            try {
              const j = JSON.parse(payload);
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) {
                setMessages((m) => m.map((x) =>
                  x.id === asstId ? { ...x, text: x.text + delta } : x,
                ));
              }
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          setMessages((m) => m.map((x) =>
            x.id === asstId ? { ...x, text: x.text + `\n\n⚠️ ${String(err)}` } : x,
          ));
        }
      } finally {
        abortRef.current = null;
        setStatus("ready");
      }
    },
    [agent, messages],
  );

  const handleSubmit = useCallback(
    () => {
      const text = input.trim();
      if (!text || status !== "ready") return;
      setInput("");
      void runTurn(text);
    },
    [input, status, runTurn],
  );

  const activeAgent = useMemo(() => AGENTS.find((a) => a.id === agent) ?? AGENTS[0], [agent]);

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div className="text-sm">
            <div className="font-semibold">Megsy Agents</div>
            <div className="text-xs text-muted-foreground">{activeAgent.desc}</div>
          </div>
        </div>
        <Select value={agent} onValueChange={(v) => setAgent(v as AgentId)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENTS.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              ابدأ محادثة مع {activeAgent.label}
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.role === "assistant" && m.tools && m.tools.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {m.tools.map((tc) => (
                      <Tool key={tc.id} defaultOpen={false}>
                        <ToolHeader
                          type={`tool-${tc.name}` as `tool-${string}`}
                          state={tc.done ? "output-available" : "input-streaming"}
                        />
                        <ToolContent>
                          <ToolInput input={safeParse(tc.args)} />
                          {tc.done && <ToolOutput output={<pre className="text-xs whitespace-pre-wrap">{JSON.stringify(tc.output, null, 2)}</pre>} errorText={undefined} />}
                        </ToolContent>
                      </Tool>
                    ))}
                  </div>
                )}
                {m.role === "assistant" && !m.text && status !== "ready" ? (
                  <Shimmer>يفكّر...</Shimmer>
                ) : (
                  <MessageResponse>{m.text}</MessageResponse>
                )}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-3">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            ref={composerRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`اسأل ${activeAgent.label}...`}
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={disabled} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

function safeParse(s: string): unknown {
  try { return JSON.parse(s || "{}"); } catch { return s; }
}
