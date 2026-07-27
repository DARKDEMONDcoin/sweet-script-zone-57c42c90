/** @doc Preview panel — Kimi/Manus style: one button in chat opens the live running project full-screen. */
import { useMemo, useState } from "react";
import { X, RefreshCw, ExternalLink, Terminal, Monitor } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/lib/extractProjectFiles";
import { buildReactRuntimeHtml, isReactProject } from "@/lib/buildReactRuntime";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  title?: string;
  logs?: { command: string; output: string; ok: boolean }[];
  publishing?: boolean;
  onPublish?: () => void;
}

export default function CoderPreviewPanel({
  open,
  onOpenChange,
  files,
  title = "Megsy Project",
  logs = [],
  publishing,
  onPublish,
}: Props) {
  const [tab, setTab] = useState<"preview" | "logs">("preview");
  const [nonce, setNonce] = useState(0);

  const html = useMemo(() => {
    if (files.length === 0) return "";
    if (isReactProject(files)) return buildReactRuntimeHtml(files, title);
    const indexHtml = files.find((f) => /(^|\/)index\.html$/i.test(f.path));
    return indexHtml ? indexHtml.content : buildReactRuntimeHtml(files, title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, title, nonce]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95dvh] w-full p-0 gap-0 flex flex-col bg-background [&>button]:hidden"
      >
        <header className="flex items-center gap-1 border-b border-border/40 px-3 py-2">
          {(
            [
              { id: "preview", label: "Preview", icon: Monitor },
              { id: "logs", label: "Logs", icon: Terminal },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                tab === t.id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Reload"
              onClick={() => setNonce((n) => n + 1)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onPublish && (
              <Button size="sm" className="h-8 text-xs" disabled={publishing} onClick={onPublish}>
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                {publishing ? "…" : "Publish"}
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {tab === "preview" ? (
          <iframe
            key={nonce}
            title="Project preview"
            srcDoc={html}
            className="min-h-0 w-full flex-1 border-0 bg-white"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-xs">
            {logs.length === 0 && <p className="text-muted-foreground">No commands yet</p>}
            {logs.map((b, i) => (
              <div key={i} className="mb-2">
                <div className={cn("font-semibold", b.ok ? "text-primary" : "text-destructive")}>$ {b.command}</div>
                <div className="whitespace-pre-wrap text-muted-foreground">{b.output}</div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
