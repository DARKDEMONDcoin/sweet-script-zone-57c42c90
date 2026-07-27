import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

type Observation = {
  id: string;
  agent_id: string | null;
  severity: string | null;
  metric: string | null;
  value: number | null;
  threshold: number | null;
  message: string | null;
  context: any;
  created_at: string;
};

type Filter = "all" | "info" | "warn" | "error" | "critical";

export default function AgentObservationsPanel() {
  const [rows, setRows] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_observations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("severity", filter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Observation[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const sevVariant = (s: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "critical" || s === "error") return "destructive";
    if (s === "warn") return "secondary";
    return "outline";
  };

  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.severity ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "info", "warn", "error", "critical"] as Filter[]).map((f) => (
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
        {["info", "warn", "error", "critical"].map((s) => (
          <div key={s} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground capitalize">{s}</div>
            <div className="mt-1 text-2xl font-semibold">{counts[s] ?? 0}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد ملاحظات في هذا الفلتر.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Badge variant={sevVariant(r.severity)}>{r.severity ?? "—"}</Badge>
              {r.metric && <Badge variant="outline" className="font-mono">{r.metric}</Badge>}
              {r.value !== null && (
                <span className="text-sm text-muted-foreground">
                  value={r.value}
                  {r.threshold !== null && ` / threshold=${r.threshold}`}
                </span>
              )}
            </div>
            {r.message && <div className="mt-2 text-sm">{r.message}</div>}
            <div className="mt-1 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString()}
            </div>
            {r.context && Object.keys(r.context).length > 0 && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(r.context, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
