import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Trash2, ChevronDown, ChevronRight, Database } from "lucide-react";

type CacheRow = {
  id: string;
  query_hash: string;
  query_text: string | null;
  response: string | null;
  model: string | null;
  hits: number | null;
  created_at: string;
  expires_at: string | null;
};

export default function AgentSemanticCachePanel() {
  const [rows, setRows] = useState<CacheRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("chat_semantic_cache")
      .select("id, query_hash, query_text, response, model, hits, created_at, expires_at")
      .order("hits", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as CacheRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function remove(id: string) {
    const { error } = await supabase.from("chat_semantic_cache").delete().eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  }

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      r.query_text?.toLowerCase().includes(needle) ||
      r.model?.toLowerCase().includes(needle) ||
      r.query_hash.toLowerCase().includes(needle)
    );
  });

  const totalHits = rows.reduce((s, r) => s + (r.hits ?? 0), 0);
  const now = Date.now();
  const expiredCount = rows.filter((r) => r.expires_at && new Date(r.expires_at).getTime() < now).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">Semantic cache من `chat_semantic_cache`</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Entries</div>
          <div className="text-xl font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total Hits</div>
          <div className="text-xl font-semibold">{totalHits}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Expired</div>
          <div className="text-xl font-semibold">{expiredCount}</div>
        </div>
      </div>

      <div className="mb-3">
        <Input placeholder="بحث بـ query/model/hash..." value={q} onChange={(e) => setQ(e.target.value)} />
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
          const isOpen = !!expanded[r.id];
          const isExpired = r.expires_at && new Date(r.expires_at).getTime() < now;
          return (
            <div key={r.id} className="rounded-md border">
              <button
                type="button"
                onClick={() => setExpanded((s) => ({ ...s, [r.id]: !s[r.id] }))}
                className="flex w-full items-start justify-between gap-3 p-3 text-left hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{r.model ?? "unknown"}</Badge>
                    <Badge>{r.hits ?? 0} hits</Badge>
                    {isExpired && <Badge variant="destructive">expired</Badge>}
                  </div>
                  <div className="mt-1 truncate text-sm">{r.query_text ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} · <span className="font-mono">{r.query_hash.slice(0, 12)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void remove(r.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </button>
              {isOpen && (
                <div className="border-t p-3">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">Response</div>
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                    {r.response ?? "—"}
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
