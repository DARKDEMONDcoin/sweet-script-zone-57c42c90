import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, FileText, ChevronRight } from "lucide-react";

type MemoryFile = {
  id: string;
  conversation_id: string;
  path: string;
  content: string;
  updated_at: string;
};

export default function AgentMemoryPanel() {
  const [rows, setRows] = useState<MemoryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await (supabase as any)
      .from("agent_memory_files")
      .select("id, conversation_id, path, content, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setRows((data ?? []) as MemoryFile[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Filesystem memory — todo.md / plan.md لكل محادثة
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد ملفات ذاكرة بعد. سيتم إنشاؤها تلقائياً عندما يكتب الوكيل &lt;agent-write&gt;.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const isOpen = openId === r.id;
          return (
            <div key={r.id} className="rounded-md border">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : r.id)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-muted/30"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs">{r.path}</span>
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                        {(r.content?.length ?? 0)} chars
                      </Badge>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                      {r.conversation_id}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(r.updated_at).toLocaleTimeString()}
                </div>
              </button>

              {isOpen && (
                <div className="border-t bg-muted/20 p-3">
                  <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-background p-3 text-[12px] leading-relaxed">
                    {r.content || "(فارغ)"}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
