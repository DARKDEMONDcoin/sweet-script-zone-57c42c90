import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2 } from "lucide-react";

type Dlq = {
  id: string;
  original_id: string | null;
  source_table: string | null;
  user_id: string | null;
  runner: string | null;
  kind: string | null;
  input: any;
  last_error: string | null;
  attempts: number | null;
  provider_errors: any;
  enqueued_at: string | null;
  notified_admin_at: string | null;
  resolved_at: string | null;
  resolution: string | null;
};

type Filter = "all" | "unresolved" | "resolved";

export default function AgentDlqPanel() {
  const [rows, setRows] = useState<Dlq[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("unresolved");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("dead_letter_jobs")
      .select("*")
      .order("enqueued_at", { ascending: false })
      .limit(200);
    if (filter === "unresolved") q = q.is("resolved_at", null);
    if (filter === "resolved") q = q.not("resolved_at", "is", null);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Dlq[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolve(id: string) {
    const { error } = await supabase
      .from("dead_letter_jobs")
      .update({ resolved_at: new Date().toISOString(), resolution: "manual" })
      .eq("id", id);
    if (error) setErr(error.message);
    else void load();
  }

  const unresolvedCount = rows.filter((r) => !r.resolved_at).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          مهام فشلت نهائياً وتحتاج مراجعة يدوية.
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Total" value={rows.length} />
        <Stat label="Unresolved" value={unresolvedCount} tone="destructive" />
        <Stat label="Resolved" value={rows.length - unresolvedCount} tone="default" />
      </div>

      <div className="mb-4 flex gap-2">
        {(["unresolved", "resolved", "all"] as Filter[]).map((f) => (
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
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline" className="font-mono">
                      {r.source_table ?? "?"}
                    </Badge>
                    {r.runner && <Badge variant="secondary">{r.runner}</Badge>}
                    {r.kind && <span className="font-mono text-xs">{r.kind}</span>}
                    <Badge variant="outline">attempts: {r.attempts ?? 0}</Badge>
                    {r.resolved_at ? (
                      <Badge>resolved</Badge>
                    ) : (
                      <Badge variant="destructive">unresolved</Badge>
                    )}
                  </div>
                  {r.last_error && (
                    <div className="mt-2 line-clamp-2 rounded bg-destructive/10 p-2 font-mono text-xs text-destructive">
                      {r.last_error}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.enqueued_at ? new Date(r.enqueued_at).toLocaleString() : "-"}
                    {r.original_id && ` · orig: ${r.original_id.slice(0, 8)}`}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!r.resolved_at && (
                    <Button size="sm" variant="outline" onClick={() => resolve(r.id)}>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpanded(isOpen ? null : r.id)}
                  >
                    {isOpen ? "Hide" : "Details"}
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {r.input && (
                    <Section label="input">
                      <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(r.input, null, 2)}
                      </pre>
                    </Section>
                  )}
                  {r.provider_errors && (
                    <Section label="provider_errors">
                      <pre className="overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(r.provider_errors, null, 2)}
                      </pre>
                    </Section>
                  )}
                  {r.resolution && (
                    <Section label="resolution">
                      <div className="text-xs">{r.resolution}</div>
                    </Section>
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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
