import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link2 } from "lucide-react";

type Binding = {
  id: string;
  agent_slug: string;
  tool_id: string;
  enabled: boolean;
  config: any;
  created_at: string;
  updated_at: string;
  tool?: { tool_key: string; name: string; category: string | null } | null;
};

export default function AgentBindingsPanel() {
  const [rows, setRows] = useState<Binding[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [agent, setAgent] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_tool_bindings")
      .select("*, tool:agent_tools_registry(tool_key,name,category)")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (agent) q = q.eq("agent_slug", agent);
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as unknown as Binding[]);
    setLoading(false);
  }, [agent]);

  useEffect(() => { void load(); }, [load]);

  async function toggle(row: Binding) {
    const { error } = await supabase
      .from("agent_tool_bindings")
      .update({ enabled: !row.enabled })
      .eq("id", row.id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === row.id ? { ...x, enabled: !x.enabled } : x)));
  }

  const agents = Array.from(new Set(rows.map((r) => r.agent_slug))).sort();
  const enabled = rows.filter((r) => r.enabled).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">ربط الأدوات بالوكلاء (agent_tool_bindings)</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{rows.length}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Enabled</div><div className="font-semibold text-primary">{enabled}</div></div>
        <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Agents</div><div className="font-semibold">{agents.length}</div></div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button variant={agent === "" ? "default" : "outline"} size="sm" onClick={() => setAgent("")}>all</Button>
        {agents.map((a) => (
          <Button key={a} variant={agent === a ? "default" : "outline"} size="sm" onClick={() => setAgent(a)}>{a}</Button>
        ))}
      </div>

      {err && <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد ارتباطات.</div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="flex items-center gap-2 font-mono text-sm">
                  {r.agent_slug} → {r.tool?.tool_key ?? r.tool_id}
                  <Badge variant={r.enabled ? "default" : "secondary"}>{r.enabled ? "enabled" : "disabled"}</Badge>
                  {r.tool?.category && <Badge variant="outline">{r.tool.category}</Badge>}
                </div>
                {r.tool?.name && <div className="text-xs text-muted-foreground">{r.tool.name}</div>}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggle(r)}>
              {r.enabled ? "تعطيل" : "تفعيل"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
