import { useCallback, useEffect, useMemo, useState } from "react";
import { Wrench, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Invocation = {
  id: string;
  agent_slug: string | null;
  tool_key: string | null;
  input: any;
  output: any;
  status: string | null;
  error: string | null;
  credits_charged: number | null;
  latency_ms: number | null;
  created_at: string;
};

export default function AgentToolsPanel() {
  const [rows, setRows] = useState<Invocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_tool_invocations")
      .select("id, agent_slug, tool_key, input, output, status, error, credits_charged, latency_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter === "success") q = q.eq("status", "success");
    if (filter === "error") q = q.eq("status", "error");
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Invocation[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = rows.length;
    const errors = rows.filter((r) => r.status === "error").length;
    const avgLatency =
      total > 0
        ? Math.round(rows.reduce((s, r) => s + (r.latency_ms ?? 0), 0) / total)
        : 0;
    const totalCredits = rows.reduce((s, r) => s + Number(r.credits_charged ?? 0), 0);
    const byTool = new Map<string, number>();
    for (const r of rows) {
      const k = r.tool_key ?? "?";
      byTool.set(k, (byTool.get(k) ?? 0) + 1);
    }
    const top = [...byTool.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { total, errors, avgLatency, totalCredits, top };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">استدعاءات الأدوات</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md border p-0.5">
            {(["all", "success", "error"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-1 text-xs ${
                  filter === f ? "bg-muted text-foreground" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-lg font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Errors</div>
          <div className="text-lg font-semibold text-destructive">{stats.errors}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Avg Latency</div>
          <div className="text-lg font-semibold">{stats.avgLatency}ms</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Credits</div>
          <div className="text-lg font-semibold">{stats.totalCredits.toFixed(2)}</div>
        </div>
      </div>

      {stats.top.length > 0 && (
        <div className="mb-4 rounded-md border p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">أكثر الأدوات استخداماً</div>
          <div className="space-y-1">
            {stats.top.map(([k, n]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="font-mono">{k}</span>
                <Badge variant="secondary">{n}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد استدعاءات.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm">{r.tool_key ?? "?"}</span>
              {r.status === "error" ? (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> error
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {r.status ?? "?"}
                </Badge>
              )}
              {r.agent_slug && <Badge variant="outline">{r.agent_slug}</Badge>}
              <span className="ml-auto text-xs text-muted-foreground">
                {r.latency_ms ?? 0}ms · {new Date(r.created_at).toLocaleTimeString()}
              </span>
            </div>
            {r.error && (
              <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                {r.error}
              </div>
            )}
            {(r.input || r.output) && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  input / output
                </summary>
                <div className="mt-1 grid gap-2 md:grid-cols-2">
                  <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(r.input, null, 2)}
                  </pre>
                  <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(r.output, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
