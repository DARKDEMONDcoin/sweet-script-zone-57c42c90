import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { prefetchRoute } from "@/hooks/usePrefetchRoute";
import { useUserLang } from "@/lib/authI18n";

interface UpgradeCtaButtonProps {
  /** null when signed out — button hides itself */
  userId?: string | null;
  /** compact = mobile header size */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Primary monetisation CTA inside the chat.
 * Icon + short verb label (best-practice: icon alone is ambiguous, text alone
 * is easy to skip). High-contrast gradient pill with a slow shine sweep so it
 * reads as the single most important action in the header without shouting.
 */
export default function UpgradeCtaButton({
  userId,
  size = "md",
  className = "",
}: UpgradeCtaButtonProps) {
  const navigate = useNavigate();
  const lang = useUserLang();
  const { loading } = useUserPlan();

  if (!userId || loading) return null;

  const label = lang === "ar" ? "ترقية" : "Upgrade";
  const prefetch = () => {
    void prefetchRoute("/pricing");
  };

  const dims = size === "sm" ? "h-9 px-3.5 text-[12.5px] gap-1.5" : "h-10 px-5 text-[13.5px] gap-2";

  return (
    <button
      type="button"
      data-testid="chat-upgrade-cta"
      aria-label={label}
      onPointerDown={prefetch}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onClick={async (e) => {
        e.preventDefault();
        try {
          navigator.vibrate?.(8);
        } catch {
          /* noop */
        }
        // Await the lazy-route chunk BEFORE navigating so React doesn't
        // flash the Suspense fallback and re-render the page ("double load").
        try {
          await prefetchRoute("/pricing");
        } catch {
          /* noop */
        }
        navigate("/pricing");
      }}
      className={`upgrade-cta group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold shrink-0 whitespace-nowrap transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] ${dims} ${className}`}
    >
      <span className="upgrade-cta__halo" aria-hidden />
      <span className="upgrade-cta__shine" aria-hidden />
      <Crown className="w-[14px] h-[14px] shrink-0 relative z-10" strokeWidth={2.3} />
      <span className="relative z-10 tracking-[0.01em]">{label}</span>
    </button>
  );
}
