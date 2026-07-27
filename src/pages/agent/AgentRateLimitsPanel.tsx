import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Trash2, Ban } from "lucide-react";

type Row = {
  id: string;
  user_id: string | null;
  ip_hash: string | null;
  bucket: string;
  window_start: string;
  count: number;
  hour_count: number;
  hour_start: string;
  blocked_until: string | null;
  updated_at: string;
};

export default function AgentRateLimitsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "blocked">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("rate_limit_buckets")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (filter === "blocked") q = q.gt("blocked_until", new Date().toISOString());
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function unblock(id: string) {
    const { error } = await supabase
      .from("rate_limit_buckets")
      .update({ blocked_until: null, count: 0, hour_count: 0 })
      .eq("id", id);
    if (error) setErr(error.message);
    else void load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("rate_limit_buckets").delete().eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  }

  const now = Date.now();
  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.bucket.toLowerCase().includes(s) ||
      (r.ip_hash ?? "").toLowerCase().includes(s) ||
      (r.user_id ?? "").toLowerCase().includes(s)
    );
  });

  const blockedCount = rows.filter((r) => r.blocked_until && new Date(r.blocked_until).getTime() > now).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          حدود المعدل (rate limits) للمستخدمين والـ IPs
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all", "blocked"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "الكل" : "محظور فقط"}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">إجمالي</div>
          <div className="text-lg font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">محظور حالياً</div>
          <div className="text-lg font-semibold text-destructive">{blockedCount}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">buckets فريدة</div>
          <div className="text-lg font-semibold">{new Set(rows.map((r) => r.bucket)).size}</div>
        </div>
      </div>

      <Input
        placeholder="بحث بـ bucket / user_id / ip_hash..."
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
          لا توجد سجلات.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const isBlocked = r.blocked_until && new Date(r.blocked_until).getTime() > now;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm">{r.bucket}</span>
                    {isBlocked && (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" /> محظور
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.user_id ? `user: ${r.user_id.slice(0, 8)}…` : r.ip_hash ? `ip: ${r.ip_hash.slice(0, 12)}…` : "—"}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>window: <b>{r.count}</b></div>
                    <div>hour: <b>{r.hour_count}</b></div>
                    <div className="text-muted-foreground">
                      updated: {new Date(r.updated_at).toLocaleTimeString()}
                    </div>
                    {isBlocked && (
                      <div className="text-destructive">
                        until: {new Date(r.blocked_until!).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {isBlocked && (
                    <Button variant="outline" size="sm" onClick={() => unblock(r.id)}>
                      رفع الحظر
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
