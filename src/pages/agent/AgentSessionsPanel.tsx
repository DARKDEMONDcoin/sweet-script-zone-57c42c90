import { useCallback, useEffect, useState } from "react";
import { MessagesSquare, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Session = {
  id: string;
  agent_slug: string | null;
  title: string | null;
  sandbox_id: string | null;
  sandbox_status: string | null;
  status: string | null;
  last_message_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  manus_task_url: string | null;
};

const statusVariant = (s: string | null) =>
  s === "active" || s === "running" ? "default" : s === "error" ? "destructive" : "secondary";

export default function AgentSessionsPanel() {
  const [rows, setRows] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_sessions")
      .select(
        "id, agent_slug, title, sandbox_id, sandbox_status, status, last_message_at, started_at, ended_at, created_at, manus_task_url",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter === "active") q = q.is("ended_at", null);
    if (filter === "ended") q = q.not("ended_at", "is", null);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Session[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function endSession(id: string) {
    const { error } = await supabase
      .from("agent_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setErr(error.message);
    else void load();
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">جلسات الوكيل</div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-md border p-0.5">
            {(["all", "active", "ended"] as const).map((f) => (
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
          لا توجد جلسات.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <MessagesSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate font-medium">
                    {r.title ?? r.id.slice(0, 8)}
                  </span>
                  <Badge variant={statusVariant(r.status)}>{r.status ?? "?"}</Badge>
                  {r.agent_slug && <Badge variant="outline">{r.agent_slug}</Badge>}
                  {r.sandbox_status && (
                    <Badge variant="secondary">sandbox: {r.sandbox_status}</Badge>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  بدأت: {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                  {r.last_message_at &&
                    ` · آخر رسالة: ${new Date(r.last_message_at).toLocaleString()}`}
                  {r.ended_at && ` · انتهت: ${new Date(r.ended_at).toLocaleString()}`}
                </div>
                {r.sandbox_id && (
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    sandbox: {r.sandbox_id}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {r.manus_task_url && (
                  <a
                    href={r.manus_task_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Manus <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {!r.ended_at && (
                  <Button variant="outline" size="sm" onClick={() => endSession(r.id)}>
                    إنهاء
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
