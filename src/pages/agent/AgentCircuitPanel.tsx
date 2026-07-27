import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, RotateCcw } from "lucide-react";

type Row = {
  id: string;
  scope: string;
  scope_id: string;
  state: string;
  failure_count: number | null;
  success_count: number | null;
  opened_at: string | null;
  reopens_at: string | null;
  last_error: string | null;
  updated_at: string | null;
};

export default function AgentCircuitPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("provider_circuit_state")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (stateFilter !== "all") q = q.eq("state", stateFilter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [stateFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function reset(id: string) {
    const { error } = await supabase
      .from("provider_circuit_state")
      .update({
        state: "closed",
        failure_count: 0,
        opened_at: null,
        reopens_at: null,
        last_error: null,
      })
      .eq("id", id);
    if (error) setErr(error.message);
    else void load();
  }

  const open = rows.filter((r) => r.state === "open").length;
  const half = rows.filter((r) => r.state === "half_open" || r.state === "half-open").length;
  const closed = rows.filter((r) => r.state === "closed").length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          حالة قواطع الدائرة (circuit breakers) لكل provider/scope.
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Open" value={open} tone="destructive" />
        <Stat label="Half-open" value={half} tone="warn" />
        <Stat label="Closed" value={closed} />
      </div>

      <div className="mb-4 flex gap-2">
        {["all", "closed", "half_open", "open"].map((f) => (
          <Button
            key={f}
            variant={stateFilter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setStateFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد قواطع مسجلة.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="font-mono">
                    {r.scope}
                  </Badge>
                  <span className="font-mono text-xs">{r.scope_id}</span>
                  <Badge
                    variant={
                      r.state === "open"
                        ? "destructive"
                        : r.state === "closed"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {r.state}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ✓ {r.success_count ?? 0} · ✗ {r.failure_count ?? 0}
                  </span>
                </div>
                {r.last_error && (
                  <div className="mt-2 line-clamp-2 rounded bg-destructive/10 p-2 font-mono text-xs text-destructive">
                    {r.last_error}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {r.opened_at && <span>opened: {new Date(r.opened_at).toLocaleString()}</span>}
                  {r.reopens_at && <span>reopens: {new Date(r.reopens_at).toLocaleString()}</span>}
                  {r.updated_at && <span>updated: {new Date(r.updated_at).toLocaleString()}</span>}
                </div>
              </div>
              {r.state !== "closed" && (
                <Button size="sm" variant="outline" onClick={() => reset(r.id)}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "destructive" | "warn";
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-semibold ${
          tone === "destructive"
            ? "text-destructive"
            : tone === "warn"
              ? "text-amber-500"
              : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
