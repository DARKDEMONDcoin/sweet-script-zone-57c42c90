import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, DollarSign, ChevronDown, ChevronRight } from "lucide-react";

type Row = {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  gross_amount: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  currency: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default function AgentRevenuePanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("revenue_ledger")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    if (!q) return rows;
    const n = q.toLowerCase();
    return rows.filter((r) =>
      r.subscription_id?.toLowerCase().includes(n) ||
      r.source?.toLowerCase().includes(n) ||
      r.currency?.toLowerCase().includes(n),
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const gross = rows.reduce((s, r) => s + (Number(r.gross_amount) || 0), 0);
    const net = rows.reduce((s, r) => s + (Number(r.net_amount) || 0), 0);
    const tax = rows.reduce((s, r) => s + (Number(r.tax_amount) || 0), 0);
    const currencies = new Set(rows.map((r) => r.currency ?? "USD"));
    return { total: rows.length, gross, net, tax, currencies: currencies.size };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">دفتر الإيرادات من `revenue_ledger`</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Entries</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Gross</div>
          <div className="text-xl font-semibold">{stats.gross.toFixed(2)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Tax</div>
          <div className="text-xl font-semibold">{stats.tax.toFixed(2)}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Net</div>
          <div className="text-xl font-semibold">{stats.net.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-3">
        <Input placeholder="بحث بـ subscription/source/currency..." value={q} onChange={(e) => setQ(e.target.value)} />
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
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{r.source ?? "—"}</Badge>
                    <Badge>{r.currency ?? "USD"}</Badge>
                    <span className="text-sm font-semibold">{Number(r.net_amount ?? 0).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      (gross {Number(r.gross_amount ?? 0).toFixed(2)} · tax {Number(r.tax_amount ?? 0).toFixed(2)})
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.subscription_id && <> · sub <span className="font-mono">{r.subscription_id}</span></>}
                  </div>
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">user_id:</span> <span className="font-mono">{r.user_id ?? "—"}</span></div>
                    <div><span className="text-muted-foreground">tax_rate:</span> {r.tax_rate ?? "—"}</div>
                  </div>
                  {r.metadata && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Metadata</div>
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                        {JSON.stringify(r.metadata, null, 2)}
                      </pre>
                    </div>
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
