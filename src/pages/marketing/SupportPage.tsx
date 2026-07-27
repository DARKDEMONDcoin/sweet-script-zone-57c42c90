/** @doc Ask Tommy — Obsidian minimal AI support chat on pure black. */
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, Square, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { buildSupportSystemPrompt } from "@/data/supportKnowledge";
import tommyAvatar from "@/assets/tommy-avatar.png";

const STORAGE_KEY = "megsy_tommy_chat_v1";
const MAX_HISTORY = 40;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do credits work?",
  "How do I earn free credits?",
  "How do I cancel my subscription?",
  "Which image model is best?",
];

const loadHistory = (): Message[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(-MAX_HISTORY) : [];
  } catch {
    return [];
  }
};

const saveHistory = (messages: Message[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  } catch {
    /* ignore */
  }
};

const HEAD_FONT = '"Space Grotesk", "Inter", system-ui, sans-serif';
const BODY_FONT = '"DM Sans", "Inter", system-ui, sans-serif';

const SupportPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMsgRef = useRef<string>("");
  const { credits, plan } = useCredits();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus();
  }, [isStreaming]);

  const buildSystemPrompt = useCallback(async (): Promise<string> => {
    const ctx: string[] = [];
    try {
      const { data } = await supabase.auth.getUser();
      ctx.push(data?.user?.email ? `Signed-in user: ${data.user.email}` : "Guest user.");
    } catch {
      /* ignore */
    }
    if (typeof credits === "number") ctx.push(`Credits: ${credits} MC`);
    if (plan) ctx.push(`Plan: ${plan}`);

    return `You are Tommy, Megsy's warm, friendly AI support assistant. Keep replies concise, human, and helpful. Use clear markdown.\n\n${buildSupportSystemPrompt()}\n\n## Live user context\n${ctx.join("\n")}`;
  }, [credits, plan]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      lastUserMsgRef.current = trimmed;
      setNetworkError(false);

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsStreaming(true);

      const history = [...messages, userMsg]
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const customSystem = await buildSystemPrompt();
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-alibaba`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: history,
            customSystem,
            model: "qwen-max",
            tier: "max",
            useTools: false,
          }),
          signal: controller.signal,
        });

        if (!resp.ok || !resp.body) throw new Error(`status_${resp.status}`);

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: last.content + content };
                  }
                  return copy;
                });
              }
            } catch {
              break;
            }
          }
        }
      } catch (err: unknown) {
        const aborted =
          err instanceof Error && (err.name === "AbortError" || err.message === "cancelled");
        if (!aborted) {
          setNetworkError(true);
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant" && !last.content) copy.pop();
            return copy;
          });
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [buildSystemPrompt, isStreaming, messages],
  );

  const retry = useCallback(() => {
    if (lastUserMsgRef.current) void send(lastUserMsgRef.current);
  }, [send]);

  const newChat = useCallback(() => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
    setNetworkError(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    textareaRef.current?.focus();
  }, [isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) void send(input);
    }
  };

  const goBack = () =>
    window.history.length > 1 ? window.history.back() : navigate("/settings/support");

  return (
    <div
      className="relative flex h-[100dvh] flex-col overflow-hidden bg-black text-[#f5f5f5]"
      style={{ fontFamily: BODY_FONT }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 shrink-0 border-b border-[#1a1a1a] bg-black"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-3 px-5">
          <button
            onClick={goBack}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#1a1a1a]/40 text-[#f5f5f5] transition-colors hover:bg-[#1a1a1a]/60 active:scale-95"
          >
            <ArrowLeft className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-9 w-9 shrink-0">
              <img loading="lazy" decoding="async"
                src={tommyAvatar}
                alt="Tommy"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-[#1a1a1a]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#f5f5f5] ring-2 ring-black" />
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-[15px] font-semibold leading-tight text-[#f5f5f5]"
                style={{ fontFamily: HEAD_FONT }}
              >
                Tommy
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#a0a0a0]">
                AI assistant · online
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={newChat}
              className="h-9 rounded-full border border-[#1a1a1a] bg-[#1a1a1a]/40 px-4 text-[12.5px] font-medium text-[#f5f5f5] transition-colors hover:bg-[#1a1a1a]/60 active:scale-95"
            >
              New chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-5 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center pt-8 text-center">
              <img loading="lazy" decoding="async"
                src={tommyAvatar}
                alt="Tommy"
                width={96}
                height={96}
                className="mb-6 h-24 w-24 rounded-full ring-1 ring-[#1a1a1a]"
              />
              <h1
                className="text-[28px] font-semibold tracking-tight text-[#f5f5f5]"
                style={{ fontFamily: HEAD_FONT }}
              >
                Hi, I'm Tommy
              </h1>
              <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-[#a0a0a0]">
                Your personal Megsy assistant. Ask me about subscriptions, credits, models, or
                anything else — I'll help you out.
              </p>
              <div className="mt-10 grid w-full grid-cols-1 gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-[20px] border border-[#1a1a1a] bg-[#1a1a1a]/40 px-5 py-4 text-left text-[14px] text-[#f5f5f5] transition-all hover:bg-[#1a1a1a]/60 active:scale-[0.98]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-md bg-[#f5f5f5] px-4 py-2.5 text-[15px] leading-relaxed text-black">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] text-[15px] leading-relaxed text-[#f5f5f5]">
                      {msg.content ? (
                        <div className="rounded-[20px] rounded-bl-md border border-[#1a1a1a] bg-[#1a1a1a]/40 px-4 py-2.5">
                          <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-[20px] rounded-bl-md border border-[#1a1a1a] bg-[#1a1a1a]/40 px-4 py-3">
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a0a0]"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a0a0]"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a0a0]"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {networkError && (
                <div className="flex items-center gap-2 rounded-[20px] border border-[#3a1a1a] bg-[#1a0d0d] px-4 py-3 text-[13px] text-[#e5a0a0]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Something went wrong.</span>
                  <button
                    onClick={retry}
                    className="text-[12px] font-medium underline underline-offset-2"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div
        className="shrink-0 border-t border-[#1a1a1a] bg-black"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-2xl items-end gap-2 px-5 py-3"
        >
          <div className="flex flex-1 items-end gap-2 rounded-[24px] border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3 transition-colors focus-within:border-[#333]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message Tommy…"
              className="max-h-40 flex-1 resize-none bg-transparent text-[15px] leading-6 text-[#f5f5f5] outline-none placeholder:text-[#6b6b6b]"
            />
          </div>
          {isStreaming ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-black transition active:scale-95"
            >
              <Square className="h-4 w-4" fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-black transition active:scale-95 disabled:bg-[#1a1a1a] disabled:text-[#6b6b6b]"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
