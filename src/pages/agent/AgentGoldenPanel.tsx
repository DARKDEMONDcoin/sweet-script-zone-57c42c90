import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Plus, Trash2, Play } from "lucide-react";

type Row = {
  id: string;
  label: string;
  input: string;
  expected_criteria: any;
  is_active: boolean;
  created_at: string;
};

export default function AgentGoldenPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [input, setInput] = useState("");
  const [criteria, setCriteria] = useState("");
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("agent_golden_dataset")
      .select("id, label, input, expected_criteria, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addCase() {
    if (!label.trim() || !input.trim()) { setErr("label و input مطلوبة"); return; }
    const list = criteria.split("\n").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("agent_golden_dataset").insert({
      label: label.trim(),
      input: input.trim(),
      expected_criteria: list,
      is_active: true,
    });
    if (error) setErr(error.message);
    else {
      setLabel(""); setInput(""); setCriteria("");
      await load();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("agent_golden_dataset").delete().eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  }

  async function runGolden() {
    setRunning(true);
    setErr(null);
    try {
      const { error } = await supabase.functions.invoke("agent-eval", {
        body: { golden: true },
      });
      if (error) throw error;
    } catch (e: any) {
      setErr(e?.message || "فشل التشغيل");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="mb-4 rounded-md border p-3 space-y-2">
        <div className="text-sm font-medium">أضف حالة اختبار جديدة</div>
        <Input
          placeholder="label (اسم مختصر)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <textarea
          placeholder="input (سؤال المستخدم)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full min-h-[70px] rounded-md border bg-background p-2 text-sm"
        />
        <textarea
          placeholder="expected criteria (سطر لكل معيار)"
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          className="w-full min-h-[70px] rounded-md border bg-background p-2 text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={addCase}>
            <Plus className="h-4 w-4 mr-1" /> إضافة
          </Button>
          <Button size="sm" variant="outline" onClick={runGolden} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span className="mr-2">شغّل الـ Golden Set</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {err && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="space-y-2">
        {rows.length === 0 && !loading && (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            لا توجد حالات في الـ golden set بعد
          </div>
        )}
        {rows.map((r) => {
          const list = Array.isArray(r.expected_criteria) ? r.expected_criteria : [];
          return (
            <div key={r.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{r.label}</span>
                    {r.is_active && <Badge variant="outline" className="text-xs">active</Badge>}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.input}</div>
                  {list.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {list.map((c: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
