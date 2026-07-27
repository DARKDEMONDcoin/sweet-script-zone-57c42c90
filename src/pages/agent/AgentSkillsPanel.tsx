import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Power } from "lucide-react";

type Skill = {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  body: string | null;
  enabled_tools: string[] | null;
  preferred_model: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
  triggers: string[] | null;
};

export default function AgentSkillsPanel() {
  const [rows, setRows] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("system_skills")
      .select("id,name,description,instructions,body,enabled_tools,preferred_model,icon,display_order,is_active,triggers")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true })
      .limit(500);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Skill[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      r.name.toLowerCase().includes(needle) ||
      (r.description ?? "").toLowerCase().includes(needle) ||
      (r.triggers ?? []).some((t) => t.toLowerCase().includes(needle))
    );
  }, [rows, q]);

  async function toggleActive(s: Skill) {
    const next = !s.is_active;
    const { error } = await supabase
      .from("system_skills")
      .update({ is_active: next })
      .eq("id", s.id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === s.id ? { ...x, is_active: next } : x)));
  }

  const activeCount = rows.filter((r) => r.is_active).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالاسم أو الوصف أو الـ trigger"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="mt-1 text-2xl font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Active</div>
          <div className="mt-1 text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">Filtered</div>
          <div className="mt-1 text-2xl font-semibold">{filtered.length}</div>
        </div>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد مهارات مطابقة.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((s) => {
          const isOpen = expanded === s.id;
          return (
            <div key={s.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {s.icon && <span className="text-lg">{s.icon}</span>}
                    <span className="font-medium text-sm">{s.name}</span>
                    {!s.is_active && <Badge variant="destructive">disabled</Badge>}
                    {s.preferred_model && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {s.preferred_model}
                      </Badge>
                    )}
                    {s.enabled_tools && s.enabled_tools.length > 0 && (
                      <Badge variant="secondary">{s.enabled_tools.length} tools</Badge>
                    )}
                  </div>
                  {s.description && (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {s.description}
                    </div>
                  )}
                  {s.triggers && s.triggers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.triggers.slice(0, 6).map((t, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
                <Button
                  size="sm"
                  variant={s.is_active ? "outline" : "default"}
                  onClick={() => toggleActive(s)}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                  {s.enabled_tools && s.enabled_tools.length > 0 && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Enabled tools</div>
                      <div className="flex flex-wrap gap-1">
                        {s.enabled_tools.map((t, i) => (
                          <Badge key={i} variant="outline" className="font-mono">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.instructions && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Instructions</div>
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                        {s.instructions}
                      </pre>
                    </div>
                  )}
                  {s.body && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Body</div>
                      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                        {s.body}
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
