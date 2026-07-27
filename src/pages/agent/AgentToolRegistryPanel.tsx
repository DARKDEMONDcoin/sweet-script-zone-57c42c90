import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Power } from "lucide-react";

type Tool = {
  id: string;
  tool_key: string;
  name: string | null;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  category: string | null;
  icon: string | null;
  edge_function: string | null;
  input_schema: any;
  output_kind: string | null;
  base_credits: number | null;
  credit_formula: any;
  requires_premium: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
};

export default function AgentToolRegistryPanel() {
  const [rows, setRows] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("agent_tools_registry")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("tool_key", { ascending: true })
      .limit(500);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Tool[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.category && s.add(r.category));
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (!needle) return true;
      return (
        r.tool_key.toLowerCase().includes(needle) ||
        (r.name ?? "").toLowerCase().includes(needle) ||
        (r.name_ar ?? "").toLowerCase().includes(needle) ||
        (r.description ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, category]);

  async function toggleActive(t: Tool) {
    const next = !t.is_active;
    const { error } = await supabase
      .from("agent_tools_registry")
      .update({ is_active: next })
      .eq("id", t.id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === t.id ? { ...x, is_active: next } : x)));
  }

  const activeCount = rows.filter((r) => r.is_active).length;
  const premiumCount = rows.filter((r) => r.requires_premium).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو المفتاح"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="mt-1 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Active</div>
          <div className="mt-1 text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Premium</div>
          <div className="mt-1 text-2xl font-semibold">{premiumCount}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Filtered</div>
          <div className="mt-1 text-2xl font-semibold">{filtered.length}</div>
        </div>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد أدوات في هذا الفلتر.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((t) => {
          const isOpen = expanded === t.id;
          return (
            <div key={t.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {t.icon && <span className="text-lg">{t.icon}</span>}
                    <span className="font-mono text-sm">{t.tool_key}</span>
                    {t.category && <Badge variant="outline">{t.category}</Badge>}
                    {t.requires_premium && <Badge variant="secondary">premium</Badge>}
                    {!t.is_active && <Badge variant="destructive">disabled</Badge>}
                    {t.base_credits ? (
                      <Badge variant="outline">{t.base_credits} cr</Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm">
                    {t.name_ar || t.name || "—"}
                  </div>
                  {(t.description_ar || t.description) && (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {t.description_ar || t.description}
                    </div>
                  )}
                </button>
                <Button
                  size="sm"
                  variant={t.is_active ? "outline" : "default"}
                  onClick={() => toggleActive(t)}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                  {t.edge_function && (
                    <div>
                      <span className="text-muted-foreground">edge:</span>{" "}
                      <span className="font-mono">{t.edge_function}</span>
                    </div>
                  )}
                  {t.output_kind && (
                    <div>
                      <span className="text-muted-foreground">output:</span>{" "}
                      <span className="font-mono">{t.output_kind}</span>
                    </div>
                  )}
                  {t.input_schema && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Input schema</div>
                      <pre className="max-h-64 overflow-auto rounded bg-muted p-2">
                        {JSON.stringify(t.input_schema, null, 2)}
                      </pre>
                    </div>
                  )}
                  {t.credit_formula && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Credit formula</div>
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2">
                        {JSON.stringify(t.credit_formula, null, 2)}
                      </pre>
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
