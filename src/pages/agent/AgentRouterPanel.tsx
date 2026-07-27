import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Gauge } from "lucide-react";

type RouterLog = {
  id: string;
  conversation_id: string | null;
  user_text: string | null;
  routed: any;
  latency_ms: number | null;
  created_at: string;
};

const TIER_COLORS: Record<string, string> = {
  nano: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  standard: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  max: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

export default function AgentRouterPanel() {
  const [rows, setRows] = useState<RouterLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await (supabase as any)
      .from("chat_router_logs")
      .select("id, conversation_id, user_text, routed, latency_ms, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as RouterLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const byTier: Record<string, number> = { nano: 0, standard: 0, max: 0, other: 0 };
    let totalLatency = 0;
    let latencySamples = 0;
    for (const r of rows) {
      const tier = (r.routed?.tier as string) ?? "other";
      byTier[tier] = (byTier[tier] ?? 0) + 1;
      if (typeof r.latency_ms === "number") {
        totalLatency += r.latency_ms;
        latencySamples++;
      }
    }
    return {
      total: rows.length,
      byTier,
      avgLatency: latencySamples > 0 ? Math.round(totalLatency / latencySamples) : 0,
    };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          قرارات Model Router — أرخص موديل قدر يخلّص الشغل
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-md border p-3">
          <div className="text-[10px] uppercase text-muted-foreground">Total</div>
          <div className="mt-1 flex items-center gap-1.5 text-lg font-semibold">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            {stats.total}
          </div>
        </div>
        {(["nano", "standard", "max"] as const).map((t) => {
          const count = stats.byTier[t] ?? 0;
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={t} className="rounded-md border p-3">
              <div className="text-[10px] uppercase text-muted-foreground">{t}</div>
              <div className="mt-1 text-lg font-semibold">{count}</div>
              <div className="text-[10px] text-muted-foreground">{pct}%</div>
            </div>
          );
        })}
        <div className="rounded-md border p-3">
          <div className="text-[10px] uppercase text-muted-foreground">Avg latency</div>
          <div className="mt-1 text-lg font-semibold">{stats.avgLatency}ms</div>
        </div>
      </div>

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد قرارات router بعد. سيتم تسجيلها تلقائياً مع كل رسالة.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const tier = (r.routed?.tier as string) ?? "other";
          const model = (r.routed?.model as string) ?? "-";
          const reason = (r.routed?.reason as string) ?? "";
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`h-5 px-1.5 text-[10px] ${TIER_COLORS[tier] ?? ""}`}
                >
                  {tier}
                </Badge>
                <span className="font-mono text-xs">{model}</span>
                {typeof r.latency_ms === "number" && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                    {r.latency_ms}ms
                  </Badge>
                )}
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleTimeString()}
                </span>
              </div>
              {reason && (
                <div className="text-[11px] text-muted-foreground">
                  <span className="opacity-70">reason:</span> {reason}
                </div>
              )}
              {r.user_text && (
                <div className="mt-1 line-clamp-2 text-xs">{r.user_text}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
