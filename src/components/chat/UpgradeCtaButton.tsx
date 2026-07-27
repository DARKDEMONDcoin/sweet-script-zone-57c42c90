import { PrefetchLink } from "@/components/common/PrefetchLink";
import { useUserLang } from "@/lib/authI18n";
import { isPaidUser } from "@/lib/subscriptionGating";

interface UpgradeCtaButtonProps {
  /** null when signed out — button hides itself */
  userId?: string | null;
  /** Already-hydrated chat plan; avoids another profile request in the CTA. */
  userPlan?: string | null;
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
  userPlan,
  size = "md",
  className = "",
}: UpgradeCtaButtonProps) {
  const lang = useUserLang();

  const normalizedPlan = userPlan?.toLowerCase() ?? null;
  const isTopTier = normalizedPlan === "business" || normalizedPlan === "team" || normalizedPlan === "enterprise" || normalizedPlan === "ultimate" || normalizedPlan === "max";

  // Signed-out users get the dedicated Sign in action in the header. Wait for
  // the chat's existing plan hydration, and don't upsell users with no higher
  // self-serve tier available.
  if (!userId || !normalizedPlan || isTopTier) return null;

  const label = isPaidUser(normalizedPlan)
    ? lang === "ar" ? "الخطط" : "Plans"
    : lang === "ar" ? "ترقية" : "Upgrade";

  const dims =
    size === "sm"
      ? "h-9 px-3.5 text-[12.5px] gap-1.5"
      : "h-9 px-4 text-[13px] gap-2";

  return (
    <PrefetchLink
      to="/pricing"
      data-testid="chat-upgrade-cta"
      aria-label={label}
      onClick={() => {
        try {
          navigator.vibrate?.(8);
        } catch {
          /* noop */
        }
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
    </PrefetchLink>
  );
}

