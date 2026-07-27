/**
 * TransformHero — modern hero with a looping video, a search-style input box
 * with a live character counter, and Schibsted Grotesk / Fustat typography.
 * Used by the solution, industry and city landing pages.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import videoAsset from "@/assets/landing-heroes/transform.mp4.asset.json";
import type { LandingHeroProps } from "./types";

const MAX_CHARS = 200;

export default function TransformHero({
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
      className="transform-hero relative isolate flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-5 py-24 text-center"
    >
      <style>{`
        .transform-hero { background:#0a0a0b; color:#fbfbfc; }
        .transform-hero .t-head { font-family:'Schibsted Grotesk','Inter',system-ui,sans-serif; }
        .transform-hero .t-body { font-family:'Fustat','Inter',system-ui,sans-serif; }
        .transform-hero .t-box {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 80px -40px rgba(0,0,0,.9);
        }
        @keyframes transform-fade { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform:none; } }
        .transform-hero .t-f0 { animation: transform-fade .8s ease-out .05s both; }
        .transform-hero .t-f1 { animation: transform-fade .8s ease-out .2s both; }
        .transform-hero .t-f2 { animation: transform-fade .8s ease-out .35s both; }
        .transform-hero .t-f3 { animation: transform-fade .8s ease-out .5s both; }
        @media (prefers-reduced-motion: reduce) { .transform-hero [class*="t-f"] { animation:none; } }
      `}</style>

      <video
        src={videoAsset.url}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-90"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, rgba(10,10,11,.6) 0%, rgba(10,10,11,.45) 45%, rgba(10,10,11,.95) 100%)" }}
        aria-hidden
      />

      {eyebrow ? (
        <span className="t-f0 t-body mb-6 inline-flex items-center rounded-full border border-white/18 bg-white/[0.06] px-4 py-1.5 text-[13px] text-white/75">
          {eyebrow}
        </span>
      ) : null}

      <h1 className="t-f1 t-head mx-auto max-w-4xl text-[2.4rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-5xl md:text-6xl">
        {title}
        {titleAccent ? <span className="block text-white/55">{titleAccent}</span> : null}
      </h1>

      {subtitle ? (
        <p className="t-f2 t-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
          {subtitle}
        </p>
      ) : null}

      <div className="t-f3 t-box mt-10 w-full max-w-2xl rounded-3xl p-4 text-start">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 shrink-0 text-white/40" strokeWidth={1.8} aria-hidden />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={inputPlaceholder ?? "Describe what you want to build…"}
            aria-label={inputPlaceholder ?? "Describe what you want to build"}
            className="t-body h-11 w-full flex-1 bg-transparent text-[15px] text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="t-body text-[12px] tabular-nums text-white/35">
            {value.length}/{MAX_CHARS}
          </span>
          <button
            type="button"
            onClick={submit}
            className="t-head inline-flex h-10 items-center rounded-full bg-white px-6 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {secondaryLabel && secondaryHref ? (
        <button
          type="button"
          onClick={() => navigate(secondaryHref)}
          className="t-f3 t-body mt-5 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          {secondaryLabel}
        </button>
      ) : null}

      {bullets.length > 0 ? (
        <ul className="t-f3 t-body mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/45">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
