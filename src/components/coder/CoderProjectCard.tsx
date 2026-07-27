/** @doc Compact card that renders a saved Megsy Coder project in the chat history — replaces raw fenced markdown. */
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { FileCode, Eye, Pencil, ExternalLink, Github, Download, Sparkles, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ProjectFile } from "@/lib/extractProjectFiles";
import { downloadProjectZip, pushProjectToGithub } from "@/lib/coderExport";
import { saveCheckpoint, undoCheckpoint, listCheckpoints } from "@/lib/coderCheckpoints";

const CoderStudioModal = lazy(() => import("@/components/coder/CoderStudioModal"));
const ArtifactCanvas = lazy(() => import("@/components/chat/ArtifactCanvas"));

interface Props {
  files: ProjectFile[];
  summary?: string;
  /** Stable identifier for checkpoint history — defaults to derived hash. */
  projectId?: string;
}

export default function CoderProjectCard({ files: initialFiles, summary, projectId }: Props) {
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const pid = useMemo(
    () => projectId || `pc:${initialFiles.length}:${initialFiles[0]?.path || ""}:${(summary || "").slice(0, 40)}`,
    [projectId, initialFiles, summary],
  );
  const [canUndo, setCanUndo] = useState(false);
  useEffect(() => {
    saveCheckpoint(pid, files, "edit");
    setCanUndo(listCheckpoints(pid).length > 1);
  }, [pid, files]);
  const fileNames = useMemo(() => files.slice(0, 6).map((f) => f.path), [files]);
  const remaining = Math.max(0, files.length - fileNames.length);

  const handleUndo = () => {
    const prev = undoCheckpoint(pid);
    if (!prev) { toast.info("No previous version"); return; }
    setFiles(prev.files);
    toast.success("Reverted to previous version");
  };

  const handlePublish = async () => {
    if (files.length === 0) return;
    setPublishing(true);
    try {
      const { publishProject } = await import("@/lib/publishProject");
      const title = summary?.split("\n")[0]?.slice(0, 80) || "Megsy Project";
      const { url } = await publishProject(files, { title });
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Published — link copied", { description: url });
      } catch {
        toast.success("Published", { description: url });
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Publish failed";
      if (/sign in/i.test(msg)) {
        toast.error("Sign in to publish", {
          description: "Publishing saves your project so anyone with the link can view it.",
          action: { label: "Sign in", onClick: () => { window.location.href = "/auth"; } },
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="my-3 w-full rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-950/90 to-neutral-900/80 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">Megsy Coder project</div>
          <div className="text-[11px] text-white/60">{files.length} files</div>
        </div>
      </div>

      {fileNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-white/10">
          {fileNames.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] font-mono text-white/70 border border-white/5"
            >
              <FileCode className="h-3 w-3 text-white/40" />
              {p}
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-[11px] text-white/40 self-center">+{remaining} more</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 px-4 py-3">
        <Button size="sm" onClick={() => setCanvasOpen(true)} className="h-8 text-xs">
          <Eye className="h-3.5 w-3.5 mr-1" /> Preview
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStudioOpen(true)} className="h-8 text-xs">
          <Pencil className="h-3.5 w-3.5 mr-1" /> Open Studio
        </Button>
        <Button size="sm" variant="ghost" onClick={handlePublish} disabled={publishing} className="h-8 text-xs text-white/80">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          {publishing ? "Publishing…" : "Publish"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => downloadProjectZip(files)}
          className="h-8 text-xs text-white/80"
        >
          <Download className="h-3.5 w-3.5 mr-1" /> Download ZIP
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => pushProjectToGithub(files, (summary?.split("\n")[0] || "megsy-project").slice(0, 40))}
          className="h-8 text-xs text-white/80"
        >
          <Github className="h-3.5 w-3.5 mr-1" /> Push to GitHub
        </Button>
        {canUndo && (
          <Button size="sm" variant="ghost" onClick={handleUndo} className="h-8 text-xs text-white/80">
            <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
          </Button>
        )}

      </div>

      <Suspense fallback={null}>
        {canvasOpen && (
          <ArtifactCanvas open={canvasOpen} onOpenChange={setCanvasOpen} content={summary || ""} files={files} />
        )}
        {studioOpen && (
          <CoderStudioModal
            open={studioOpen}
            onClose={() => setStudioOpen(false)}
            initialFiles={files}
            onFilesChange={setFiles}
          />
        )}
      </Suspense>
    </div>
  );
}
