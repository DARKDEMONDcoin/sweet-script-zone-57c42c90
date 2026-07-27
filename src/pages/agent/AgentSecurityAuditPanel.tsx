import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, ShieldAlert } from "lucide-react";

type Row = {
  id: string;
  event_type: string;
  severity: string | null;
  actor_user_id: string | null;
  target_id: string | null;
  function_name: string | null;
  provider: string | null;
  details: any;
  ip_hash: string | null;
  created_at: string;
};

type Sev = "all" | "info" | "warn" | "error" | "critical";

export default function AgentSecurityAuditPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sev, setSev] = useState<Sev>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("security_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (sev !== "all") q = q.eq("severity", sev);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [sev]);

  useEffect(() => { void load(); }, [load]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.event_type.toLowerCase().includes(s) ||
      (r.function_name ?? "").toLowerCase().includes(s) ||
      (r.provider ?? "").toLowerCase().includes(s) ||
      (r.target_id ?? "").toLowerCase().includes(s)
    );
  });

  const counts = {
    critical: rows.filter((r) => r.severity === "critical").length,
    error: rows.filter((r) => r.severity === "error").length,
    warn: rows.filter((r) => r.severity === "warn").length,
    info: rows.filter((r) => r.severity === "info").length,
  };

  const sevColor = (s: string | null) => {
    if (s === "critical") return "destructive";
    if (s === "error") return "destructive";
    if (s === "warn") return "secondary";
    return "outline";
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          سجل الأحداث الأمنية (security_audit_log)
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all", "critical", "error", "warn", "info"] as const).map((f) => (
              <Button
                key={f}
                variant={sev === f ? "default" : "outline"}
                size="sm"
                onClick={() => setSev(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        <div className="rounded-md border border-destructive/40 p-3">
          <div className="text-xs text-muted-foreground">critical</div>
          <div className="text-lg font-semibold text-destructive">{counts.critical}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">error</div>
          <div className="text-lg font-semibold">{counts.error}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">warn</div>
          <div className="text-lg font-semibold">{counts.warn}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">info</div>
          <div className="text-lg font-semibold">{counts.info}</div>
        </div>
      </div>

      <Input
        placeholder="بحث بـ event_type / function / provider / target..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد أحداث.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="flex w-full items-start justify-between gap-2 text-start"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {(r.severity === "critical" || r.severity === "error") && (
                      <ShieldAlert className="h-4 w-4 text-destructive" />
                    )}
                    <span className="font-mono text-sm">{r.event_type}</span>
                    <Badge variant={sevColor(r.severity) as any}>{r.severity ?? "—"}</Badge>
                    {r.provider && <Badge variant="outline">{r.provider}</Badge>}
                    {r.function_name && (
                      <span className="text-xs text-muted-foreground">
                        fn: {r.function_name}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.actor_user_id && ` · actor: ${r.actor_user_id.slice(0, 8)}…`}
                    {r.target_id && ` · target: ${r.target_id}`}
                    {r.ip_hash && ` · ip: ${r.ip_hash.slice(0, 12)}…`}
                  </div>
                </div>
              </button>
              {isOpen && r.details && (
                <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs">
                  {JSON.stringify(r.details, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
