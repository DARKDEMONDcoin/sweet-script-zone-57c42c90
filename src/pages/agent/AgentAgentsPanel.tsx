import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Bot } from "lucide-react";

type Agent = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  system_prompt: string | null;
  cron_schedule: string | null;
  approval_mode: string | null;
  enabled: boolean;
  config: any;
  last_run_at: string | null;
  success_count: number | null;
  fail_count: number | null;
};

export default function AgentAgentsPanel() {
  const [rows, setRows] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("ai_agents")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Agent[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggle(row: Agent) {
    const { error } = await supabase.from("ai_agents").update({ enabled: !row.enabled }).eq("id", row.id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === row.id ? { ...x, enabled: !x.enabled } : x)));
  }

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return r.slug.toLowerCase().includes(s) || r.name.toLowerCase().includes(s) || (r.category ?? "").toLowerCase().includes(s);
  });

  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">وكلاء الذكاء (ai_agents)</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{rows.length}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Enabled</div><div className="font-semibold text-primary">{enabled}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Shown</div><div className="font-semibold">{filtered.length}</div></div>
      </div>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="بحث بالاسم أو الفئة..."
        className="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm"
      />

      {err && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">لا يوجد وكلاء.</div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const open = expanded === r.id;
          const total = (r.success_count ?? 0) + (r.fail_count ?? 0);
          return (
            <div key={r.id} className="rounded-md border">
              <button type="button" onClick={() => setExpanded(open ? null : r.id)} className="flex w-full items-center justify-between p-3 text-left">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {r.name}
                      <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "on" : "off"}</Badge>
                      {r.category && <Badge variant="outline">{r.category}</Badge>}
                      {r.approval_mode && <Badge variant="outline">{r.approval_mode}</Badge>}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{r.slug}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.success_count ?? 0}✓ / {r.fail_count ?? 0}✗ · {total} runs
                </div>
              </button>
              {open && (
                <div className="space-y-2 border-t p-3 text-xs">
                  {r.description && <div className="text-muted-foreground">{r.description}</div>}
                  {r.cron_schedule && <div><span className="text-muted-foreground">Cron:</span> <code>{r.cron_schedule}</code></div>}
                  {r.last_run_at && <div><span className="text-muted-foreground">Last run:</span> {new Date(r.last_run_at).toLocaleString()}</div>}
                  {r.system_prompt && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">System prompt</div>
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">{r.system_prompt}</pre>
                    </div>
                  )}
                  {r.config && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Config</div>
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2">{JSON.stringify(r.config, null, 2)}</pre>
                    </div>
                  )}
                  <div>
                    <Button variant="outline" size="sm" onClick={() => toggle(r)}>
                      {r.enabled ? "تعطيل" : "تفعيل"}
                    </Button>
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
