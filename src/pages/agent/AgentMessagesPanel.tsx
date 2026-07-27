import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  session_id: string | null;
  user_id: string | null;
  role: string | null;
  content: string | null;
  tool_calls: any;
  tool_results: any;
  metadata: any;
  created_at: string;
};

type Filter = "all" | "user" | "assistant" | "tool" | "system";

export default function AgentMessagesPanel() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sessionId, setSessionId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    let q = supabase
      .from("agent_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("role", filter);
    if (sessionId.trim()) q = q.eq("session_id", sessionId.trim());
    const { data, error } = await q;
    if (error) setErr(error.message);
    else setRows((data ?? []) as Message[]);
    setLoading(false);
  }, [filter, sessionId]);

  useEffect(() => { void load(); }, [load]);

  const roleVariant = (r: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (r === "assistant") return "default";
    if (r === "user") return "secondary";
    if (r === "tool") return "outline";
    return "outline";
  };

  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    const k = r.role ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "user", "assistant", "tool", "system"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="فلترة حسب session_id"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="max-w-md font-mono text-xs"
        />
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {["user", "assistant", "tool", "system"].map((r) => (
          <div key={r} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground capitalize">{r}</div>
            <div className="mt-1 text-2xl font-semibold">{counts[r] ?? 0}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد رسائل في هذا الفلتر.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const isOpen = expanded === r.id;
          const toolCallCount = Array.isArray(r.tool_calls) ? r.tool_calls.length : 0;
          const toolResultCount = Array.isArray(r.tool_results) ? r.tool_results.length : 0;
          return (
            <div key={r.id} className="rounded-md border p-3">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={roleVariant(r.role)}>{r.role ?? "—"}</Badge>
                  {toolCallCount > 0 && (
                    <Badge variant="outline">{toolCallCount} tool calls</Badge>
                  )}
                  {toolResultCount > 0 && (
                    <Badge variant="outline">{toolResultCount} results</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                {r.content && (
                  <div className="mt-2 text-sm whitespace-pre-wrap line-clamp-3">
                    {r.content}
                  </div>
                )}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3 text-xs">
                  {r.session_id && (
                    <button
                      type="button"
                      className="font-mono text-muted-foreground hover:text-foreground"
                      onClick={() => setSessionId(r.session_id!)}
                    >
                      session: {r.session_id}
                    </button>
                  )}
                  {r.content && (
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-2">
                      {r.content}
                    </pre>
                  )}
                  {toolCallCount > 0 && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Tool calls</div>
                      <pre className="max-h-64 overflow-auto rounded bg-muted p-2">
                        {JSON.stringify(r.tool_calls, null, 2)}
                      </pre>
                    </div>
                  )}
                  {toolResultCount > 0 && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Tool results</div>
                      <pre className="max-h-64 overflow-auto rounded bg-muted p-2">
                        {JSON.stringify(r.tool_results, null, 2)}
                      </pre>
                    </div>
                  )}
                  {r.metadata && Object.keys(r.metadata).length > 0 && (
                    <div>
                      <div className="mb-1 font-semibold text-muted-foreground">Metadata</div>
                      <pre className="max-h-40 overflow-auto rounded bg-muted p-2">
                        {JSON.stringify(r.metadata, null, 2)}
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
