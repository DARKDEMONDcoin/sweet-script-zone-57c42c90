import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check, X } from "lucide-react";

type Proposal = {
  id: string;
  agent_id: string | null;
  run_id: string | null;
  kind: string | null;
  title: string | null;
  rationale: string | null;
  payload: any;
  status: string | null;
  created_at: string;
  executed_at: string | null;
  result: any;
};

type Filter = "pending" | "all" | "approved" | "rejected" | "executed";

export default function AgentProposalsPanel() {
  const [rows, setRows] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_proposals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Proposal[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function decide(id: string, status: "approved" | "rejected") {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("agent_proposals")
      .update({ status, decided_by: userRes.user?.id ?? null })
      .eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  const statusVariant = (s: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (s === "approved" || s === "executed") return "default";
    if (s === "rejected") return "destructive";
    if (s === "pending") return "secondary";
    return "outline";
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["pending", "approved", "rejected", "executed", "all"] as Filter[]).map((f) => (
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

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد اقتراحات في هذا الفلتر.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(r.status)}>{r.status ?? "—"}</Badge>
                    {r.kind && <Badge variant="outline">{r.kind}</Badge>}
                    <span className="font-medium text-sm">{r.title ?? "(بدون عنوان)"}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                  {r.rationale && (
                    <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {r.rationale}
                    </div>
                  )}
                </button>
                {r.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <Button size="sm" onClick={() => decide(r.id, "approved")}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => decide(r.id, "rejected")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {r.payload && (
                    <div>
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">Payload</div>
                      <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(r.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                  {r.result && (
                    <div>
                      <div className="mb-1 text-xs font-semibold text-muted-foreground">Result</div>
                      <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(r.result, null, 2)}
                      </pre>
                    </div>
                  )}
                  {r.executed_at && (
                    <div className="text-xs text-muted-foreground">
                      نُفّذ في: {new Date(r.executed_at).toLocaleString()}
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
