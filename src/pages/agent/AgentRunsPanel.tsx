import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

type Run = {
  id: string;
  agent_id: string | null;
  status: string | null;
  trigger: string | null;
  started_at: string | null;
  ended_at: string | null;
  tokens_used: number | null;
  e2b_ms: number | null;
  proposals_count: number | null;
  output_summary: string | null;
  error: string | null;
};

type Filter = "all" | "running" | "succeeded" | "failed";

export default function AgentRunsPanel() {
  const [rows, setRows] = useState<Run[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Run[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const statusVariant = (s: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "succeeded") return "default";
    if (s === "failed") return "destructive";
    if (s === "running") return "secondary";
    return "outline";
  };

  const duration = (r: Run) => {
    if (!r.started_at || !r.ended_at) return null;
    const ms = new Date(r.ended_at).getTime() - new Date(r.started_at).getTime();
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const totalTokens = rows.reduce((a, r) => a + (r.tokens_used ?? 0), 0);
  const totalProposals = rows.reduce((a, r) => a + (r.proposals_count ?? 0), 0);
  const failed = rows.filter((r) => r.status === "failed").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "running", "succeeded", "failed"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total runs</div>
          <div className="mt-1 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Failed</div>
          <div className="mt-1 text-2xl font-semibold text-destructive">{failed}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Tokens</div>
          <div className="mt-1 text-2xl font-semibold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Proposals</div>
          <div className="mt-1 text-2xl font-semibold">{totalProposals}</div>
        </div>
      </div>

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد runs في هذا الفلتر.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          const dur = duration(r);
          return (
            <div key={r.id} className="rounded-md border p-3">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant(r.status)}>{r.status ?? "—"}</Badge>
                  {r.trigger && <Badge variant="outline">{r.trigger}</Badge>}
                  {dur && <span className="text-xs text-muted-foreground">{dur}</span>}
                  {r.tokens_used !== null && (
                    <span className="text-xs text-muted-foreground">
                      {r.tokens_used.toLocaleString()} tok
                    </span>
                  )}
                  {r.proposals_count ? (
                    <span className="text-xs text-muted-foreground">
                      {r.proposals_count} proposals
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                </div>
                {r.output_summary && (
                  <div className="mt-1 text-sm line-clamp-2">{r.output_summary}</div>
                )}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                  <div className="font-mono text-muted-foreground">run_id: {r.id}</div>
                  {r.agent_id && (
                    <div className="font-mono text-muted-foreground">agent_id: {r.agent_id}</div>
                  )}
                  {r.e2b_ms !== null && <div>E2B: {r.e2b_ms} ms</div>}
                  {r.error && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-destructive">
                      {r.error}
                    </div>
                  )}
                  {r.output_summary && (
                    <pre className="max-h-64 overflow-auto rounded bg-muted p-2 whitespace-pre-wrap">
                      {r.output_summary}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
