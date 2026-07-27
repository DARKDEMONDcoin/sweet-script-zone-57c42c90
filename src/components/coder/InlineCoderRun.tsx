/** @doc Megsy Coder inline run — renders todo/files/terminal/integration cards INSIDE the chat feed (not modal). */
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Check, FileCode, X, Github, Database, Eye, ChevronDown, PlayCircle } from "lucide-react";
import { runKimiCoder, type KimiEvent, type KimiFile, type KimiTodo } from "@/lib/kimiCoder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { publishProject } from "@/lib/publishProject";
import { toast } from "sonner";
import { extractProjectFiles, ensureProjectScaffold, type ProjectFile } from "@/lib/extractProjectFiles";
import { extractPatchBlocks, applyPatchBlocks } from "@/lib/coderPatch";
import { getCoderIntegrationStatus } from "@/lib/coderExport";

import { startIntegrationConnection, waitForConnectionRefresh, loadIntegrationConnections } from "@/lib/integrationBackend";
import { integrations as integrationsCatalog } from "@/lib/integrationsData";
import { autoFixProjectFiles } from "@/lib/coderAutoFix";
import { detectRequiredIntegrations } from "@/lib/coderIntegrationDetect";
import { Spinner } from "@/components/ui/spinner";

const CoderDiffModal = lazy(() => import("@/components/coder/CoderDiffModal"));
const CoderFilesPanel = lazy(() => import("@/components/coder/CoderFilesPanel"));
const CoderPreviewPanel = lazy(() => import("@/components/coder/CoderPreviewPanel"));


type BashLog = { command: string; output: string; ok: boolean };
type IntegrationReq = { kind: "github" | "supabase"; reason: string; state: "pending" | "connected" | "skipped" };

interface Props {
  runId: string;
  prompt: string;
  onClose: () => void;
  onFinish?: (files: KimiFile[], summary?: string) => void;
  /** Files from previous Coder run in the same thread — sent as edit context. */
  previousFiles?: KimiFile[];
  /** Prior conversation turns for continuity. */
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

// Module-level cache so remounts of the parent don't re-fetch or abort the SSE run.
type RunEntry = {
  events: KimiEvent[];
  subs: Set<(ev: KimiEvent) => void>;
  finished: boolean;
  controller: AbortController;
};
const CODER_RUNS = new Map<string, RunEntry>();

function collectFilesFromEvents(events: KimiEvent[]): KimiFile[] {
  const merged = new Map<string, string>();
  const text = events
    .filter((ev): ev is Extract<KimiEvent, { type: "text" }> => ev.type === "text")
    .map((ev) => ev.text)
    .join("\n\n");
  for (const file of extractProjectFiles(text)) merged.set(file.path, file.content);
  for (const ev of events) {
    if (ev.type === "file") merged.set(ev.path, ev.content);
    if (ev.type === "done") for (const file of ev.files || []) merged.set(file.path, file.content);
  }
  return Array.from(merged.entries()).map(([path, content]) => ({ path, content }));
}

function subscribeCoderRun(
  runId: string,
  prompt: string,
  onEvent: (ev: KimiEvent) => void,
  opts?: { previousFiles?: KimiFile[]; history?: Array<{ role: "user" | "assistant"; content: string }> },
): () => void {
  let entry = CODER_RUNS.get(runId);
  if (!entry) {
    const controller = new AbortController();
    const nextEntry: RunEntry = { events: [], subs: new Set(), finished: false, controller };
    const emit = (ev: KimiEvent) => {
      nextEntry.events.push(ev);
      if (ev.type === "done" || ev.type === "error") nextEntry.finished = true;
      nextEntry.subs.forEach((s) => { try { s(ev); } catch { /* ignore */ } });
    };
    entry = nextEntry;
    CODER_RUNS.set(runId, nextEntry);
    runKimiCoder({
      prompt,
      history: opts?.history,
      contextFiles: opts?.previousFiles,
      signal: controller.signal,
      onEvent: emit,
    }).then(() => {
      if (nextEntry.finished || controller.signal.aborted) return;
      const files = collectFilesFromEvents(nextEntry.events);
      if (files.length > 0) {
        emit({ type: "done", files, summary: "Project generated." });
      } else {
        emit({ type: "error", error: "The connection ended before the project finished generating. Please try again." });
      }
    }).catch((e) => {
      const ev: KimiEvent = { type: "error", error: e?.message || "network error" };
      emit(ev);
    });
  }

  for (const ev of entry.events) { try { onEvent(ev); } catch { /* ignore */ } }
  entry.subs.add(onEvent);
  const activeEntry = entry;
  return () => { activeEntry.subs.delete(onEvent); };
}

function abortCoderRun(runId: string) {
  const entry = CODER_RUNS.get(runId);
  if (!entry) return;
  try { entry.controller.abort(); } catch { /* ignore */ }
  CODER_RUNS.delete(runId);
}

export default function InlineCoderRun({ runId, prompt, onClose, onFinish, previousFiles, history }: Props) {
  const instId = useRef(Math.random().toString(36).slice(2, 6)).current;
  const [todos, setTodos] = useState<KimiTodo[]>([]);
  const [files, setFiles] = useState<Map<string, string>>(new Map());
  const [bash, setBash] = useState<BashLog[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationReq[]>([]);
  const [status, setStatus] = useState<"running" | "done" | "error">("running");
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const [collapsed, setCollapsed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);

  const finished = useRef(false);
  const filesRef = useRef<Map<string, string>>(new Map());
  const notesRef = useRef("");
  const integStatusRef = useRef<{ github: boolean; supabase: boolean }>({ github: false, supabase: false });
  

  

  const mergeProjectFiles = (projectFiles: ProjectFile[]) => {
    if (projectFiles.length === 0) return;
    setFiles((prev) => {
      const next = new Map(prev);
      for (const file of projectFiles) next.set(file.path, file.content);
      filesRef.current = next;
      return next;
    });
    setSelectedFile((cur) => cur ?? projectFiles[0]?.path ?? null);
  };

  /** Merge backend-emitted and locally-detected integration needs (no duplicates). */
  const addIntegrations = (reqs: { kind: "github" | "supabase"; reason: string }[]) => {
    if (reqs.length === 0) return;
    setIntegrations((prev) => {
      const next = [...prev];
      for (const r of reqs) {
        if (next.some((p) => p.kind === r.kind)) continue;
        next.push({ ...r, state: integStatusRef.current[r.kind] ? "connected" : "pending" });
      }
      return next;
    });
    void getCoderIntegrationStatus().then((s) => {
      integStatusRef.current = { github: s.github, supabase: s.supabase };
      setIntegrations((prev) =>
        prev.map((p) => (s[p.kind] && p.state === "pending" ? { ...p, state: "connected" } : p)),
      );
    }).catch(() => {});
  };

  const appliedPatchesRef = useRef<Set<string>>(new Set());
  const applyPatchesFromNotes = (raw: string) => {
    const patches = extractPatchBlocks(raw);
    if (patches.length === 0) return;
    const fresh = patches.filter((p) => {
      const key = `${p.path}::${p.search.length}::${p.search.slice(0, 40)}`;
      if (appliedPatchesRef.current.has(key)) return false;
      appliedPatchesRef.current.add(key);
      return true;
    });
    if (fresh.length === 0) return;
    const current = Array.from(filesRef.current.entries()).map(([path, content]) => ({
      path, content, lang: (path.split(".").pop() || "txt").toLowerCase(),
    }));
    const { files: patched } = applyPatchBlocks(current, fresh);
    mergeProjectFiles(patched);
  };

  // Seed with the previous run's files so a follow-up turn edits the existing
  // project instead of shrinking it to whatever the model re-emitted.
  useEffect(() => {
    if (!previousFiles?.length) return;
    setFiles((prev) => {
      if (prev.size > 0) return prev;
      const next = new Map(prev);
      for (const f of previousFiles) next.set(f.path, f.content);
      filesRef.current = next;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  // Watchdog: if the stream goes silent after producing files (dropped SSE tail,
  // worker timeout), finalize instead of showing "Building…" forever.
  const lastEventRef = useRef(Date.now());
  const sawEventRef = useRef(false);
  const finalizeFromRef = (summary?: string) => {
    if (finished.current || filesRef.current.size === 0) return false;
    finished.current = true;
    const scaffolded = ensureProjectScaffold(
      autoFixProjectFiles(
        Array.from(filesRef.current.entries()).map(([path, content]) => ({
          path, content, lang: (path.split(".").pop() || "txt").toLowerCase(),
        })),
      ),
    );
    addIntegrations(detectRequiredIntegrations(prompt, scaffolded));
    mergeProjectFiles(scaffolded);
    setStatus("done");
    onFinish?.(scaffolded.map(({ path, content }) => ({ path, content })), summary ?? notesRef.current.slice(0, 500));
    return true;
  };

  useEffect(() => {
    lastEventRef.current = Date.now();
    sawEventRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const idle = Date.now() - lastEventRef.current;
      // Never finalize a run that hasn't emitted anything yet — the model may
      // still be thinking. Only give up (with a clear error) after 3 minutes.
      if (!sawEventRef.current) {
        if (idle > 180_000 && !finished.current) {
          finished.current = true;
          setStatus("error");
          setError("The build didn't start — the connection timed out. Please try again.");
        }
        return;
      }
      if (idle > 45_000) {
        if (finalizeFromRef()) return;
        // Stream went silent without producing a single file: stop pretending
        // we're still building.
        if (idle > 90_000 && !finished.current) {
          finished.current = true;
          setStatus("error");
          setError("The build stopped before producing any files. Please try again.");
        }
      }
    }, 5_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const unsub = subscribeCoderRun(runId, prompt, (ev: KimiEvent) => {
      lastEventRef.current = Date.now();
      sawEventRef.current = true;
      if (ev.type === "todo") setTodos(ev.todos);

      else if (ev.type === "text") {
        const next = `${notesRef.current}${notesRef.current && ev.text ? "\n\n" : ""}${ev.text || ""}`;
        notesRef.current = next;
        setNotes(next);
        mergeProjectFiles(extractProjectFiles(next));
        applyPatchesFromNotes(next);
      }
      else if (ev.type === "file") {
        setFiles((prev) => {
          const next = new Map(prev);
          next.set(ev.path, ev.content);
          filesRef.current = next;
          return next;
        });
        setSelectedFile((cur) => cur ?? ev.path);
      } else if (ev.type === "bash")
        setBash((prev) => [...prev, { command: ev.command, output: ev.output, ok: ev.ok }]);
      else if (ev.type === "integration") {
        setIntegrations((prev) => {
          if (prev.find((p) => p.kind === ev.kind)) return prev;
          const preState = integStatusRef.current[ev.kind] ? "connected" : "pending";
          return [...prev, { kind: ev.kind, reason: ev.reason, state: preState }];
        });
        getCoderIntegrationStatus().then((s) => {
          integStatusRef.current = { github: s.github, supabase: s.supabase };
          if ((ev.kind === "github" && s.github) || (ev.kind === "supabase" && s.supabase)) {
            setIntegrations((prev) => prev.map((p) => (p.kind === ev.kind ? { ...p, state: "connected" } : p)));
          }
        }).catch(() => {});
      } else if (ev.type === "done") {
        if (finished.current) return;
        finished.current = true;
        // Merge (never replace): late-parsed files, streamed `file` events,
        // patched files and the backend's own file list all contribute.
        mergeProjectFiles(extractProjectFiles(notesRef.current));
        applyPatchesFromNotes(notesRef.current);
        const merged = new Map(filesRef.current);
        for (const f of ev.files || []) if (f?.path) merged.set(f.path, f.content ?? "");
        filesRef.current = merged;
        const scaffolded = ensureProjectScaffold(
          autoFixProjectFiles(
            Array.from(merged.entries()).map(([path, content]) => ({
              path, content, lang: (path.split(".").pop() || "txt").toLowerCase(),
            })),
          ),
        );
        addIntegrations(detectRequiredIntegrations(prompt, scaffolded));
        mergeProjectFiles(scaffolded);
        const finalFiles = scaffolded.map(({ path, content }) => ({ path, content }));
        setStatus("done");
        onFinish?.(finalFiles, ev.summary || notesRef.current.slice(0, 500));
      } else if (ev.type === "error") {
        if (finished.current) return;
        // Fallback: if the stream errored/closed but we already have files,
        // treat as done so the user can preview/publish/download.
        if (finalizeFromRef()) return;
        setStatus("error");
        setError(ev.error);

      }
    }, { previousFiles, history });
    return () => { unsub(); };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);
  // Pre-warm integration status once so integration cards render without a "pending" flash.
  useEffect(() => {
    getCoderIntegrationStatus().then((s) => {
      integStatusRef.current = { github: s.github, supabase: s.supabase };
    }).catch(() => {});
  }, []);

  const doneCount = todos.filter((t) => t.done).length;
  const fileList = useMemo(() => Array.from(files.keys()).sort(), [files]);
  const runningLabel =
    todos.length > 0
      ? `Building… ${doneCount}/${todos.length} · ${files.size} files`
      : files.size > 0
        ? `Building… finalizing · ${files.size} files`
        : "Building… preparing";

  const projectFiles = useMemo<ProjectFile[]>(
    () => Array.from(files.entries()).map(([path, content]) => ({
      path,
      content,
      lang: (path.split(".").pop() || "txt").toLowerCase(),
    })),
    [files],
  );


  const handlePreview = async () => {
    if (projectFiles.length === 0) {
      toast.error("No files yet");
      return;
    }
    setPublishing(true);
    try {
      const { url } = await publishProject(projectFiles, { title: prompt.slice(0, 60), prompt });
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Published — link copied", { description: url });
      } catch {
        toast.success("Published", { description: url });
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      const msg = e?.message || "Publish failed";
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

  const updateIntegration = (kind: "github" | "supabase", state: "connected" | "skipped") => {
    setIntegrations((prev) => prev.map((p) => (p.kind === kind ? { ...p, state } : p)));
  };

  const connectIntegration = async (kind: "github" | "supabase") => {
    const integration = integrationsCatalog.find((i) => i.app === kind);
    if (!integration) {
      toast.error(`${kind} integration not available`);
      return;
    }
    try {
      // Fast path: already connected via /integrations.
      const status = await getCoderIntegrationStatus();
      if ((kind === "github" && status.github) || (kind === "supabase" && status.supabase)) {
        updateIntegration(kind, "connected");
        toast.success(`${kind === "github" ? "GitHub" : "Supabase"} already connected`);
        return;
      }
      const result = await startIntegrationConnection(integration);
      if (result.mode === "local") {
        updateIntegration(kind, "connected");
        toast.success(`${kind === "github" ? "GitHub" : "Supabase"} connected`);
        return;
      }
      toast.success(`Finish connecting ${kind} in the popup`);
      await waitForConnectionRefresh(async () => {
        const snap = await loadIntegrationConnections([integration]);
        return !!snap.connectedApps[integration.app];
      }, (result as any).popup);
      updateIntegration(kind, "connected");
      toast.success(`${kind === "github" ? "GitHub" : "Supabase"} connected`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${kind} connect failed`);
    }
  };

  return (
    <div className="theme-fixed coder-fixed my-4 w-full overflow-hidden rounded-2xl border border-border/40 bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {status === "running" ? (
            <Spinner className="h-4 w-4 text-primary" />
          ) : status === "done" ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">Megsy Coder</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {status === "running"
              ? runningLabel
              : status === "done"
                ? `Done · ${files.size} files`
                : `Error: ${error}`}
          </div>
        </div>
        <Button
          aria-label={collapsed ? "Expand" : "Collapse"}
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setCollapsed((c) => !c)}
        >
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
        </Button>
        <Button aria-label="Close" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {!collapsed && (
        <>
          {/* Plan */}
          {todos.length > 0 && (
            <ul className="space-y-1.5 px-4 pb-3">
              {todos.map((t) => (
                <li key={t.id} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                      t.done ? "bg-primary text-primary-foreground" : "border border-border",
                    )}
                  >
                    {t.done && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className={cn("text-[13px] text-foreground", t.done && "text-muted-foreground line-through")}>
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Integrations */}
          {integrations.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {integrations.map((ig) => (
                <div
                  key={ig.kind}
                  className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-border/40 px-3 py-2"
                >
                  {ig.kind === "github" ? (
                    <Github className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Database className="h-4 w-4 text-primary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium capitalize text-foreground">
                      Connect {ig.kind === "github" ? "GitHub" : "Supabase"}
                    </div>
                    <div className="truncate text-[10px] text-muted-foreground">{ig.reason}</div>
                  </div>
                  {ig.state === "pending" ? (
                    <>
                      <Button size="sm" className="h-7 text-xs" onClick={() => connectIntegration(ig.kind)}>
                        Connect
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => updateIntegration(ig.kind, "skipped")}
                      >
                        Skip
                      </Button>
                    </>
                  ) : (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        ig.state === "connected" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ig.state === "connected" ? "Connected" : "Skipped"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* The only two actions — files & preview */}
          {files.size > 0 && (
            <div className="flex items-center gap-2 border-t border-border/40 px-4 py-2.5">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 flex-1 text-xs sm:flex-none"
                onClick={() => setFilesOpen(true)}
              >
                <FileCode className="mr-1.5 h-3.5 w-3.5" />
                Files
                <span className="ml-1.5 text-muted-foreground">{files.size}</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 flex-1 text-xs sm:flex-none"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </Button>
              {status === "done" && todos.some((t) => !t.done) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-8 text-xs text-muted-foreground"
                  onClick={() => {
                    const remaining = todos.filter((t) => !t.done).map((t) => `- ${t.title}`).join("\n");
                    window.dispatchEvent(
                      new CustomEvent("megsy:coder-continue", {
                        detail: {
                          prompt: `Continue the previous build. Finish these remaining tasks without redoing completed work:\n${remaining}`,
                        },
                      }),
                    );
                    toast.success("Continuing the build…");
                  }}
                >
                  <PlayCircle className="mr-1 h-3.5 w-3.5" />
                  Continue
                </Button>
              )}
            </div>
          )}
        </>
      )}

      <Suspense fallback={null}>
        {filesOpen && (
          <CoderFilesPanel
            open={filesOpen}
            onOpenChange={setFilesOpen}
            files={projectFiles}
            projectName={prompt.slice(0, 40) || "megsy-project"}
            canDiff={!!previousFiles?.length}
            onOpenDiff={() => { setFilesOpen(false); setDiffOpen(true); }}
          />
        )}
        {previewOpen && (
          <CoderPreviewPanel
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            files={projectFiles}
            title={prompt.slice(0, 60) || "Megsy Project"}
            logs={bash}
            publishing={publishing}
            onPublish={handlePreview}
          />
        )}
        {diffOpen && (
          <CoderDiffModal
            open={diffOpen}
            onClose={() => setDiffOpen(false)}
            baseline={(previousFiles || []).map((f) => ({
              path: f.path,
              content: f.content,
              lang: (f.path.split(".").pop() || "txt").toLowerCase(),
            }))}
            current={projectFiles}
          />
        )}
      </Suspense>
    </div>
  );
}

