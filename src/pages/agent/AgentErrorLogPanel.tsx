import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, BellRing, Check } from "lucide-react";

type Row = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  source: string | null;
  route: string | null;
  message: string;
  raw_error: string | null;
  context: any;
  user_agent: string | null;
  notified: boolean;
  created_at: string;
};

export default function AgentErrorLogPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unnotified" | "notified">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("admin_error_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter === "unnotified") q = q.eq("notified", false);
    if (filter === "notified") q = q.eq("notified", true);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  async function markNotified(id: string) {
    const { error } = await supabase
      .from("admin_error_log")
      .update({ notified: true })
      .eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, notified: true } : x)));
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.message.toLowerCase().includes(s) ||
      (r.source ?? "").toLowerCase().includes(s) ||
      (r.route ?? "").toLowerCase().includes(s) ||
      (r.user_email ?? "").toLowerCase().includes(s)
    );
  });

  const unnotified = rows.filter((r) => !r.notified).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          سجل أخطاء المستخدمين (admin_error_log)
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["all", "unnotified", "notified"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "الكل" : f === "unnotified" ? "غير مُبلَّغ" : "مُبلَّغ"}
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
          <div className="text-xs text-muted-foreground">غير مُبلَّغ</div>
          <div className="text-lg font-semibold text-destructive">{unnotified}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">مصادر فريدة</div>
          <div className="text-lg font-semibold">{new Set(rows.map((r) => r.source ?? "—")).size}</div>
        </div>
      </div>

      <Input
        placeholder="بحث بـ message / source / route / email..."
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
          لا توجد أخطاء.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="min-w-0 flex-1 text-start"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {!r.notified && <BellRing className="h-4 w-4 text-destructive" />}
                    <span className="text-sm font-medium truncate">{r.message}</span>
                    {r.source && <Badge variant="outline">{r.source}</Badge>}
                    {r.notified && <Badge variant="secondary">notified</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                    {r.route && ` · ${r.route}`}
                    {r.user_email && ` · ${r.user_email}`}
                  </div>
                </button>
                {!r.notified && (
                  <Button variant="outline" size="sm" onClick={() => markNotified(r.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isOpen && (
                <div className="mt-2 space-y-2">
                  {r.raw_error && (
                    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">
                      {r.raw_error}
                    </pre>
                  )}
                  {r.context && (
                    <pre className="max-h-48 overflow-auto rounded-md bg-muted p-2 text-xs">
                      {JSON.stringify(r.context, null, 2)}
                    </pre>
                  )}
                  {r.user_agent && (
                    <div className="text-xs text-muted-foreground truncate">
                      UA: {r.user_agent}
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
