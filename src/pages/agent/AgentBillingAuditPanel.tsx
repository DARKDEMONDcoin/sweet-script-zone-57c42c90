import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Receipt, ChevronDown, ChevronRight } from "lucide-react";

type Row = {
  id: string;
  occurred_at: string;
  actor_role: string | null;
  actor_user_id: string | null;
  table_name: string | null;
  entity_id: string | null;
  column_name: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
};

export default function AgentBillingAuditPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("billing_audit_log")
      .select("*")
      .order("occurred_at", { ascending: false })
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
      r.table_name?.toLowerCase().includes(n) ||
      r.column_name?.toLowerCase().includes(n) ||
      r.actor_role?.toLowerCase().includes(n) ||
      r.reason?.toLowerCase().includes(n),
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const tables = new Set(rows.map((r) => r.table_name ?? "unknown")).size;
    const actors = new Set(rows.map((r) => r.actor_user_id ?? "system")).size;
    return { total: rows.length, tables, actors };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">تدقيق الفوترة من `billing_audit_log`</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Tables</div>
          <div className="text-xl font-semibold">{stats.tables}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Actors</div>
          <div className="text-xl font-semibold">{stats.actors}</div>
        </div>
      </div>

      <div className="mb-3">
        <Input placeholder="بحث بـ table/column/role/reason..." value={q} onChange={(e) => setQ(e.target.value)} />
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
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{r.table_name ?? "—"}</Badge>
                    {r.column_name && <Badge>{r.column_name}</Badge>}
                    {r.actor_role && <Badge variant="outline">{r.actor_role}</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.occurred_at).toLocaleString()}
                    {r.entity_id && <> · <span className="font-mono">{r.entity_id.slice(0, 8)}</span></>}
                  </div>
                  {r.reason && !open && <div className="mt-1 truncate text-xs">{r.reason}</div>}
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Old</div>
                      <pre className="whitespace-pre-wrap rounded bg-muted p-2">{r.old_value ?? "—"}</pre>
                    </div>
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">New</div>
                      <pre className="whitespace-pre-wrap rounded bg-muted p-2">{r.new_value ?? "—"}</pre>
                    </div>
                  </div>
                  {r.reason && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Reason</div>
                      <div className="rounded bg-muted p-2">{r.reason}</div>
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    actor: <span className="font-mono">{r.actor_user_id ?? "system"}</span>
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
