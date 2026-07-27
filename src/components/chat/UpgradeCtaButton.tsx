import { useNavigate } from "react-router-dom";
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
 * "Emerald glow glass" — hairline glass pill with emerald accent icon,
 * quiet by default, subtle underglow + single shine sweep on hover.
 * Icon + short verb (Upgrade / ترقية) — best-practice for header CTAs.
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

  const dims =
    size === "sm"
      ? "h-9 px-3.5 text-[12.5px] gap-1.5"
      : "h-9 px-4 text-[13px] gap-2";

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
        try {
          await prefetchRoute("/pricing");
        } catch {
          /* noop */
        }
        navigate("/pricing");
      }}
      className={`upgrade-cta group relative inline-flex items-center justify-center rounded-full font-medium shrink-0 whitespace-nowrap active:scale-[0.97] ${dims} ${className}`}
    >
      <span className="upgrade-cta__halo" aria-hidden />
      <svg
        className="upgrade-cta__icon relative z-10 h-[14px] w-[14px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
      <span className="relative z-10 tracking-[0.01em]">{label}</span>
      <span className="upgrade-cta__shine-wrap" aria-hidden>
        <span className="upgrade-cta__shine" />
      </span>
    </button>
  );
}

