import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Briefcase } from "lucide-react";

type Job = {
  id: string;
  kind: string;
  status: string;
  phase: string | null;
  progress: number | null;
  status_text: string | null;
  error: string | null;
  tokens_used: number | null;
  attempt: number | null;
  max_attempts: number | null;
  runner: string | null;
  created_at: string;
  finished_at: string | null;
  input: any;
  output: any;
  provider_errors: any;
};

type Filter = "all" | "queued" | "running" | "succeeded" | "failed";

export default function AgentJobsPanel() {
  const [rows, setRows] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("background_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Job[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const counts = {
    running: rows.filter((r) => r.status === "running").length,
    failed: rows.filter((r) => r.status === "failed").length,
    succeeded: rows.filter((r) => r.status === "succeeded").length,
    tokens: rows.reduce((s, r) => s + (r.tokens_used || 0), 0),
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">مهام الخلفية (background_jobs)</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Running</div><div className="font-semibold text-primary">{counts.running}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Succeeded</div><div className="font-semibold">{counts.succeeded}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Failed</div><div className="font-semibold text-destructive">{counts.failed}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Tokens</div><div className="font-semibold">{counts.tokens}</div></div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "queued", "running", "succeeded", "failed"] as Filter[]).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {err && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد مهام.</div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const open = expanded === r.id;
          const dur = r.finished_at ? Math.round((new Date(r.finished_at).getTime() - new Date(r.created_at).getTime()) / 1000) : null;
          return (
            <div key={r.id} className="rounded-md border">
              <button type="button" onClick={() => setExpanded(open ? null : r.id)} className="flex w-full items-center justify-between p-3 text-left">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono">{r.kind}</span>
                      <Badge variant={r.status === "succeeded" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>{r.status}</Badge>
                      {r.phase && <Badge variant="outline">{r.phase}</Badge>}
                      {r.runner && <Badge variant="outline">{r.runner}</Badge>}
                    </div>
                    {r.status_text && <div className="text-xs text-muted-foreground">{r.status_text}</div>}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{r.progress != null ? `${r.progress}%` : ""} {dur != null ? `· ${dur}s` : ""}</div>
                  <div>{new Date(r.created_at).toLocaleTimeString()}</div>
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  <div className="text-muted-foreground">
                    attempt {r.attempt ?? 0}/{r.max_attempts ?? 0} · tokens {r.tokens_used ?? 0}
                  </div>
                  {r.error && <div className="rounded bg-destructive/10 p-2 text-destructive">{r.error}</div>}
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">Input</div>
                    <pre className="max-h-40 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.input, null, 2)}</pre>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-muted-foreground">Output</div>
                    <pre className="max-h-60 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.output, null, 2)}</pre>
                  </div>
                  {r.provider_errors && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Provider errors</div>
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.provider_errors, null, 2)}</pre>
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
