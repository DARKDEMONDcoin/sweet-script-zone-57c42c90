import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Zap } from "lucide-react";

type Invocation = {
  id: string;
  session_id: string | null;
  agent_slug: string | null;
  tool_key: string;
  input: any;
  output: any;
  status: string;
  error: string | null;
  credits_charged: number | null;
  latency_ms: number | null;
  created_at: string;
};

type Filter = "all" | "success" | "error" | "pending";

export default function AgentInvocationsPanel() {
  const [rows, setRows] = useState<Invocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_tool_invocations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Invocation[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const counts = {
    all: rows.length,
    success: rows.filter((r) => r.status === "success").length,
    error: rows.filter((r) => r.status === "error").length,
    totalCredits: rows.reduce((s, r) => s + (Number(r.credits_charged) || 0), 0),
    avgLatency: rows.length
      ? Math.round(rows.reduce((s, r) => s + (r.latency_ms || 0), 0) / rows.length)
      : 0,
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">استدعاءات الأدوات الفعلية (agent_tool_invocations)</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{counts.all}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Errors</div><div className="font-semibold text-destructive">{counts.error}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Avg ms</div><div className="font-semibold">{counts.avgLatency}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Credits</div><div className="font-semibold">{counts.totalCredits.toFixed(2)}</div></div>
      </div>

      <div className="mb-3 flex gap-2">
        {(["all", "success", "error", "pending"] as Filter[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {err && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد استدعاءات.</div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const open = expanded === r.id;
          return (
            <div key={r.id} className="rounded-md border">
              <button type="button" onClick={() => setExpanded(open ? null : r.id)} className="flex w-full items-center justify-between p-3 text-left">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{r.tool_key}</span>
                  <Badge variant={r.status === "success" ? "default" : r.status === "error" ? "destructive" : "secondary"}>{r.status}</Badge>
                  {r.agent_slug && <Badge variant="outline">{r.agent_slug}</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.latency_ms ?? 0}ms · {Number(r.credits_charged || 0).toFixed(2)}c · {new Date(r.created_at).toLocaleTimeString()}
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  {r.error && <div className="rounded bg-destructive/10 p-2 text-destructive">{r.error}</div>}
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">Input</div>
                    <pre className="max-h-40 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.input, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">Output</div>
                    <pre className="max-h-60 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.output, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
