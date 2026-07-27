import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
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
  const { isPaid, loading } = useUserPlan();

  if (!userId || loading || isPaid) return null;

  const label = lang === "ar" ? "ترقية" : "Upgrade";
  const prefetch = () => {
    void prefetchRoute("/pricing");
  };

  const dims = size === "sm" ? "h-9 px-3.5 text-[12.5px] gap-1.5" : "h-9 px-4 text-[13px] gap-2";

  return (
    <button
      type="button"
      data-testid="chat-upgrade-cta"
      aria-label={label}
      onPointerDown={prefetch}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onClick={() => {
        prefetch();
        try {
          navigator.vibrate?.(8);
        } catch {
          /* noop */
        }
        navigate("/pricing");
      }}
      className={`upgrade-cta relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold shrink-0 whitespace-nowrap text-primary-foreground transition-transform duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] ${dims} ${className}`}
    >
      <span className="upgrade-cta__shine" aria-hidden />
      <Sparkles className="w-[15px] h-[15px] shrink-0 relative" strokeWidth={2.2} />
      <span className="relative">{label}</span>
    </button>
  );
}
