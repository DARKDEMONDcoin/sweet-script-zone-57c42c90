import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Play, CheckCircle2, XCircle } from "lucide-react";

type EvalRow = {
  id: string;
  trace_id: string | null;
  criterion: string;
  score: number | null;
  passed: boolean | null;
  reasoning: string | null;
  judge_model: string | null;
  created_at: string;
};

const DEFAULT_CRITERIA = [
  "الإجابة دقيقة وصحيحة",
  "استخدمت الأدوات بشكل مناسب",
  "الإجابة موجزة وواضحة",
];

export default function AgentEvalsPanel() {
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [traceId, setTraceId] = useState("");
  const [criteriaText, setCriteriaText] = useState(DEFAULT_CRITERIA.join("\n"));
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("agent_evals")
      .select("id, trace_id, criterion, score, passed, reasoning, judge_model, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setErr(error.message);
    else setRows((data ?? []) as EvalRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runJudge() {
    if (!traceId.trim()) { setErr("أدخل trace_id"); return; }
    const criteria = criteriaText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!criteria.length) { setErr("أضف criterion واحد على الأقل"); return; }
    setRunning(true);
    setErr(null);
    try {
      const { error } = await supabase.functions.invoke("agent-eval", {
        body: { trace_id: traceId.trim(), criteria },
      });
      if (error) throw error;
      await load();
    } catch (e: any) {
      setErr(e?.message || "فشل التقييم");
    } finally {
      setRunning(false);
    }
  }

  const passed = rows.filter((r) => r.passed === true).length;
  const failed = rows.filter((r) => r.passed === false).length;
  const avgScore = rows.length
    ? (rows.reduce((s, r) => s + (r.score ?? 0), 0) / rows.length).toFixed(2)
    : "—";

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">إجمالي التقييمات</div>
          <div className="text-lg font-semibold">{rows.length}</div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">نجاح / فشل</div>
          <div className="text-lg font-semibold text-emerald-600">
            {passed} <span className="text-muted-foreground">/</span>{" "}
            <span className="text-destructive">{failed}</span>
          </div>
        </div>
        <div className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">متوسط الدرجة</div>
          <div className="text-lg font-semibold">{avgScore}</div>
        </div>
      </div>

      <div className="mb-4 rounded-md border p-3 space-y-2">
        <div className="text-sm font-medium">شغّل LLM-as-judge على trace</div>
        <Input
          placeholder="trace_id (UUID)"
          value={traceId}
          onChange={(e) => setTraceId(e.target.value)}
          className="font-mono text-xs"
        />
        <textarea
          value={criteriaText}
          onChange={(e) => setCriteriaText(e.target.value)}
          className="w-full min-h-[80px] rounded-md border bg-background p-2 text-sm"
          placeholder="criterion لكل سطر"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={runJudge} disabled={running}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span className="ml-2">تقييم</span>
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
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
            لا توجد تقييمات بعد
          </div>
        )}
        {rows.map((r) => (
          <div key={r.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  {r.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-medium">{r.criterion}</span>
                  <Badge variant="outline" className="text-xs">
                    {r.score?.toFixed(2) ?? "—"}
                  </Badge>
                </div>
                {r.reasoning && (
                  <div className="mt-1 text-xs text-muted-foreground">{r.reasoning}</div>
                )}
                <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                  {r.judge_model} · trace {r.trace_id?.slice(0, 8) ?? "—"} ·{" "}
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
