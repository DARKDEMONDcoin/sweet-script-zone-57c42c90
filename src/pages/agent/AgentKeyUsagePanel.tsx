import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, KeyRound, ChevronDown, ChevronRight } from "lucide-react";

type Row = {
  id: string;
  provider: string | null;
  key_id: string | null;
  model_id: string | null;
  success: boolean | null;
  cost_usd: number | null;
  error_message: string | null;
  user_id: string | null;
  created_at: string;
};

export default function AgentKeyUsagePanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("key_usage_log")
      .select("id, provider, key_id, model_id, success, cost_usd, error_message, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "success" && !r.success) return false;
      if (filter === "error" && r.success) return false;
      if (!q) return true;
      const n = q.toLowerCase();
      return (
        r.provider?.toLowerCase().includes(n) ||
        r.model_id?.toLowerCase().includes(n) ||
        r.error_message?.toLowerCase().includes(n)
      );
    });
  }, [rows, filter, q]);

  const stats = useMemo(() => {
    const total = rows.length;
    const errors = rows.filter((r) => !r.success).length;
    const cost = rows.reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);
    const providers = new Set(rows.map((r) => r.provider ?? "unknown")).size;
    return { total, errors, cost, providers };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">استخدام المفاتيح من `key_usage_log`</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Errors</div>
          <div className="text-xl font-semibold text-destructive">{stats.errors}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Providers</div>
          <div className="text-xl font-semibold">{stats.providers}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Cost (USD)</div>
          <div className="text-xl font-semibold">${stats.cost.toFixed(4)}</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["all", "success", "error"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
        <Input placeholder="بحث بـ provider/model/error..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد نتائج.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const open = !!expanded[r.id];
          return (
            <div key={r.id} className="rounded-md border">
              <button
                type="button"
                onClick={() => setExpanded((s) => ({ ...s, [r.id]: !s[r.id] }))}
                className="flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={r.success ? "default" : "destructive"}>{r.success ? "success" : "error"}</Badge>
                    <Badge variant="secondary">{r.provider ?? "unknown"}</Badge>
                    {r.model_id && <span className="font-mono text-xs text-muted-foreground">{r.model_id}</span>}
                    {r.cost_usd != null && (
                      <span className="text-xs text-muted-foreground">${Number(r.cost_usd).toFixed(6)}</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.key_id && <> · key <span className="font-mono">{r.key_id.slice(0, 8)}</span></>}
                  </div>
                  {r.error_message && !open && (
                    <div className="mt-1 truncate text-xs text-destructive">{r.error_message}</div>
                  )}
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  {r.error_message && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Error</div>
                      <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-destructive">{r.error_message}</pre>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">key_id:</span> <span className="font-mono">{r.key_id ?? "—"}</span></div>
                    <div><span className="text-muted-foreground">user_id:</span> <span className="font-mono">{r.user_id ?? "—"}</span></div>
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
