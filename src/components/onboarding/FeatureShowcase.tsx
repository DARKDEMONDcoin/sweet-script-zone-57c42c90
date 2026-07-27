/**
 * FeatureShowcase — five full-screen onboarding panels that explain what Megsy
 * does. Full-bleed (no phone mockup): the device itself is the frame.
 * Horizontal scroll-snap pager with dots. Pure presentation.
 */
import { useEffect, useRef, useState } from "react";
import { Timer, ChevronRight, ChevronLeft } from "lucide-react";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import { RatingBadge } from "@/components/foundations/rating-badge";
import ServicesStage from "./ServicesStage";
import {
  MODEL_ROWS,
  type OnboardingModel,
} from "./allModels";


const BG =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260704_143500_a76b8e64-2c69-4683-80e7-2bb060a921d6.png&w=1280&q=85";

/** One ambient background clip, shared by every onboarding page. */
const PAGE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085844_21a8f4b3-dea5-4ede-be16-d53f6973bb14.mp4";



const CSS = `
@keyframes fsFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes fsGlow { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
@keyframes fsShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.fs-up { opacity: 0; animation: fsFadeUp .42s cubic-bezier(0.22,1,0.36,1) forwards; }
/* Only one continuous ambient loop is allowed on screen at a time (the marquee).
   Float / glow / shimmer are kept as static styles so the eye has one focal motion. */
.fs-float { animation: none; }
.fs-glow { opacity: 0.45; animation: none; }
.fs-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); }
@media (prefers-reduced-motion: reduce) { .fs-float, .fs-glow, .fs-shimmer { animation: none; } }
.fs-pager { scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.fs-pager::-webkit-scrollbar { display: none; }
.fs-page { scroll-snap-align: start; }
.fs-glass {
  position: relative;
  background: rgba(255,255,255,0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
}
.fs-glass::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  pointer-events: none;
}
.fs-glass-selected {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 2px rgba(255,255,255,0.2);
}
.fs-glass-selected::before {
  background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 20%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.25) 80%, rgba(255,255,255,0.6) 100%);
}
.fs-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
@keyframes fsScroll { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
.fs-track { display: flex; width: max-content; gap: 10px; padding: 2px 12px; animation: fsScroll linear infinite; }
@media (prefers-reduced-motion: reduce) { .fs-track { animation: none; } }
.fs-chip {
  display: inline-flex; align-items: center; gap: 10px;
  border-radius: 999px; padding: 10px 16px 10px 10px; white-space: nowrap;
}
.fs-chip-icon {
  display: grid; place-items: center; width: 30px; height: 30px;
  border-radius: 999px; background: transparent; color: inherit;
}
.fs-chip-name { font-size: 14px; font-weight: 500; color: #fff; }
@keyframes fsBackIn { from { opacity: 0; transform: translateX(-10px) scale(.9); } to { opacity: 1; transform: translateX(0) scale(1); } }
.fs-back { animation: fsBackIn .35s cubic-bezier(0.22,1,0.36,1) both; }
@media (prefers-reduced-motion: reduce) { .fs-back { animation: none; } }
.fs-cta {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(18px) saturate(160%);
  color: #fff;
  -webkit-tap-highlight-color: transparent;
  transition: background .25s ease, transform .12s cubic-bezier(0.22,1,0.36,1), box-shadow .25s ease;
}
.fs-cta:hover { background: rgba(255,255,255,0.16); }
.fs-cta:active { transform: scale(0.965); background: rgba(255,255,255,0.2); }
.fs-cta:focus-visible { outline: 2px solid rgba(255,255,255,0.7); outline-offset: 3px; }
@keyframes fsRipple { from { opacity: .35; transform: scale(0); } to { opacity: 0; transform: scale(2.6); } }
.fs-ripple {
  position: absolute; border-radius: 999px; pointer-events: none;
  width: 140px; height: 140px; margin: -70px 0 0 -70px;
  background: radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0) 68%);
  animation: fsRipple .55s cubic-bezier(0.22,1,0.36,1) forwards;
}

/* page transitions */
@keyframes fsPageInNext { from { opacity: 0; transform: translate3d(28px,0,0) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes fsPageInPrev { from { opacity: 0; transform: translate3d(-28px,0,0) scale(.985); } to { opacity: 1; transform: none; } }
.fs-slide-next { animation: fsPageInNext .42s cubic-bezier(0.22,1,0.36,1) both; }
.fs-slide-prev { animation: fsPageInPrev .42s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes fsLabelIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.fs-label { display: inline-block; animation: fsLabelIn .28s ease-out both; }
.fs-dot { border: 0; padding: 0; cursor: pointer; background: transparent; }
.fs-dot span { display: block; height: 6px; border-radius: 999px; transition: width .3s cubic-bezier(0.22,1,0.36,1), background .3s ease, opacity .3s ease; }
.fs-bg { transition: transform 1.2s cubic-bezier(0.22,1,0.36,1), filter .8s ease; }
/* drag surface follows the finger, then settles back with a spring-ish ease */
.fs-drag { will-change: transform; }
.fs-drag-settle { transition: transform .34s cubic-bezier(0.22,1,0.36,1); }
@media (prefers-reduced-motion: reduce) {
  .fs-up, .fs-slide-next, .fs-slide-prev, .fs-label { animation: none !important; opacity: 1 !important; transform: none !important; }
  .fs-bg, .fs-drag-settle { transition: none; }
  .fs-ripple { display: none; }
}
`;



const FONT = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';

/* ------------------------------- primitives ------------------------------ */

function Badge({ label }: { label: string }) {
  return (
    <div
      className="fs-up fs-glass"
      style={{
        animationDelay: "0.06s",
        alignSelf: "flex-start",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        padding: "10px 12px",
        marginBottom: 32,
      }}
    >
      <Timer size={12} color="rgba(255,255,255,0.8)" />
      <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{label}</span>
    </div>
  );
}

function Title({ kicker, heading }: { kicker?: string; heading: string }) {
  return (
    <div className="fs-up" style={{ animationDelay: "0.14s", marginBottom: 28 }}>
      {kicker && (
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 10 }}>{kicker}</p>
      )}
      <h2
        style={{
          color: "#fff",
          fontSize: 32,
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
        }}
      >
        {heading}
      </h2>
    </div>
  );
}

function OptionGrid({ items, preselected = [] }: { items: string[]; preselected?: number[] }) {
  const [sel, setSel] = useState<number[]>(preselected);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignContent: "start" }}>
      {items.map((label, i) => {
        const on = sel.includes(i);
        return (
          <button
            key={label}
            type="button"
            onClick={() => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}
            className={`fs-up fs-glass${on ? " fs-glass-selected" : ""}`}
            style={{
              animationDelay: `${0.16 + i * 0.05}s`,
              borderRadius: 32,
              minHeight: 104,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#fff" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ModelChip({ model }: { model: OnboardingModel }) {
  const hasIcon = hasBrandIcon(model.name, model.provider);
  return (
    <span className="fs-glass fs-chip">
      <span className="fs-chip-icon">
        {hasIcon ? (
          <BrandIcon name={model.name} provider={model.provider} size={22} variant="color" />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{model.name.charAt(0)}</span>
        )}
      </span>
      <span className="fs-chip-name">{model.name}</span>
    </span>
  );
}

function ModelRow({
  models,
  reverse = false,
  duration,
  delay,
}: {
  models: OnboardingModel[];
  reverse?: boolean;
  duration: number;
  delay: number;
}) {
  const loop = [...models, ...models];
  return (
    <div className="fs-up fs-marquee" style={{ animationDelay: `${delay}s` }}>
      <div
        className="fs-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((m, i) => (
          <ModelChip key={`${m.name}-${i}`} model={m} />
        ))}
      </div>
    </div>
  );
}

function ModelMarquee() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "0 -24px" }}>
      {MODEL_ROWS.slice(0, -2).map((models, i) => (
        <ModelRow
          key={i}
          models={models}
          duration={45 + i * 5}
          delay={0.2 + i * 0.04}
          reverse={i % 2 === 1}
        />
      ))}
    </div>
  );
}


function StatRows({ items }: { items: Array<{ value: string; label: string }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((s, i) => (
        <div
          key={s.label}
          className="fs-up fs-glass"
          style={{
            animationDelay: `${0.16 + i * 0.05}s`,
            borderRadius: 28,
            padding: "18px 20px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ color: "#fff", fontSize: 40, fontWeight: 600, letterSpacing: "-0.06em", lineHeight: 0.9 }}
          >
            <CountUp value={s.value} duration={1200 + i * 200} />
          </span>

          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function ListRows({ rows }: { rows: Array<{ title: string; meta: string }> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r, i) => (
        <div
          key={r.title}
          className="fs-up fs-glass"
          style={{
            animationDelay: `${0.16 + i * 0.05}s`,
            borderRadius: 28,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {r.title}
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 2 }}>{r.meta}</p>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
        </div>
      ))}
    </div>
  );
}

function VoiceBlock({ label }: { label: string }) {
  return (
    <div
      className="fs-up"
      style={{
        animationDelay: "0.34s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 28,
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -22,
          width: 170,
          height: 120,
          background:
            "radial-gradient(ellipse at center, rgba(220,200,80,0.5) 0%, rgba(180,160,40,0.2) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="fs-glass" style={{ width: 64, height: 64, borderRadius: 999, display: "grid", placeItems: "center" }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          {[
            [4, 9, 17],
            [9, 4, 22],
            [13, 1, 25],
            [17, 5, 21],
            [22, 10, 16],
          ].map(([x, y1, y2]) => (
            <line key={x} x1={x} y1={y1} x2={x} y2={y2} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          ))}
        </svg>
      </div>
      <span style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{label}</span>
    </div>
  );
}

/** Clean count-up animation for numeric values like "30M+", "150+", "4.9". */
function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const [display, setDisplay] = useState(target ? "0" : value);

  useEffect(() => {
    if (!match) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay((target * eased).toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
      {suffix}
    </span>
  );
}


/* --------------------------------- pages --------------------------------- */

function Page({ children }: { children: import("react").ReactNode }) {
  return (
    <section
      className="fs-page"
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px 24px 152px",
      }}
    >
      {children}
    </section>
  );
}


const PAGES = [
  <Page key="chat">
    <Title heading="All the AI you need, one tap away." />
    <ModelMarquee />
  </Page>,
  <Page key="services">
    <Title heading="One app, every AI workflow" />
    <ServicesStage />
  </Page>,
  <Page key="pricing">
    <Title heading="All tools & models for $5" />
    <div
      className="fs-up fs-glass"
      style={{
        borderRadius: 32,
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            color: "#fff",
            fontSize: 56,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          $5
        </span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: 500 }}>
          first month
        </span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
        Get every AI model, agent and workflow in one subscription. No hidden fees, cancel anytime.
      </p>
      <ListRows
        rows={[
          { title: "All flagship models", meta: "GPT-5.6, Claude Opus 5, Gemini 3.6, Llama 4" },
          { title: "40+ agents unlocked", meta: "Research, coder, images, video, slides" },
          { title: "Full access for $5", meta: "No limits, no hidden fees, cancel anytime" },
        ]}
      />
    </div>
  </Page>,
  <Page key="community">
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div className="fs-up" style={{ animationDelay: "0.08s", marginBottom: 28 }}>
        <RatingBadge rating={5} title="Loved by millions" subtitle="4.9 average rating" theme="light" />
      </div>

      <div
        className="fs-up"
        style={{
          animationDelay: "0.16s",
          color: "#fff",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: "-0.06em",
          lineHeight: 0.95,
        }}
      >
        <CountUp value="30M+" duration={1600} />
      </div>

      <h2
        className="fs-up"
        style={{
          animationDelay: "0.22s",
          color: "#fff",
          fontSize: 26,
          fontWeight: 400,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          marginTop: 14,
          maxWidth: 300,
        }}
      >
        people are already using Megsy
      </h2>

      <p
        className="fs-up"
        style={{
          animationDelay: "0.27s",
          color: "rgba(255,255,255,0.65)",
          fontSize: 15,
          lineHeight: 1.5,
          marginTop: 12,
          maxWidth: 290,
        }}
      >
        Join them now and try Megsy for yourself — it only takes a few seconds.
      </p>

      <div
        className="fs-up"
        style={{
          animationDelay: "0.32s",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
          marginTop: 26,
        }}
      >
        {["150+ countries", "1.2B messages", "60+ models"].map((t) => (
          <span
            key={t}
            className="fs-glass"
            style={{
              borderRadius: 999,
              padding: "9px 14px",
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  </Page>,


];

/**
 * CTA copy is intentionally escalating:
 * 1) frictionless start  2) commitment / loss aversion
 * 3) reactance + "you were warned"  4) final low-effort command
 */
const CTA_LABELS = [
  "Start now",
  "Yes — I want the best",
  "I've been warned, let me in",
  "Tap now to enter",
];


/* ---------------------------------- shell --------------------------------- */

export default function FeatureShowcase({ onFinish }: { onFinish?: () => void }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const last = index >= PAGES.length - 1;

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.remove();
      document.body.style.overflow = prev;
    };
  }, []);

  const goTo = (target: number) => {
    setIndex((i) => {
      const clamped = Math.max(0, Math.min(PAGES.length - 1, target));
      if (clamped === i) return i;
      setDir(clamped > i ? "next" : "prev");
      return clamped;
    });
  };

  const next = () => {
    if (last) {
      onFinish?.();
      return;
    }
    goTo(index + 1);
  };

  const back = () => goTo(index - 1);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, last]);

  // interactive swipe: the page follows the finger, with resistance at the edges
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const touch = useRef({ x: 0, y: 0, active: false, axis: "" as "" | "x" | "y" }).current;

  const onTouchStart = (e: import("react").TouchEvent) => {
    touch.x = e.touches[0].clientX;
    touch.y = e.touches[0].clientY;
    touch.active = true;
    touch.axis = "";
    setDragging(true);
  };
  const onTouchMove = (e: import("react").TouchEvent) => {
    if (!touch.active) return;
    const dx = e.touches[0].clientX - touch.x;
    const dy = e.touches[0].clientY - touch.y;
    if (!touch.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      touch.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (touch.axis !== "x") return;
    const atEdge = (dx > 0 && index === 0) || (dx < 0 && last);
    setDragX(atEdge ? dx * 0.25 : dx * 0.75);
  };
  const onTouchEnd = (e: import("react").TouchEvent) => {
    if (!touch.active) return;
    touch.active = false;
    setDragging(false);
    const dx = e.changedTouches[0].clientX - touch.x;
    setDragX(0);
    if (touch.axis !== "x" || Math.abs(dx) < 56) return;
    if (dx < 0) goTo(index + 1);
    else back();
  };

  // tactile CTA press: ripple from the touch point + a short haptic tick
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);
  const press = (e: import("react").MouseEvent<HTMLButtonElement>, run: () => void) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipple({ id: Date.now(), x: e.clientX - r.left, y: e.clientY - r.top });
    navigator.vibrate?.(8);
    run();
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        background: "#0a0a0a",
        fontFamily: FONT,
        touchAction: "pan-y",
      }}
    >
      <img
        src={BG}
        alt=""
        aria-hidden
        className="fs-bg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(12px)",
          transform: `scale(${1.1 + index * 0.035}) translate3d(${index * -8}px, 0, 0)`,
        }}
      />
      <video
        src={PAGE_VIDEO}
        poster={BG}
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(8px)",
          transform: "scale(1.12)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(138,154,170,0.3)" }} />


      <div
        className={dragging ? "fs-drag" : "fs-drag fs-drag-settle"}
        style={{
          position: "relative",
          height: "100%",
          transform: dragX ? `translate3d(${dragX}px,0,0)` : undefined,
        }}
      >
        <div
          key={index}
          className={dir === "next" ? "fs-slide-next" : "fs-slide-prev"}
          style={{ position: "relative", height: "100%" }}
        >
          {PAGES[index]}
        </div>
      </div>



      {/* dots */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 104,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          zIndex: 30,
        }}
      >
        {PAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            className="fs-dot"
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          >
            <span
              style={{
                width: i === index ? 20 : 6,
                background: i === index ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          </button>
        ))}
      </div>

      {/* continue */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
          padding: "16px 24px calc(24px + env(safe-area-inset-bottom))",
          background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.85) 60%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {index > 0 && (
          <button
            type="button"
            aria-label="Back"
            onClick={(e) => press(e, back)}
            className="fs-glass fs-cta fs-back"
            style={{
              width: 56,
              height: 56,
              flex: "0 0 auto",
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
            }}
          >
            <ChevronLeft size={22} strokeWidth={1.8} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => press(e, next)}
          className="fs-glass fs-cta"
          style={{
            flex: 1,
            height: 56,
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {ripple && (
            <span
              key={ripple.id}
              className="fs-ripple"
              aria-hidden
              onAnimationEnd={() => setRipple(null)}
              style={{ left: ripple.x, top: ripple.y }}
            />
          )}
          <span key={`label-${index}`} className="fs-label">
            {CTA_LABELS[index] || "Continue"}
          </span>
        </button>

      </div>

    </div>
  );
}
