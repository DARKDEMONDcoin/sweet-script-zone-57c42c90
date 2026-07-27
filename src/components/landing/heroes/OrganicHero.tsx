/**
 * OrganicHero — "Organic Visions" cinematic full-screen hero.
 * Full-bleed looping video, Garamond display type, per-character staggered
 * fade, glass mobile menu and a liquid-glass CTA (Framer Motion).
 */
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { LandingHeroProps } from "./types";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4";

const NAV_LINKS = [
  { label: "Models", href: "/models" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

function StaggeredFade({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function OrganicHero({
  title,
  titleAccent,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  bullets = [],
  dir = "ltr",
}: LandingHeroProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <section
      dir={dir}
      className="organic-hero relative h-screen w-full overflow-hidden"
      style={{ background: "#010101" }}
    >
      <style>{`
        .organic-hero { font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif; color:#fff; -webkit-font-smoothing: antialiased; }
        .organic-hero .font-garamond { font-family: 'Garamond', 'EB Garamond', 'Times New Roman', serif; }
        .organic-hero .mobile-menu-glass {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(20px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .organic-hero .oh-liquid {
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          transition: background .3s ease, box-shadow .3s ease, transform .15s ease;
        }
        .organic-hero .oh-liquid::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        .organic-hero .oh-liquid:hover {
          background: rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }
        .organic-hero .oh-liquid:active { transform: scale(0.98); }
      `}</style>

      <video
        src={VIDEO_URL}
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden />

      {/* NAV */}
      <nav className="relative z-20 flex items-center justify-between px-5 py-6 sm:px-8 md:justify-center md:gap-14">
        <Link
          to="/"
          className="text-[13px] font-light uppercase tracking-[0.25em] text-white md:absolute md:left-8 md:tracking-[0.3em]"
        >
          Megsy AI
        </Link>
        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-[12px] font-light uppercase tracking-[0.2em] text-white/80 transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="text-white md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mobile-menu-glass fixed left-4 right-4 top-16 z-50 flex flex-col items-center gap-5 rounded-2xl py-8 md:hidden"
          >
            {NAV_LINKS.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
              >
                <Link
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="text-[13px] font-light uppercase tracking-[0.25em] text-white/90 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-12 text-center sm:px-8 sm:pt-16 md:pt-24">
        <h1 className="font-garamond mb-6 font-normal leading-[1.08] tracking-tight text-white text-4xl sm:mb-8 sm:text-6xl md:text-8xl lg:text-9xl">
          <span className="block">
            <StaggeredFade text={title} />
          </span>
          {titleAccent ? (
            <span className="block">
              <StaggeredFade text={titleAccent} />
            </span>
          ) : null}
        </h1>

        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mb-8 max-w-xs text-sm font-light leading-relaxed text-white/70 sm:mb-10 sm:max-w-md sm:text-base md:text-lg"
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => navigate(ctaHref)}
            className="oh-liquid rounded-full px-7 py-3.5 text-[12px] uppercase tracking-[0.18em] text-white/90 sm:px-10 sm:py-4 sm:tracking-[0.2em]"
          >
            {ctaLabel}
          </button>
          {secondaryLabel && secondaryHref ? (
            <button
              type="button"
              onClick={() => navigate(secondaryHref)}
              className="rounded-full px-6 py-3.5 text-[12px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </motion.div>

        {bullets.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12px] font-light uppercase tracking-[0.16em] text-white/45"
          >
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </motion.ul>
        ) : null}
      </div>
    </section>
  );
}
