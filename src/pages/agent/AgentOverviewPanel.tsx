import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, Coins, Wrench, Gauge, ClipboardCheck } from "lucide-react";

type Trace = {
  model: string | null;
  tools_used: any;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cached_tokens: number | null;
  status: string | null;
  created_at: string;
};

type Router = { routed: any; latency_ms: number | null };
type Evl = { score: number | null; passed: boolean | null };

export default function AgentOverviewPanel() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [routes, setRoutes] = useState<Router[]>([]);
  const [evals, setEvals] = useState<Evl[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [t, r, e] = await Promise.all([
      supabase.from("agent_traces")
        .select("model, tools_used, latency_ms, prompt_tokens, completion_tokens, cached_tokens, status, created_at")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(500),
      supabase.from("chat_router_logs")
        .select("routed, latency_ms")
        .gte("created_at", since).limit(500),
      supabase.from("agent_evals")
        .select("score, passed")
        .gte("created_at", since).limit(500),
    ]);
    if (t.error) setErr(t.error.message);
    setTraces((t.data ?? []) as Trace[]);
    setRoutes((r.data ?? []) as Router[]);
    setEvals((e.data ?? []) as Evl[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const totalTraces = traces.length;
  const errors = traces.filter((x) => x.status && x.status !== "ok").length;
  const totalPrompt = traces.reduce((s, x) => s + (x.prompt_tokens ?? 0), 0);
  const totalCached = traces.reduce((s, x) => s + (x.cached_tokens ?? 0), 0);
  const totalCompletion = traces.reduce((s, x) => s + (x.completion_tokens ?? 0), 0);
  const cacheRate = totalPrompt > 0 ? Math.round((totalCached / totalPrompt) * 100) : 0;
  const avgLatency = totalTraces > 0
    ? Math.round(traces.reduce((s, x) => s + (x.latency_ms ?? 0), 0) / totalTraces)
    : 0;

  const toolCounts = new Map<string, number>();
  for (const t of traces) {
    const arr = Array.isArray(t.tools_used) ? t.tools_used : [];
    for (const name of arr) toolCounts.set(String(name), (toolCounts.get(String(name)) ?? 0) + 1);
  }
  const topTools = [...toolCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const tierCounts = { nano: 0, standard: 0, max: 0, other: 0 };
  for (const r of routes) {
    const tier = (r.routed as any)?.tier as string | undefined;
    if (tier === "nano") tierCounts.nano++;
    else if (tier === "standard") tierCounts.standard++;
    else if (tier === "max") tierCounts.max++;
    else tierCounts.other++;
  }
  const totalRoutes = routes.length || 1;

  const passed = evals.filter((e) => e.passed === true).length;
  const failed = evals.filter((e) => e.passed === false).length;
  const passRate = evals.length > 0 ? Math.round((passed / evals.length) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">آخر 24 ساعة</div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Activity} label="Traces" value={String(totalTraces)} sub={`${errors} errors`} />
        <StatCard icon={Gauge} label="Avg latency" value={`${avgLatency}ms`} />
        <StatCard icon={Coins} label="Cache hit rate" value={`${cacheRate}%`} sub={`${totalCached.toLocaleString()} cached`} />
        <StatCard icon={ClipboardCheck} label="Eval pass" value={`${passRate}%`} sub={`${passed}/${passed + failed}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Wrench className="h-4 w-4" /> أكثر الأدوات استخداماً
          </div>
          {topTools.length === 0 ? (
            <div className="text-xs text-muted-foreground">لا توجد بيانات</div>
          ) : (
            <div className="space-y-1">
              {topTools.map(([name, n]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{name}</span>
                  <span className="text-muted-foreground">{n}×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Gauge className="h-4 w-4" /> توزيع الـ Model Router
          </div>
          {routes.length === 0 ? (
            <div className="text-xs text-muted-foreground">لا توجد قرارات router بعد</div>
          ) : (
            <div className="space-y-2">
              {(["nano", "standard", "max"] as const).map((tier) => {
                const n = tierCounts[tier];
                const pct = Math.round((n / totalRoutes) * 100);
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-mono">{tier}</span>
                      <span className="text-muted-foreground">{n} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-md border p-3 text-xs text-muted-foreground">
        Tokens: {totalPrompt.toLocaleString()} prompt · {totalCompletion.toLocaleString()} completion · {totalCached.toLocaleString()} cached
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
