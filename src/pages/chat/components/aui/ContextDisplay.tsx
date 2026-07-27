import { useState } from "react";
import {
  Cpu,
  Clock,
  Zap,
  Layers,
  Wrench,
  Paperclip,
  BrainCircuit,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { estimateTokens, formatTokens } from "@/pages/chat/utils/estimateTokens";
import type { ToolPart } from "@/pages/chat/chatConstants";
import { getDomain } from "./SourcesList";

interface ContextDisplayProps {
  modelLabel?: string | null;
  mode?: string | null;
  timing?: {
    startedAt?: number;
    firstTokenAt?: number;
    finishedAt?: number;
    ttftMs?: number;
    durationMs?: number;
  };
  content?: string;
  toolParts?: ToolPart[];
  attachedImages?: string[];
  attachedFiles?: { name?: string; type?: string }[];
  reasoning?: string | null;
  sources?: { url?: string; title?: string }[];
  dir?: "ltr" | "rtl";
}

function formatDuration(ms: number | undefined): string {
  if (!ms || ms < 0) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)}s`;
}

function tokensPerSec(tokens: number, ms: number): string {
  if (!ms || ms <= 0) return "-";
  const sec = ms / 1000;
  return `${(tokens / sec).toFixed(1)} tok/s`;
}

export function ContextDisplay({
  modelLabel,
  mode,
  timing,
  content,
  toolParts,
  attachedImages,
  attachedFiles,
  reasoning,
  sources,
  dir = "ltr",
}: ContextDisplayProps) {
  const [open, setOpen] = useState(false);
  const tokenCount = content ? estimateTokens(content) : 0;
  const duration = timing?.durationMs;
  const ttft = timing?.ttftMs;
  const hasReasoning = !!reasoning && reasoning.trim().length > 0;
  const hasTools = !!toolParts && toolParts.length > 0;
  const hasAttachments =
    (!!attachedImages && attachedImages.length > 0) ||
    (!!attachedFiles && attachedFiles.length > 0);
  const hasSources = !!sources && sources.length > 0;

  const summaryParts: string[] = [];
  if (modelLabel) summaryParts.push(modelLabel);
  if (duration && duration > 0) summaryParts.push(formatDuration(duration));
  if (tokenCount > 0) summaryParts.push(`~${formatTokens(tokenCount)} tok`);

  if (summaryParts.length === 0 && !hasTools && !hasReasoning && !hasSources) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 ms-1 px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors tabular-nums"
          dir="ltr"
          aria-label="Message context"
        >
          <Cpu className="w-3 h-3" />
          <span>{summaryParts.join(" · ") || "Context"}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={dir === "rtl" ? "end" : "start"}
        side="top"
        sideOffset={6}
        className="w-72 p-0 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-[0_24px_56px_-18px_rgba(0,0,0,0.7)]"
        dir={dir}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
          <span className="text-[12px] font-semibold text-foreground/90">Context</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 space-y-2.5 text-[12px]">
          {modelLabel && (
            <div className="flex items-start gap-2">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Model</div>
                <div className="font-medium text-foreground truncate">{modelLabel}</div>
              </div>
            </div>
          )}
          {mode && (
            <div className="flex items-start gap-2">
              <Layers className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Mode</div>
                <div className="font-medium text-foreground capitalize">{mode.replace(/-/g, " ")}</div>
              </div>
            </div>
          )}
          {(!!duration || !!ttft) && (
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Timing</div>
                <div className="font-medium text-foreground tabular-nums">
                  {duration ? `Total ${formatDuration(duration)}` : ""}
                  {duration && ttft ? " · " : ""}
                  {ttft ? `TTFT ${formatDuration(ttft)}` : ""}
                </div>
              </div>
            </div>
          )}
          {tokenCount > 0 && (
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Output</div>
                <div className="font-medium text-foreground tabular-nums">
                  ~{formatTokens(tokenCount)} tokens
                  {duration && duration > 0 ? ` · ${tokensPerSec(tokenCount, duration)}` : ""}
                </div>
              </div>
            </div>
          )}
          {hasReasoning && (
            <div className="flex items-start gap-2">
              <BrainCircuit className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Reasoning</div>
                <div className="font-medium text-foreground">Included</div>
              </div>
            </div>
          )}
          {hasTools && (
            <div className="flex items-start gap-2">
              <Wrench className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Tools</div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {toolParts!.map((tp) => (
                    <span
                      key={tp.id}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-secondary/60 border border-border/40 text-[11px] text-foreground"
                    >
                      {tp.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {hasAttachments && (
            <div className="flex items-start gap-2">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Attachments</div>
                <div className="font-medium text-foreground">
                  {attachedImages?.length ? `${attachedImages.length} image(s)` : ""}
                  {attachedImages?.length && attachedFiles?.length ? " · " : ""}
                  {attachedFiles?.length ? `${attachedFiles.length} file(s)` : ""}
                </div>
              </div>
            </div>
          )}
          {hasSources && (
            <div className="flex items-start gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-muted-foreground">Sources</div>
                <div className="flex flex-col gap-0.5 mt-0.5">
                  {sources!.slice(0, 5).map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline truncate"
                      title={s.title || s.url}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {s.title || (s.url ? getDomain(s.url) : "Source")}
                    </a>
                  ))}
                  {sources!.length > 5 && (
                    <span className="text-[11px] text-muted-foreground">+{sources!.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
