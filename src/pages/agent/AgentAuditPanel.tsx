import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

type Row = {
  id: string;
  user_id: string | null;
  endpoint: string | null;
  action: string | null;
  status: number | null;
  metadata: any;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string | null;
};

type Filter = "all" | "ok" | "errors";

export default function AgentAuditPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("edge_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (filter === "ok") q = q.lt("status", 400);
    if (filter === "errors") q = q.gte("status", 400);
    if (search.trim()) q = q.ilike("endpoint", `%${search.trim()}%`);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const errors = rows.filter((r) => (r.status ?? 0) >= 400).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          سجل استدعاءات edge functions لأغراض التدقيق.
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Errors" value={errors} tone="destructive" />
        <Stat label="OK" value={rows.length - errors} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "ok", "errors"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="بحث بالـ endpoint..."
          className="ml-auto rounded-md border bg-background px-3 py-1.5 text-sm"
        />
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد سجلات.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          const isErr = (r.status ?? 0) >= 400;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div
                className="flex cursor-pointer items-start justify-between gap-3"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={isErr ? "destructive" : "default"}>
                      {r.status ?? "-"}
                    </Badge>
                    {r.action && <Badge variant="secondary">{r.action}</Badge>}
                    <span className="truncate font-mono text-xs">{r.endpoint}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {r.created_at && <span>{new Date(r.created_at).toLocaleString()}</span>}
                    {r.user_id && <span>user: {r.user_id.slice(0, 8)}</span>}
                    {r.ip_hash && <span>ip: {r.ip_hash.slice(0, 8)}</span>}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {r.user_agent && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">UA:</span>{" "}
                      <span className="font-mono">{r.user_agent}</span>
                    </div>
                  )}
                  {r.metadata && (
                    <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(r.metadata, null, 2)}
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

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "destructive";
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-semibold ${
          tone === "destructive" ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
