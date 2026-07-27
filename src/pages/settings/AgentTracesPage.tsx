/** @doc Agent Traces — timeline view of recent agent runs (tools, tokens, latency). */
import { useNavigate } from "react-router-dom";
import ProfileGlassShell, { GlassSection, GlassCard } from "@/components/profile/ProfileGlassShell";
import AgentTracesPanel from "@/pages/agent/AgentTracesPanel";

export default function AgentTracesPage() {
  const navigate = useNavigate();
  return (
    <ProfileGlassShell title="Agent Traces" onBack={() => navigate("/settings")}>
      <GlassSection>
        <GlassCard>
          <div className="p-4">
            <AgentTracesPanel />
          </div>
        </GlassCard>
      </GlassSection>
    </ProfileGlassShell>
  );
}
