import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronRight, Bot, Wrench, Zap } from "lucide-react";

type Trace = {
  id: string;
  conversation_id: string | null;
  model: string | null;
  tier: string | null;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cached_tokens: number | null;
  tools_used: any;
  input: any;
  output: any;
  created_at: string;
};

function toolChip(name: string, count: number) {
  return (
    <span
      key={name}
      className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 font-mono text-[10px]"
    >
      <Wrench className="h-3 w-3" /> {name}
      {count > 1 && <span className="text-muted-foreground">×{count}</span>}
    </span>
  );
}

export default function AgentTracesPanel() {
  const [rows, setRows] = useState<Trace[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await (supabase as any)
      .from("agent_traces")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Trace[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          آخر {rows.length} trace من تشغيل الوكيل
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
          لا توجد traces بعد. ابدأ محادثة وسيتم تسجيل كل tool loop تلقائياً.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const tools: Record<string, number> = {};
          const arr = Array.isArray(r.tools_used) ? r.tools_used : [];
          arr.forEach((t: any) => {
            const n = typeof t === "string" ? t : t?.name;
            if (!n) return;
            tools[n] = (tools[n] ?? 0) + 1;
          });
          const isOpen = openId === r.id;
          const cacheRate =
            r.prompt_tokens && r.cached_tokens
              ? Math.round((r.cached_tokens / r.prompt_tokens) * 100)
              : 0;
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
                  <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs">{r.model ?? "?"}</span>
                      {r.tier && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          {r.tier}
                        </Badge>
                      )}
                      {r.latency_ms != null && (
                        <span className="text-[11px] text-muted-foreground">
                          {(r.latency_ms / 1000).toFixed(2)}s
                        </span>
                      )}
                      {cacheRate > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                          <Zap className="h-3 w-3" /> cache {cacheRate}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(tools).map(([n, c]) => toolChip(n, c))}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleTimeString()}
                </div>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t bg-muted/20 p-3">
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-muted-foreground">prompt</div>
                      <div className="font-mono">{r.prompt_tokens ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">completion</div>
                      <div className="font-mono">{r.completion_tokens ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">cached</div>
                      <div className="font-mono">{r.cached_tokens ?? 0}</div>
                    </div>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Input
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded bg-background p-2 text-[11px]">
                      {JSON.stringify(r.input, null, 2)}
                    </pre>
                  </details>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Output
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded bg-background p-2 text-[11px]">
                      {JSON.stringify(r.output, null, 2)}
                    </pre>
                  </details>
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      Tools timeline
                    </summary>
                    <pre className="mt-2 max-h-64 overflow-auto rounded bg-background p-2 text-[11px]">
                      {JSON.stringify(r.tools_used, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
