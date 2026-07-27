/** @doc Files panel — Kimi/Claude style: one button in chat opens the whole project (tree + content + export actions). */
import { useMemo, useState } from "react";
import { Copy, Download, Github, GitCompare, X, FileCode } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ProjectFile } from "@/lib/extractProjectFiles";
import { downloadProjectZip, pushProjectToGithub } from "@/lib/coderExport";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: ProjectFile[];
  projectName?: string;
  onOpenDiff?: () => void;
  canDiff?: boolean;
}

export default function CoderFilesPanel({
  open,
  onOpenChange,
  files,
  projectName = "megsy-project",
  onOpenDiff,
  canDiff,
}: Props) {
  const sorted = useMemo(() => [...files].sort((a, b) => a.path.localeCompare(b.path)), [files]);
  const [selected, setSelected] = useState<string | null>(null);
  const active = sorted.find((f) => f.path === selected) ?? sorted[0] ?? null;

  const copyActive = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.content);
    toast.success("File copied");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 gap-0 flex flex-col bg-background [&>button]:hidden"
      >
        <header className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
          <FileCode className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Files</span>
          <span className="text-xs text-muted-foreground">{sorted.length}</span>
          <div className="ml-auto flex items-center gap-1">
            {canDiff && onOpenDiff && (
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Diff" onClick={onOpenDiff}>
                <GitCompare className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Download ZIP"
              onClick={() => downloadProjectZip(files)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title="Push to GitHub"
              onClick={() => pushProjectToGithub(files, projectName)}
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav className="w-40 shrink-0 overflow-y-auto border-r border-border/40 p-1.5 sm:w-56">
            {sorted.length === 0 && <p className="p-2 text-xs text-muted-foreground">No files yet</p>}
            {sorted.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelected(f.path)}
                className={cn(
                  "block w-full truncate rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  active?.path === f.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
                title={f.path}
              >
                {f.path}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col">
            {active ? (
              <>
                <div className="flex items-center gap-2 border-b border-border/40 px-3 py-1.5">
                  <span className="truncate text-xs text-muted-foreground">{active.path}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-7 shrink-0 text-xs"
                    onClick={copyActive}
                  >
                    <Copy className="mr-1 h-3 w-3" /> Copy
                  </Button>
                </div>
                <pre className="flex-1 overflow-auto p-3 text-xs leading-relaxed text-foreground">
                  <code>{active.content}</code>
                </pre>
              </>
            ) : (
              <p className="p-4 text-xs text-muted-foreground">Nothing to show yet</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
