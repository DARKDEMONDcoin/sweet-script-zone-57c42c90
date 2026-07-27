import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Incident = {
  id: string;
  severity: string | null;
  title: string | null;
  description: string | null;
  status: string | null;
  metadata: any;
  opened_at: string;
  resolved_at: string | null;
};

const sevVariant = (s: string | null) =>
  s === "critical" || s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

export default function AgentIncidentsPanel() {
  const [rows, setRows] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_incidents")
      .select("id, severity, title, description, status, metadata, opened_at, resolved_at")
      .order("opened_at", { ascending: false })
      .limit(200);
    if (filter === "open") q = q.is("resolved_at", null);
    if (filter === "resolved") q = q.not("resolved_at", "is", null);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Incident[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(id: string) {
    const { error } = await supabase
      .from("agent_incidents")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setErr(error.message);
    else void load();
  }

  const openCount = rows.filter((r) => !r.resolved_at).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">حوادث الوكيل</div>
          {openCount > 0 && filter !== "resolved" && (
            <Badge variant="destructive">{openCount} مفتوح</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md border p-0.5">
            {(["open", "all", "resolved"] as const).map((f) => (
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

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد حوادث.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{r.title ?? "(بدون عنوان)"}</span>
                  <Badge variant={sevVariant(r.severity)}>{r.severity ?? "unknown"}</Badge>
                  {r.resolved_at ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> resolved
                    </Badge>
                  ) : (
                    <Badge>{r.status ?? "open"}</Badge>
                  )}
                </div>
                {r.description && (
                  <div className="mt-1 text-sm text-muted-foreground">{r.description}</div>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  فُتح: {new Date(r.opened_at).toLocaleString()}
                  {r.resolved_at && ` · حُلّ: ${new Date(r.resolved_at).toLocaleString()}`}
                </div>
                {r.metadata && Object.keys(r.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-muted-foreground">
                      metadata
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(r.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              {!r.resolved_at && (
                <Button variant="outline" size="sm" onClick={() => resolve(r.id)}>
                  حلّ
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
