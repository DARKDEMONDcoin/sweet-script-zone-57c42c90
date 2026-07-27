import { useState } from "react";
import { Shield, Activity, FolderTree, Gauge, ClipboardCheck, Target, LayoutDashboard, AlertTriangle, Wrench, MessagesSquare, Lightbulb, Eye, Play, MessageCircle, Package, Sparkles, Zap, Link2, Bot, Briefcase, Skull, Radio, FileText, Timer, ShieldAlert, BellRing, Database, KeyRound, Receipt, DollarSign, Bell } from "lucide-react";
import AgentSemanticCachePanel from "./AgentSemanticCachePanel";
import AgentKeyUsagePanel from "./AgentKeyUsagePanel";
import AgentBillingAuditPanel from "./AgentBillingAuditPanel";
import AgentRevenuePanel from "./AgentRevenuePanel";
import AgentAdminNotificationsPanel from "./AgentAdminNotificationsPanel";
import AgentErrorLogPanel from "./AgentErrorLogPanel";
import AgentSecurityAuditPanel from "./AgentSecurityAuditPanel";
import AgentRateLimitsPanel from "./AgentRateLimitsPanel";
import AgentDlqPanel from "./AgentDlqPanel";
import AgentCircuitPanel from "./AgentCircuitPanel";
import AgentAuditPanel from "./AgentAuditPanel";
import AgentInvocationsPanel from "./AgentInvocationsPanel";
import AgentBindingsPanel from "./AgentBindingsPanel";
import AgentAgentsPanel from "./AgentAgentsPanel";
import AgentJobsPanel from "./AgentJobsPanel";
import AgentTracesPanel from "./AgentTracesPanel";
import AgentMemoryPanel from "./AgentMemoryPanel";
import AgentRouterPanel from "./AgentRouterPanel";
import AgentEvalsPanel from "./AgentEvalsPanel";
import AgentGoldenPanel from "./AgentGoldenPanel";
import AgentOverviewPanel from "./AgentOverviewPanel";
import AgentIncidentsPanel from "./AgentIncidentsPanel";
import AgentToolsPanel from "./AgentToolsPanel";
import AgentSessionsPanel from "./AgentSessionsPanel";
import AgentProposalsPanel from "./AgentProposalsPanel";
import AgentObservationsPanel from "./AgentObservationsPanel";
import AgentRunsPanel from "./AgentRunsPanel";
import AgentMessagesPanel from "./AgentMessagesPanel";
import AgentToolRegistryPanel from "./AgentToolRegistryPanel";
import AgentSkillsPanel from "./AgentSkillsPanel";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw } from "lucide-react";

type Approval = {
  id: string;
  tool_name: string;
  decision: "approved" | "denied";
  created_at: string;
  updated_at: string;
};

function ApprovalsPanel() {
  const [rows, setRows] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("hitl_tool_approvals")
      .select("id, tool_name, decision, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) setErr(error.message);
    else setRows((data ?? []) as Approval[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function revoke(id: string) {
    const { error } = await supabase.from("hitl_tool_approvals").delete().eq("id", id);
    if (error) setErr(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  }

  async function toggle(row: Approval) {
    const next = row.decision === "approved" ? "denied" : "approved";
    const { error } = await supabase
      .from("hitl_tool_approvals")
      .update({ decision: next })
      .eq("id", row.id);
    if (error) setErr(error.message);
    else setRows((r) => r.map((x) => (x.id === row.id ? { ...x, decision: next } : x)));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">قرارات HITL المحفوظة</div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {err}
        </div>
      )}

      {rows.length === 0 && !loading && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          لا توجد قرارات HITL محفوظة.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm">
                {r.tool_name}
                <Badge variant={r.decision === "approved" ? "default" : "destructive"}>
                  {r.decision}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(r.updated_at).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toggle(r)}>
                {r.decision === "approved" ? "رفض" : "موافقة"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => revoke(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Tab = "overview" | "agents" | "runs" | "jobs" | "dlq" | "circuit" | "sessions" | "messages" | "traces" | "memory" | "router" | "evals" | "golden" | "tools" | "invocations" | "registry" | "bindings" | "skills" | "incidents" | "observations" | "proposals" | "approvals" | "ratelimits" | "security" | "errors" | "audit" | "semcache" | "keyusage" | "billing" | "revenue" | "adminnotif";

export default function AgentDevToolsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "runs", label: "Runs", icon: Play },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "dlq", label: "Dead Letter", icon: Skull },
    { id: "circuit", label: "Circuit Breakers", icon: Radio },
    { id: "sessions", label: "Sessions", icon: MessagesSquare },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "traces", label: "Traces", icon: Activity },
    { id: "memory", label: "Memory Files", icon: FolderTree },
    { id: "router", label: "Model Router", icon: Gauge },
    { id: "evals", label: "Evals", icon: ClipboardCheck },
    { id: "golden", label: "Golden Set", icon: Target },
    { id: "tools", label: "Tool Calls", icon: Wrench },
    { id: "invocations", label: "Invocations", icon: Zap },
    { id: "registry", label: "Tool Registry", icon: Package },
    { id: "bindings", label: "Bindings", icon: Link2 },
    { id: "skills", label: "Skills", icon: Sparkles },
    { id: "incidents", label: "Incidents", icon: AlertTriangle },
    { id: "observations", label: "Observations", icon: Eye },
    { id: "proposals", label: "Proposals", icon: Lightbulb },
    { id: "approvals", label: "HITL Approvals", icon: Shield },
    { id: "ratelimits", label: "Rate Limits", icon: Timer },
    { id: "security", label: "Security Audit", icon: ShieldAlert },
    { id: "errors", label: "Error Log", icon: BellRing },
    { id: "audit", label: "Audit Log", icon: FileText },
    { id: "semcache", label: "Semantic Cache", icon: Database },
    { id: "keyusage", label: "Key Usage", icon: KeyRound },
    { id: "billing", label: "Billing Audit", icon: Receipt },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "adminnotif", label: "Admin Notifs", icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Agent DevTools</h1>
        <p className="text-sm text-muted-foreground">
          مراقبة تنفيذ الوكيل: traces، ملفات الذاكرة، قرارات الـ router، والموافقات.
        </p>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <AgentOverviewPanel />}
      {tab === "agents" && <AgentAgentsPanel />}
      {tab === "runs" && <AgentRunsPanel />}
      {tab === "jobs" && <AgentJobsPanel />}
      {tab === "dlq" && <AgentDlqPanel />}
      {tab === "circuit" && <AgentCircuitPanel />}
      {tab === "sessions" && <AgentSessionsPanel />}
      {tab === "messages" && <AgentMessagesPanel />}
      {tab === "traces" && <AgentTracesPanel />}
      {tab === "memory" && <AgentMemoryPanel />}
      {tab === "router" && <AgentRouterPanel />}
      {tab === "evals" && <AgentEvalsPanel />}
      {tab === "golden" && <AgentGoldenPanel />}
      {tab === "tools" && <AgentToolsPanel />}
      {tab === "invocations" && <AgentInvocationsPanel />}
      {tab === "registry" && <AgentToolRegistryPanel />}
      {tab === "bindings" && <AgentBindingsPanel />}
      {tab === "skills" && <AgentSkillsPanel />}
      {tab === "incidents" && <AgentIncidentsPanel />}
      {tab === "observations" && <AgentObservationsPanel />}
      {tab === "proposals" && <AgentProposalsPanel />}
      {tab === "approvals" && <ApprovalsPanel />}
      {tab === "ratelimits" && <AgentRateLimitsPanel />}
      {tab === "security" && <AgentSecurityAuditPanel />}
      {tab === "errors" && <AgentErrorLogPanel />}
      {tab === "audit" && <AgentAuditPanel />}
      {tab === "semcache" && <AgentSemanticCachePanel />}
      {tab === "keyusage" && <AgentKeyUsagePanel />}
      {tab === "billing" && <AgentBillingAuditPanel />}
      {tab === "revenue" && <AgentRevenuePanel />}
      {tab === "adminnotif" && <AgentAdminNotificationsPanel />}
    </div>
  );
}
