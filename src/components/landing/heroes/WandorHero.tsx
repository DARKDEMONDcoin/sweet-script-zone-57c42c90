/**
 * WandorHero — full-bleed looping video with a frosted-glass "prompt card".
 * Typewriter display face (Special Elite) + terracotta accent (#905831).
 * Used by the comparison landing pages.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import videoAsset from "@/assets/landing-heroes/wandor.mp4.asset.json";
import type { LandingHeroProps } from "./types";

const ACCENT = "#905831";

export default function WandorHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  inputPlaceholder,
  bullets = [],
  dir = "ltr",
}: LandingHeroProps) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const submit = () => {
    const q = value.trim();
    navigate(q ? `${ctaHref}${ctaHref.includes("?") ? "&" : "?"}q=${encodeURIComponent(q)}` : ctaHref);
  };

  return (
    <section
      dir={dir}
      className="wandor-hero relative isolate flex min-h-[92vh] w-full flex-col items-center justify-center overflow-hidden px-5 py-24 text-center"
    >
      <style>{`
        .wandor-hero { background:#1b1512; color:#f6efe8; }
        .wandor-hero .w-display { font-family:'Special Elite', ui-monospace, monospace; }
        .wandor-hero .w-body { font-family:'Geist','Inter',system-ui,sans-serif; }
        .wandor-hero .w-glass {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(22px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: 0 24px 70px -30px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.22);
        }
        @keyframes wandor-rise { from { opacity:0; transform: translateY(28px); } to { opacity:1; transform:none; } }
        .wandor-hero .w-r  { animation: wandor-rise .9s cubic-bezier(.22,1,.36,1) both; }
        .wandor-hero .w-r1 { animation: wandor-rise .9s cubic-bezier(.22,1,.36,1) .15s both; }
        .wandor-hero .w-r2 { animation: wandor-rise .9s cubic-bezier(.22,1,.36,1) .3s both; }
        .wandor-hero .w-r3 { animation: wandor-rise .9s cubic-bezier(.22,1,.36,1) .45s both; }
        @media (prefers-reduced-motion: reduce) {
          .wandor-hero [class*="w-r"] { animation: none; }
        }
      `}</style>

      <video
        src={videoAsset.url}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, rgba(20,15,12,.55) 0%, rgba(20,15,12,.35) 40%, rgba(20,15,12,.9) 100%)" }}
        aria-hidden
      />

      {eyebrow ? (
        <span className="w-r w-body mb-6 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] tracking-wide backdrop-blur-md">
          {eyebrow}
        </span>
      ) : null}

      <h1 className="w-r1 w-display mx-auto max-w-4xl text-4xl leading-[1.12] sm:text-5xl md:text-6xl">
        {title}
        {titleAccent ? (
          <>
            {" "}
            <em className="not-italic" style={{ color: ACCENT }}>
              {titleAccent}
            </em>
          </>
        ) : null}
      </h1>

      {subtitle ? (
        <p className="w-r2 w-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          {subtitle}
        </p>
      ) : null}

      <div className="w-r3 w-glass mt-10 w-full max-w-2xl rounded-[26px] p-2.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, 240))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={inputPlaceholder ?? "Ask anything…"}
            aria-label={inputPlaceholder ?? "Ask anything"}
            className="w-body h-12 w-full flex-1 bg-transparent px-4 text-[15px] text-white placeholder:text-white/45 focus:outline-none"
          />
          <button
            type="button"
            onClick={submit}
            className="w-body inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[20px] px-7 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
            style={{ background: ACCENT }}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {secondaryLabel && secondaryHref ? (
        <button
          type="button"
          onClick={() => navigate(secondaryHref)}
          className="w-r3 w-body mt-5 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          {secondaryLabel}
        </button>
      ) : null}

      {bullets.length > 0 ? (
        <ul className="w-r3 w-body mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/60">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full" style={{ background: ACCENT }} aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
