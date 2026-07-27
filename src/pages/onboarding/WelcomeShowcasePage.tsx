/**
 * WelcomeShowcasePage — post-signup onboarding showcase (mobile only).
 * Desktop visitors are sent straight to /chat.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import FeatureShowcase from "@/components/onboarding/FeatureShowcase";

export default function WelcomeShowcasePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 900) navigate("/chat", { replace: true });
  }, [navigate]);

  if (!isMobile) return null;

  return <FeatureShowcase onFinish={() => navigate("/auth", { replace: true })} />;
}
