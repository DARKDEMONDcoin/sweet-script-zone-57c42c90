import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Bell, ChevronDown, ChevronRight, Check } from "lucide-react";

type Row = {
  id: string;
  type: string | null;
  payload: Record<string, unknown> | null;
  read: boolean | null;
  created_at: string;
};

export default function AgentAdminNotificationsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function markRead(id: string) {
    const { error } = await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  async function markAllRead() {
    const { error } = await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => ({ ...x, read: true })));
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "unread" && r.read) return false;
      if (filter === "read" && !r.read) return false;
      if (!q) return true;
      const n = q.toLowerCase();
      return r.type?.toLowerCase().includes(n) || JSON.stringify(r.payload ?? {}).toLowerCase().includes(n);
    });
  }, [rows, filter, q]);

  const stats = useMemo(() => {
    const unread = rows.filter((r) => !r.read).length;
    const types = new Set(rows.map((r) => r.type ?? "unknown")).size;
    return { total: rows.length, unread, types };
  }, [rows]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">إشعارات الإدارة من `admin_notifications`</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={loading || stats.unread === 0}>
            <Check className="h-4 w-4" /> قراءة الكل
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Unread</div>
          <div className="text-xl font-semibold text-primary">{stats.unread}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Types</div>
          <div className="text-xl font-semibold">{stats.types}</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
        <Input placeholder="بحث بـ type أو payload..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد نتائج.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const open = !!expanded[r.id];
          return (
            <div key={r.id} className={`rounded-md border ${!r.read ? "border-primary/40 bg-primary/5" : ""}`}>
              <button
                type="button"
                onClick={() => setExpanded((s) => ({ ...s, [r.id]: !s[r.id] }))}
                className="flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{r.type ?? "—"}</Badge>
                    {!r.read && <Badge>new</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                {!r.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void markRead(r.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </button>
              {open && (
                <div className="border-t p-3 text-xs">
                  <div className="mb-1 font-semibold text-muted-foreground">Payload</div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                    {JSON.stringify(r.payload ?? {}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
