/**
 * ServicesStage — onboarding page 2.
 * Shows every Megsy service with a small, animated mock of what it does
 * (no videos, no images: pure CSS/SVG motion). Auto-advances, tappable rail.
 */
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Telescope,
  GraduationCap,
  FileText,
  Image as ImageIcon,
  Clapperboard,
  Code2,
  Presentation,
  Wrench,
  Globe,
  Paperclip,
  PanelRight,
  FileSpreadsheet,
  Plug,
  Brain,
  Monitor,
  Terminal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  LogoGmail,
  LogoSlack,
  LogoNotion,
  LogoDrive,
  LogoGithub,
  LogoCalendar,
  LogoFigma,
  LogoStripe,
} from "@/components/onboarding/AppLogos";



const CSS = `
@keyframes svIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes svBar { from { width: 0%; } to { width: var(--w); } }
@keyframes svType { from { width: 0; } to { width: 100%; } }
@keyframes svPulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
@keyframes svTile { 0% { opacity: .12; filter: blur(6px); } 100% { opacity: 1; filter: blur(0); } }
@keyframes svScan { 0% { transform: translateX(-110%); } 100% { transform: translateX(110%); } }
@keyframes svSlide { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes svVideoBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.sv-in { opacity: 0; animation: svIn .45s cubic-bezier(.22,1,.36,1) forwards; }
.sv-row { position: relative; height: 8px; border-radius: 999px; background: rgba(255,255,255,.10); overflow: hidden; }
.sv-row > i { display: block; height: 100%; border-radius: 999px; background: rgba(255,255,255,.55); width: 0; animation: svBar 1.1s cubic-bezier(.22,1,.36,1) forwards; }
.sv-line { height: 7px; border-radius: 999px; background: rgba(255,255,255,.16); }
.sv-scan { position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent); animation: svScan 2.4s ease-in-out infinite; }
.sv-tile { border-radius: 12px; background: rgba(255,255,255,.10); box-shadow: inset 0 1px 1px rgba(255,255,255,.14); animation: svTile .8s ease forwards; opacity: 0; }
.sv-dotpulse { animation: svPulse 1.2s ease-in-out infinite; }
.sv-slide { animation: svSlide 3s ease-in-out infinite; }
.sv-caret { display: inline-block; width: 7px; height: 14px; background: rgba(255,255,255,.8); vertical-align: -2px; animation: svPulse 1s steps(1) infinite; }
.sv-pager { display: flex; align-items: center; gap: 10px; }
.sv-arrow { flex: none; width: 44px; height: 44px; border-radius: 999px; display: grid; place-items: center; color: #fff; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.06); backdrop-filter: blur(14px); transition: transform .25s ease, background .25s ease; }
.sv-arrow:active { transform: scale(.94); background: rgba(255,255,255,.12); }
.sv-current { flex: 1; min-width: 0; text-align: center; padding: 8px 12px; border-radius: 18px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.06); backdrop-filter: blur(14px); }
.sv-name { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: -0.01em; line-height: 1.2; }
.sv-note { font-size: 11.5px; color: rgba(255,255,255,.6); margin-top: 2px; line-height: 1.25; }
.sv-video-row > i { width: 100%; transform-origin: left center; transform: scaleX(0); animation: svVideoBar 6.5s linear infinite; }


@media (prefers-reduced-motion: reduce) { .sv-scan, .sv-slide, .sv-dotpulse, .sv-caret { animation: none; } }
`;

/* ------------------------------- mock panels ------------------------------ */

const Lines = ({ widths, delay = 0 }: { widths: number[]; delay?: number }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {widths.map((w, i) => (
      <div
        key={i}
        className="sv-line sv-in"
        style={{ width: `${w}%`, animationDelay: `${delay + i * 0.07}s` }}
      />
    ))}
  </div>
);

/* ------------------------------ live helpers ------------------------------ */

/** Advances 0..steps-1 on an interval, then loops. */
function useSequence(steps: number, ms = 900) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % (steps + 1)), ms);
    return () => clearInterval(t);
  }, [steps, ms]);
  return i;
}

const LiveBubble = ({ side, children }: { side: "l" | "r"; children: React.ReactNode }) => (
  <div
    className="sv-in"
    style={{
      alignSelf: side === "l" ? "flex-start" : "flex-end",
      maxWidth: "84%",
      padding: "10px 14px",
      borderRadius: 18,
      borderBottomLeftRadius: side === "l" ? 6 : 18,
      borderBottomRightRadius: side === "r" ? 6 : 18,
      background: side === "l" ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.20)",
      color: side === "l" ? "rgba(255,255,255,.82)" : "#fff",
      fontSize: 13.5,
      lineHeight: 1.4,
      animationDelay: "0s",
    }}
  >
    {children}
  </div>
);

const Typing = () => (
  <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="sv-dotpulse"
        style={{ width: 5, height: 5, borderRadius: 999, background: "#fff", animationDelay: `${i * 0.18}s` }}
      />
    ))}
  </span>
);

/* ---------------------------------- mocks --------------------------------- */

const CHAT_TURNS = [
  { side: "r" as const, text: "Compare our Q3 numbers and draft the summary." },
  { side: "l" as const, text: "Revenue is up 18% vs Q2, churn down to 2.1%." },
  { side: "r" as const, text: "Nice — turn it into a 3-slide deck." },
  { side: "l" as const, text: "Done. Deck is ready with charts and notes." },
];

const ChatMock = () => {
  const [n, setN] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    let stop = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (i: number) => {
      if (stop) return;
      if (i >= CHAT_TURNS.length) {
        timers.push(
          setTimeout(() => {
            setN(0);
            run(0);
          }, 2200),
        );
        return;
      }
      const isAI = CHAT_TURNS[i].side === "l";
      setTyping(isAI);
      timers.push(
        setTimeout(
          () => {
            setTyping(false);
            setN(i + 1);
            timers.push(setTimeout(() => run(i + 1), 700));
          },
          isAI ? 1100 : 350,
        ),
      );
    };
    run(0);
    return () => {
      stop = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 190, justifyContent: "flex-end" }}>
      {CHAT_TURNS.slice(0, n).map((t, i) => (
        <LiveBubble key={`${i}-${t.text}`} side={t.side}>
          {t.text}
        </LiveBubble>
      ))}
      {typing && (
        <LiveBubble side="l">
          <Typing />
        </LiveBubble>
      )}
    </div>
  );
};

const RESEARCH_STEPS = [
  { t: "Scanning 42 sources", w: 100 },
  { t: "Cross-checking claims", w: 92 },
  { t: "Writing the report", w: 78 },
];

const ResearchMock = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {RESEARCH_STEPS.map((s, i) => (
        <div key={s.t}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12.5, color: "rgba(255,255,255,.7)" }}>
            <span>{s.t}</span>
            <span style={{ color: "rgba(255,255,255,.45)" }}>{s.w}%</span>
          </div>
          <div className="sv-row">
            <i style={{ "--w": `${s.w}%`, animationDelay: `${i * 0.18}s` } as React.CSSProperties} />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["arxiv", "reuters", "docs", "+39"].map((c, i) => (
          <span
            key={c}
            className="sv-in"
            style={{ animationDelay: `${0.4 + i * 0.12}s`, fontSize: 11, padding: "4px 9px", borderRadius: 999, border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.6)" }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
};

const LEARN_OPTIONS = ["Attention head", "Vector memory", "Tokenizer"];

const LearnMock = () => {
  const step = useSequence(4, 900);
  const picked = step >= 3 ? 1 : -1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)" }}>Which layer stores long-term context?</p>
      {LEARN_OPTIONS.map((o, i) => {
        const hovered = step === i && picked < 0;
        const correct = picked === i;
        return (
          <div
            key={o}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 13px",
              borderRadius: 14,
              transition: "all .35s ease",
              border: `1px solid rgba(255,255,255,${correct ? 0.45 : hovered ? 0.26 : 0.12})`,
              background: correct ? "rgba(255,255,255,.14)" : hovered ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.03)",
              color: correct ? "#fff" : "rgba(255,255,255,.62)",
              fontSize: 13.5,
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.4)",
                background: correct ? "#fff" : "transparent",
                transition: "background .3s ease",
              }}
            />
            {o}
          </div>
        );
      })}
    </div>
  );
};

const DOC_LINES = [
  "Revenue reached $1.24M, up 18% from Q2, driven by annual plans and the new team tier.",
  "• Churn down to 2.1% (from 3.4%)",
  "• 4,180 new paid seats",
  "• Support response time: 42s median",
  "Recommendation: move the team tier to the top of the pricing page and expand local payments.",
];

const DocsMock = () => {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.10)",
        position: "relative",
        overflow: "hidden",
        minHeight: 190,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, opacity: 0.55, fontSize: 11 }}>
        <FileText size={12} /> report.docx · autosaved
      </div>
      <div className="sv-in" style={{ fontSize: 15, fontWeight: 600, color: "#fff", minHeight: 20 }}>
        Q3 Growth Report
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12.5,
          lineHeight: 1.75,
          color: "rgba(255,255,255,.78)",
          whiteSpace: "pre-wrap",
        }}
      >
        {DOC_LINES.map((line, i) => (
          <p key={line} className="sv-in" style={{ animationDelay: `${0.08 + i * 0.08}s`, margin: i === 4 ? "8px 0 0" : 0 }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

const IMAGE_SHOTS = [
  { label: "Nano Banana Pro", src: "/showcase/img-1.webp" },
  { label: "GPT-Image 2", src: "/showcase/img-2.webp" },
  { label: "Nano Banana 2", src: "/showcase/img-3.webp" },
  { label: "Gemini 3 Pro Image", src: "/showcase/img-4.webp" },
  { label: "Recraft V4", src: "/showcase/img-5.webp" },
  { label: "Ideogram 3", src: "/showcase/img-6.webp" },
];

const ImagesMock = () => {
  const step = useSequence(6, 520);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)" }}>
        Prompt · “cinematic 35mm, soft light” — 6 variations
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "72px", gap: 8 }}>
        {IMAGE_SHOTS.map((s, i) => {
          const on = i < step;
          return (
            <div
              key={s.label}
              style={{
                position: "relative",
                borderRadius: 12,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                overflow: "hidden",
                opacity: on ? 1 : 0.25,
                filter: "none",
                transform: on ? "scale(1)" : "scale(.96)",
                transition: "opacity .45s ease, transform .45s cubic-bezier(.22,1,.36,1)",
              }}
            >
              <img
                src={s.src}
                alt={s.label}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {!on && <div className="sv-scan" />}

            </div>
          );
        })}
      </div>
    </div>
  );
};

const VIDEO_SRC = "/showcase/vid-1.mp4";

const VideoMock = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)" }}>
        Prompt · “brand film, cinematic, 24fps”
      </div>
      <div
        style={{
          position: "relative",
          height: 132,
          borderRadius: 16,
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.12)",
          overflow: "hidden",
        }}
      >
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    </div>
  );
};




const CODE_LINES = [
  "// build the checkout flow",
  "export async function pay(cart) {",
  "  const s = await megsy.plan(cart)",
  "  return s.deploy()",
  "}",
];

const CodeMock = () => {
  return (
    <div style={{ padding: 16, borderRadius: 18, background: "rgba(0,0,0,.28)", border: "1px solid rgba(255,255,255,.10)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5, lineHeight: 1.85, minHeight: 148, color: "rgba(255,255,255,.86)", whiteSpace: "pre-wrap" }}>
      {CODE_LINES.map((line, i) => (
        <div key={line} className="sv-in" style={{ animationDelay: `${i * 0.08}s` }}>
          {line}
        </div>
      ))}
    </div>
  );
};


const SlidesMock = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div className="sv-in sv-slide" style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)" }}>
      <div style={{ width: "52%", height: 11, borderRadius: 6, background: "rgba(255,255,255,.65)", marginBottom: 12 }} />
      <Lines widths={[96, 78]} delay={0.15} />
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="sv-in" style={{ flex: 1, height: 62, borderRadius: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", padding: 9, animationDelay: `${0.25 + i * 0.1}s` }}>
          <div style={{ width: "70%", height: 6, borderRadius: 4, background: "rgba(255,255,255,.35)", marginBottom: 7 }} />
          <div style={{ width: "100%", height: 5, borderRadius: 4, background: "rgba(255,255,255,.14)", marginBottom: 5 }} />
          <div style={{ width: "84%", height: 5, borderRadius: 4, background: "rgba(255,255,255,.14)" }} />
        </div>
      ))}
    </div>
  </div>
);

const SheetMock = () => (
  <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.12)" }}>
    {Array.from({ length: 5 }).map((_, r) => (
      <div key={r} className="sv-in" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", animationDelay: `${r * 0.09}s` }}>
        {Array.from({ length: 3 }).map((__, c) => (
          <div
            key={c}
            style={{
              padding: "11px 12px",
              borderBottom: r < 4 ? "1px solid rgba(255,255,255,.08)" : "none",
              borderRight: c < 2 ? "1px solid rgba(255,255,255,.08)" : "none",
              background: r === 0 ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.03)",
            }}
          >
            <div style={{ height: 6, borderRadius: 4, background: r === 0 ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.20)", width: `${55 + ((r * 7 + c * 13) % 40)}%` }} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

const APPS = [
  { Icon: LogoGmail, t: "Gmail" },
  { Icon: LogoSlack, t: "Slack" },
  { Icon: LogoNotion, t: "Notion" },
  { Icon: LogoDrive, t: "Drive" },
  { Icon: LogoGithub, t: "GitHub" },
  { Icon: LogoCalendar, t: "Calendar" },
  { Icon: LogoFigma, t: "Figma" },
  { Icon: LogoStripe, t: "Stripe" },
];


const AppsMock = () => {
  const R = 104;
  const C = 130;
  return (
    <div style={{ position: "relative", width: C * 2, height: C * 2, margin: "0 auto" }}>
      <svg width={C * 2} height={C * 2} style={{ position: "absolute", inset: 0 }}>
        {APPS.map((_, i) => {
          const a = (i / APPS.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={C}
              y1={C}
              x2={C + Math.cos(a) * R}
              y2={C + Math.sin(a) * R}
              stroke="rgba(255,255,255,.22)"
              strokeWidth={1}
              className="sv-dotpulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          );
        })}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={1} />
      </svg>

      <div
        className="sv-in"
        style={{
          position: "absolute",
          left: C - 34,
          top: C - 34,
          width: 68,
          height: 68,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.28)",
          background: "rgba(255,255,255,.10)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: ".01em",
        }}
      >
        Megsy
      </div>

      {APPS.map(({ Icon, t }, i) => {
        const a = (i / APPS.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <div
            key={t}
            className="sv-in"
            title={t}
            style={{
              position: "absolute",
              left: C + Math.cos(a) * R - 24,
              top: C + Math.sin(a) * R - 24,
              width: 48,
              height: 48,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.5)",
              background: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animationDelay: `${0.05 + i * 0.07}s`,
            }}
          >
            <Icon size={22} />

          </div>
        );
      })}
    </div>
  );
};

const ToolsMock = () => {
  const tools = [
    { Icon: Monitor, t: "Computer use" },
    { Icon: Terminal, t: "Code runner" },
    { Icon: Globe, t: "Web search" },
    { Icon: Paperclip, t: "Files & PDFs" },
    { Icon: PanelRight, t: "Canvas" },
    { Icon: Brain, t: "Memory" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {tools.map(({ Icon, t }, i) => (
        <div
          key={t}
          className="sv-in"
          style={{
            animationDelay: `${0.06 + i * 0.08}s`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 12px",
            borderRadius: 16,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.12)",
            color: "rgba(255,255,255,.85)",
            fontSize: 12.5,
          }}
        >
          <Icon size={17} strokeWidth={1.8} color="#fff" />
          {t}
        </div>
      ))}
    </div>
  );
};


/* -------------------------------- services -------------------------------- */

const SERVICES = [
  { id: "chat", note: "One chat, every model.", label: "Chat", icon: MessageSquare, headline: "Chat with every model", desc: "Ask anything and switch models mid-conversation. Your context stays.", Mock: ChatMock },
  { id: "research", note: "Sourced reports, not guesses.", label: "Deep Research", icon: Telescope, headline: "Deep research with sources", desc: "Give a topic. Megsy reads dozens of pages and returns a report with links you can check.", Mock: ResearchMock },
  { id: "learn", note: "Lessons at your own pace.", label: "Learning", icon: GraduationCap, headline: "Learn step by step", desc: "Any subject explained simply, with examples and short quizzes to test yourself.", Mock: LearnMock },
  { id: "docs", note: "Ready-to-send documents.", label: "Docs", icon: FileText, headline: "Write full documents", desc: "Reports, emails and long articles written and formatted, ready to edit or export.", Mock: DocsMock },
  { id: "images", note: "Make and edit images.", label: "Images", icon: ImageIcon, headline: "Create and edit images", desc: "Describe an image and get several versions, or upload one and change it.", Mock: ImagesMock },
  { id: "video", note: "A prompt becomes a clip.", label: "Video", icon: Clapperboard, headline: "Turn text into video", desc: "Write a scene and get a short clip. Top video models, all in one place.", Mock: VideoMock },
  { id: "code", note: "Write, run and ship code.", label: "Coder", icon: Code2, headline: "Build real software", desc: "Megsy plans the work, writes the code, runs it and shows you the result.", Mock: CodeMock },
  { id: "slides", note: "A full deck from one prompt.", label: "Slides", icon: Presentation, headline: "Presentations in one prompt", desc: "Outline, slide design and speaker notes, ready to present or export.", Mock: SlidesMock },
  { id: "sheets", note: "Sheets, reports and resumes.", label: "Sheets & Resume", icon: FileSpreadsheet, headline: "Sheets, reports and resumes", desc: "Turn raw numbers or your history into clean files you can download.", Mock: SheetMock },
  { id: "apps", note: "Your apps, inside the chat.", label: "Integrations", icon: Plug, headline: "Connect your apps", desc: "Link Gmail, Slack, Notion, Drive, GitHub and more so Megsy works with your real data.", Mock: AppsMock },
  { id: "tools", note: "Built-in tools, no setup.", label: "In-chat tools", icon: Wrench, headline: "Tools inside the chat", desc: "Web search, file reading, a code runner, canvas and memory — always one tap away.", Mock: ToolsMock },

];


export default function ServicesStage() {
  const [i, setI] = useState(0);
  const [nudge, setNudge] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SERVICES.length), 4200);
    return () => clearInterval(t);
  }, [nudge]);

  const active = SERVICES[i];
  const Mock = active.Mock;

  return (
    <div className="fs-up" style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 6, width: "100%" }}>
      <style>{CSS}</style>

      <div
        className="fs-glass"
        style={{ borderRadius: 30, padding: 20, minHeight: 316, display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}
      >
        <div key={`h-${active.id}`} className="sv-in" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {active.headline}
            </h3>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{active.desc}</p>
          </div>
        </div>

        <div key={`m-${active.id}`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Mock />
        </div>
      </div>

      <div className="sv-pager">
        <button
          type="button"
          className="sv-arrow"
          aria-label="Previous service"
          onClick={() => {
            setNudge((n) => n + 1);
            setI((x) => (x - 1 + SERVICES.length) % SERVICES.length);
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>

        <div className="sv-current" key={`n-${active.id}`}>
          <div className="sv-in sv-name">{active.label}</div>
          <div className="sv-in sv-note" style={{ animationDelay: ".06s" }}>
            {active.note}
          </div>
        </div>

        <button
          type="button"
          className="sv-arrow"
          aria-label="Next service"
          onClick={() => {
            setNudge((n) => n + 1);
            setI((x) => (x + 1) % SERVICES.length);
          }}
        >
          <ChevronRight size={18} strokeWidth={1.8} />
        </button>
      </div>



    </div>
  );
}
