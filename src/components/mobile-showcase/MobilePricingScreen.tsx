/** @doc Mobile /pricing — clean single-screen redesign.
 *  Menu button → hero with Megsy logo → colored model marquee →
 *  Max/Pro toggle → real Pro/Max vs Free comparison → Monthly/Yearly cards →
 *  Fixed subscribe button. No scroll: everything fits within 100dvh.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";
import { BrandIcon } from "@/components/chat/media/BrandIcon";
import { useUserLang } from "@/lib/authI18n";
import { type PlanTier } from "@/data/pricingData";
import megsyLogo from "@/assets/megsy-project-logo.png";

interface Props {
  isYearly: boolean;
  onToggleYearly: (yearly: boolean) => void;
  onSubscribe: (tier: PlanTier) => void;
  loadingTier?: PlanTier | null;
  onMenuClick?: () => void;
}

const MODELS = [
  { name: "Claude Opus 4.8", brand: "claude" },
  { name: "GPT-5.5", brand: "openai" },
  { name: "Gemini 3.5", brand: "gemini" },
  { name: "Qwen 3 Max", brand: "qwen" },
  { name: "Grok 4", brand: "grok" },
  { name: "Seedance Pro", brand: "seedance" },
  { name: "Sora 2", brand: "sora" },
  { name: "Flux Pro", brand: "flux" },
];

interface FeatureRow {
  title: string;
  value: "yes" | "limited" | "no";
  note?: string;
  freeValue: "yes" | "limited" | "no";
  freeNote?: string;
}

export default function MobilePricingScreen({
  isYearly,
  onToggleYearly,
  onSubscribe,
  loadingTier,
  onMenuClick,
}: Props) {
  const lang = useUserLang();
  const isAr = lang === "ar";
  const [plan, setPlan] = useState<"pro" | "max">("pro");

  // ---------- Feature matrix ----------
  // Everything is Unlimited on paid plans EXCEPT paid image/video generation:
  //  · Premium images (Flux Pro · GPT Image · Imagen) → Pro: credits, Max: UNLIMITED
  //  · Premium videos (Sora · Seedance · Kling)      → Pro: 240 MC, Max: 500 MC
  // Feature rows written like ChatGPT-Plus / Claude-Pro / Perplexity-Pro:
  // one concept per line, short label, quantitative value on the right.
  // Sourced from src/data/pricingData.ts + src/data/siteKnowledge.md.
  // Feature rows — single line, benefit-first, real quotas from siteKnowledge.
  // Style inspired by ChatGPT-Plus / Claude-Pro / Perplexity-Pro / Cursor:
  // short label on the left, quantitative value chip on the right.
  const proFeatures: FeatureRow[] = isAr
    ? [
        { title: "محادثة · النماذج الرائدة",     value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "فيديو سينمائي",                 value: "yes", note: "٢٤٠/شهر",   freeValue: "no" },
        { title: "أولوية وتكاملات",               value: "yes", note: "∞",     freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Cinematic video",                value: "yes", note: "240 / mo",  freeValue: "no" },
        { title: "Priority & integrations",        value: "yes", note: "∞",  freeValue: "limited", freeNote: "Standard" },
      ];

  const maxFeatures: FeatureRow[] = isAr
    ? [
        { title: "محادثة · النماذج الرائدة",     value: "yes", note: "∞",  freeValue: "limited", freeNote: "محدود" },
        { title: "بحث معمّق",                     value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "Megsy Coder",                    value: "yes", note: "∞",  freeValue: "no" },
        { title: "مستندات وعروض",                 value: "yes", note: "∞",  freeValue: "limited", freeNote: "٣/يوم" },
        { title: "تعليم · مهارات · MCP",          value: "yes", note: "∞",     freeValue: "yes" },
        { title: "صور احترافية",                  value: "yes", note: "∞",  freeValue: "no" },
        { title: "فيديو سينمائي",                 value: "yes", note: "٥٠٠/شهر",   freeValue: "no" },
        { title: "أولوية ×٣ وتكاملات",            value: "yes", note: "×٣ أسرع",   freeValue: "limited", freeNote: "قياسي" },
      ]
    : [
        { title: "Chat · flagship models",         value: "yes", note: "∞", freeValue: "limited", freeNote: "Lite" },
        { title: "Deep Research",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Megsy Coder",                    value: "yes", note: "∞", freeValue: "no" },
        { title: "Docs & Slides",                  value: "yes", note: "∞", freeValue: "limited", freeNote: "3/day" },
        { title: "Study · Skills · MCP",           value: "yes", note: "∞",  freeValue: "yes" },
        { title: "Pro images",                     value: "yes", note: "∞", freeValue: "no" },
        { title: "Cinematic video",                value: "yes", note: "500 / mo",  freeValue: "no" },
        { title: "3× priority & integrations",     value: "yes", note: "3× faster", freeValue: "limited", freeNote: "Standard" },
      ];

  const features = plan === "pro" ? proFeatures : maxFeatures;

  const t = useMemo(
    () =>
      isAr
        ? {
            heroA: "منصة",
            heroB: "ذكاء واحدة.",
            heroC: "إمكانيات لا نهائية.",
            max: "Max",
            pro: "Pro",
            free: "Free",
            monthly: "شهرياً",
            yearly: "سنوياً",
            month: "شهر",
            year: "سنة",
            subscribe: (p: string) => `اشترك في ${p}`,
          }
        : {
            heroA: "One AI Platform.",
            heroB: "Infinity",
            heroC: "possibilities.",
            max: "Max",
            pro: "Pro",
            free: "Free",
            monthly: "Monthly",
            yearly: "Yearly",
            month: "mo",
            year: "yr",
            subscribe: (p: string) => `Get ${p}`,
          },
    [isAr],
  );

  // ---------- Pricing (USD) ----------
  // Pro  monthly: $7  (was $25, -72%)  · Pro  yearly: $149 (was $298, -50%)
  // Max  monthly: $39 (was $78, -50%)  · Max  yearly: $299 (was $598, -50%)
  type PriceBlock = { price: string; strike: string; discount: string };
  const priceMap: Record<"pro" | "max", { monthly: PriceBlock; yearly: PriceBlock }> = {
    pro: {
      monthly: { price: "7", strike: "25", discount: "-72%" },
      yearly: { price: "149", strike: "298", discount: "-50%" },
    },
    max: {
      monthly: { price: "39", strike: "78", discount: "-50%" },
      yearly: { price: "299", strike: "598", discount: "-50%" },
    },
  };
  const currentPrices = priceMap[plan];

  const activeTier: PlanTier = plan === "pro" ? "pro" : "elite";
  const isLoading = loadingTier === activeTier;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 60% at 50% 0%, #0b0b0b 0%, #000 55%, #000 100%)",
        color: "#fff",
        fontFamily: 'Inter, -apple-system, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      {/* Top bar — only menu button */}
      <header
        className="flex items-center px-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)", paddingBottom: 4 }}
      >
        <MobileSidebarButton
          onClick={() => onMenuClick?.()}
          ariaLabel={isAr ? "القائمة" : "Menu"}
          className="!text-white"
        />
      </header>

      {/* Hero copy with Megsy logo */}
      <div className="px-6 pt-8 text-center">
        <h1
          className="mx-auto font-normal leading-[1.02] text-white"
          style={{
            fontFamily: '"Instrument Serif", "Fraunces", Georgia, serif',
            fontSize: "clamp(28px, 7.6vw, 38px)",
            letterSpacing: "-0.015em",
          }}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap align-baseline">
            <img
              src={megsyLogo}
              alt="Megsy"
              className="inline-block h-[0.92em] w-auto -translate-y-[2px] select-none"
              style={{
                filter: "brightness(0) invert(1) saturate(100%)",
              }}
              draggable={false}
            />
            <span>{t.heroA}</span>
          </span>
          <br />
          <span className="italic text-neutral-300">{t.heroB}</span>{" "}
          <span>{t.heroC}</span>
        </h1>
      </div>

      {/* Models marquee */}
      <div className="relative mt-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 start-0 z-10 w-10"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 end-0 z-10 w-10"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))" }}
        />
        <div
          className="flex w-max items-center gap-6 whitespace-nowrap px-6"
          style={{ animation: "pricing-marquee 22s linear infinite" }}
        >
          {[...MODELS, ...MODELS].map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-200">
              <BrandIcon name={m.brand} size={16} variant="color" />
              <span>{m.name}</span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pricing-marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Max / Pro toggle */}
      <div className="mt-6 flex justify-center">
        <div
          className="relative flex items-center rounded-full p-1"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <button
            type="button"
            onClick={() => setPlan("max")}
            className="relative z-10 h-8 min-w-[64px] rounded-full px-4 text-[13px] font-medium transition-colors"
            style={{
              background: plan === "max" ? "#fff" : "transparent",
              color: plan === "max" ? "#0e0e0e" : "#f5f5f5",
            }}
          >
            {t.max}
          </button>
          <button
            type="button"
            onClick={() => setPlan("pro")}
            className="relative z-10 h-8 min-w-[64px] rounded-full px-4 text-[13px] font-medium transition-colors"
            style={{
              background: plan === "pro" ? "#fff" : "transparent",
              color: plan === "pro" ? "#0e0e0e" : "#f5f5f5",
            }}
          >
            {t.pro}
          </button>
        </div>
      </div>

      {/* Comparison card — no icons, real features */}
      <div className="mx-4 mt-6 flex-1 min-h-0">
        <div
          className="h-full rounded-[20px] px-3.5 py-2.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          <div
            key={plan}
            className="pricing-plan-switch"
            style={{ animation: "pricing-plan-in 360ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Header row */}
            <div className="grid grid-cols-[minmax(0,1fr)_84px_66px] items-center pb-1.5 text-[11px] font-semibold uppercase tracking-wide">
              <span className="text-neutral-400">{isAr ? "المميزات" : "Features"}</span>
              <span className="text-center text-teal-300">{plan === "pro" ? t.pro : t.max}</span>
              <span className="text-center text-neutral-500">{t.free}</span>
            </div>
            <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.09)" }} />
            <ul className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {features.map((f, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[minmax(0,1fr)_84px_66px] items-center gap-2 py-[6px]"
                  style={{
                    opacity: 0,
                    animation: "pricing-row-in 360ms cubic-bezier(0.22,1,0.36,1) forwards",
                    animationDelay: `${60 + i * 35}ms`,
                  }}
                >
                  <div className="min-w-0">
                    <span className="block truncate whitespace-nowrap text-[12.5px] font-medium leading-tight text-neutral-100">
                      {f.title}
                    </span>
                  </div>
                  <span className="flex justify-center">
                    {f.note ? (
                      <span className="whitespace-nowrap text-[11px] font-semibold text-teal-300">
                        {f.note}
                      </span>
                    ) : f.value === "yes" ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/15">
                        <Check className="h-3.5 w-3.5 text-teal-300" strokeWidth={2.6} />
                      </span>
                    ) : (
                      <Minus className="h-4 w-4 text-neutral-600" strokeWidth={2.2} />
                    )}
                  </span>
                  <span className="flex justify-center">
                    {f.freeValue === "yes" ? (
                      <Check className="h-4 w-4 text-neutral-400" strokeWidth={2.2} />
                    ) : f.freeValue === "limited" ? (
                      <span className="whitespace-nowrap text-[10.5px] font-medium text-neutral-400">
                        {f.freeNote}
                      </span>
                    ) : (
                      <Minus className="h-4 w-4 text-neutral-600" strokeWidth={2.2} />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <style>{`
            @keyframes pricing-plan-in {
              from { opacity: 0; transform: translateY(6px) scale(0.985); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes pricing-row-in {
              from { opacity: 0; transform: translateX(${isAr ? "8px" : "-8px"}); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
        </div>
      </div>

      {/* Billing cards */}
      <div className="px-4 pt-6">
        <div className="relative grid grid-cols-2 gap-2.5">
          {/* Animated selection background */}
          <div
            className="pointer-events-none absolute inset-y-0 rounded-[16px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              insetInlineStart: isYearly ? 0 : "calc(50% + 5px)",
              width: "calc(50% - 5px)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.55)",
            }}
          />

          {/* Yearly */}
          <button
            type="button"
            onClick={() => onToggleYearly(true)}
            className="relative rounded-[16px] p-3 text-start transition-colors duration-300"
            style={{
              background: "transparent",
              border: "1px solid transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-neutral-200">{t.yearly}</span>
              <span
                className="rounded-full px-1.5 py-[1px] text-[10px] font-semibold transition-transform duration-300"
                style={{ background: "rgba(45,212,191,0.18)", color: "#5eead4" }}
              >
                {currentPrices.yearly.discount}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 tabular-nums overflow-hidden" dir="ltr">
              <span
                key={currentPrices.yearly.price + plan}
                className="text-[15px] font-semibold text-white animate-fade-in"
              >
                ${currentPrices.yearly.price}
              </span>
              <span className="text-[11px] text-neutral-400">/{t.year}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 line-through tabular-nums" dir="ltr">
              ${currentPrices.yearly.strike}/{t.year}
            </div>
          </button>

          {/* Monthly */}
          <button
            type="button"
            onClick={() => onToggleYearly(false)}
            className="relative rounded-[16px] p-3 text-start transition-colors duration-300"
            style={{
              background: "transparent",
              border: "1px solid transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-neutral-200">{t.monthly}</span>
              <span
                className="rounded-full px-1.5 py-[1px] text-[10px] font-semibold transition-transform duration-300"
                style={{ background: "rgba(45,212,191,0.18)", color: "#5eead4" }}
              >
                {currentPrices.monthly.discount}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 tabular-nums overflow-hidden" dir="ltr">
              <span
                key={currentPrices.monthly.price + plan}
                className="text-[15px] font-semibold text-white animate-fade-in"
              >
                ${currentPrices.monthly.price}
              </span>
              <span className="text-[11px] text-neutral-400">/{t.month}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-neutral-500 line-through tabular-nums" dir="ltr">
              ${currentPrices.monthly.strike}/{t.month}
            </div>
          </button>
        </div>
      </div>

      {/* Fixed subscribe button */}
      <div
        className="px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}
      >
        <button
          key={plan}
          type="button"
          onClick={() => onSubscribe(activeTier)}
          disabled={isLoading}
          className="flex h-[54px] w-full items-center justify-center rounded-full text-[15px] font-semibold transition active:scale-[0.99] disabled:opacity-60"
          style={{ background: "#fff" }}
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          ) : (
            <span className="!text-black">
              {t.subscribe(plan === "pro" ? t.pro : t.max)}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
