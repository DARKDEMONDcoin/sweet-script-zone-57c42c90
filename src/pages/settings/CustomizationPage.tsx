/** @doc Appearance — Pure black, Gold accent, icon-only back button. */
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSendMode, setSendMode, type SendMode } from "@/lib/composerKey";

const ACCENTS = [
  { hsl: "45 90% 55%", hex: "#c9a84c", name: "Gold" },
  { hsl: "262 60% 55%", hex: "#7c5cfc", name: "Violet" },
  { hsl: "210 80% 55%", hex: "#3b82f6", name: "Blue" },
  { hsl: "142 50% 50%", hex: "#22c55e", name: "Green" },
  { hsl: "330 70% 55%", hex: "#ec4899", name: "Pink" },
  { hsl: "25 90% 55%", hex: "#f97316", name: "Orange" },
  { hsl: "160 60% 45%", hex: "#14b8a6", name: "Teal" },
  { hsl: "0 70% 55%", hex: "#ef4444", name: "Red" },
  { hsl: "180 60% 45%", hex: "#06b6d4", name: "Cyan" },
  { hsl: "270 60% 55%", hex: "#8b5cf6", name: "Purple" },
  { hsl: "85 60% 45%", hex: "#84cc16", name: "Lime" },
  { hsl: "12 85% 58%", hex: "#f56042", name: "Coral" },
];

const GOLD_HSL = "45 90% 55%";
const GOLD_HEX = "#c9a84c";

const CustomizationPage = () => {
  const navigate = useNavigate();
  const [accent, setAccent] = useState(() => localStorage.getItem("accent") || GOLD_HSL);
  const [mode, setMode] = useState<SendMode>(() => getSendMode());

  useEffect(() => {
    document.body.classList.add("ms-theme");
    document.documentElement.style.setProperty("--primary", GOLD_HSL);
    document.documentElement.style.setProperty("--user-bubble", GOLD_HEX);
    return () => {
      document.body.classList.remove("ms-theme");
    };
  }, []);

  const changeAccent = useCallback((hsl: string) => {
    document.documentElement.style.setProperty("--primary", hsl);
    document.documentElement.style.setProperty("--user-bubble", `hsl(${hsl})`);
    localStorage.setItem("accent", hsl);
    localStorage.setItem("userBubbleColor", `hsl(${hsl})`);
    setAccent(hsl);
  }, []);

  const changeMode = useCallback((m: SendMode) => {
    setSendMode(m);
    setMode(m);
  }, []);

  const active = ACCENTS.find((c) => c.hsl === accent) ?? ACCENTS[0];

  return (
    <div className="apv2-root">
      <style>{apv2Css}</style>

      <header className="apv2-topbar">
        <button className="apv2-back" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="apv2-title">Appearance</h1>
        <div className="apv2-spacer" />
      </header>

      <main className="apv2-main">
        {/* Hero preview */}
        <section className="apv2-hero" style={{ ["--ac" as any]: active.hex }}>
          <div className="apv2-hero-name">{active.name}</div>
          <div className="apv2-preview">
            <div className="apv2-bubble apv2-in">How does this look?</div>
            <div className="apv2-bubble apv2-out">Beautiful.</div>
          </div>
        </section>

        {/* Accent grid */}
        <section className="apv2-section">
          <div className="apv2-section-head">
            <div>
              <div className="apv2-section-title">Accent color</div>
              <div className="apv2-section-sub">Applied to buttons and your bubbles.</div>
            </div>
          </div>
          <div className="apv2-card">
            <div className="apv2-grid">
              {ACCENTS.map((c) => {
                const on = c.hsl === accent;
                return (
                  <button
                    key={c.hex}
                    onClick={() => changeAccent(c.hsl)}
                    aria-label={c.name}
                    className={`apv2-swatch ${on ? "is-on" : ""}`}
                    style={{ background: c.hex }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Composer */}
        <section className="apv2-section">
          <div className="apv2-section-head">
            <div>
              <div className="apv2-section-title">Composer</div>
              <div className="apv2-section-sub">How pressing Enter behaves.</div>
            </div>
          </div>
          <div className="apv2-card">
            <button
              className={`apv2-row ${mode === "enter" ? "is-on" : ""}`}
              onClick={() => changeMode("enter")}
            >
              <div className="apv2-row-body">
                <div className="apv2-row-title">Enter to send</div>
                <div className="apv2-row-sub">Shift + Enter for a new line</div>
              </div>
              <div className="apv2-radio">{mode === "enter" && <span />}</div>
            </button>
            <div className="apv2-divider" />
            <button
              className={`apv2-row ${mode === "shift_enter" ? "is-on" : ""}`}
              onClick={() => changeMode("shift_enter")}
            >
              <div className="apv2-row-body">
                <div className="apv2-row-title">Shift + Enter to send</div>
                <div className="apv2-row-sub">Enter inserts a new line</div>
              </div>
              <div className="apv2-radio">{mode === "shift_enter" && <span />}</div>
            </button>
          </div>
        </section>

        <div className="apv2-foot-space" />
      </main>
    </div>
  );
};

const apv2Css = `
.apv2-root {
  min-height: 100vh;
  background: #000;
  color: #f5f5f7;
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  padding-bottom: env(safe-area-inset-bottom);
}
.apv2-topbar {
  position: sticky; top: 0; z-index: 10;
  display: grid; grid-template-columns: 40px 1fr 40px; align-items: center;
  padding: 12px 12px; background: rgba(0,0,0,0.85);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.apv2-back {
  width: 36px; height: 36px; border-radius: 999px; border: 0;
  background: rgba(255,255,255,0.06); color: #f5f5f7;
  display: grid; place-items: center; cursor: pointer;
  transition: background-color 160ms ease;
}
.apv2-back:active { background: rgba(255,255,255,0.12); }
.apv2-title {
  margin: 0; text-align: center;
  font-family: "Space Grotesk", sans-serif;
  font-size: 17px; font-weight: 600; letter-spacing: -0.01em;
}
.apv2-spacer { width: 40px; }
.apv2-main { padding: 16px 16px 32px; display: flex; flex-direction: column; gap: 22px; }

.apv2-hero {
  position: relative; padding: 22px 20px 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
  border: 1px solid rgba(255,255,255,0.08);
  overflow: hidden;
}
.apv2-hero::before {
  content: ""; position: absolute; inset: -40% -20% auto auto;
  width: 220px; height: 220px; border-radius: 999px;
  background: radial-gradient(circle, color-mix(in oklab, var(--ac) 55%, transparent), transparent 70%);
  filter: blur(20px); opacity: 0.7; pointer-events: none;
}
.apv2-hero-name {
  margin-top: 4px;
  font-family: "Space Grotesk", sans-serif;
  font-size: 28px; font-weight: 600; letter-spacing: -0.02em;
  color: var(--ac);
}
.apv2-preview {
  margin-top: 16px;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; z-index: 1;
}
.apv2-bubble { max-width: 78%; padding: 10px 14px; border-radius: 18px; font-size: 14px; }
.apv2-in {
  align-self: flex-start; background: rgba(255,255,255,0.08);
  color: #f5f5f7; border-bottom-left-radius: 6px;
}
.apv2-out {
  align-self: flex-end; background: var(--ac); color: #0a0a0a;
  font-weight: 500; border-bottom-right-radius: 6px;
  transition: background-color 250ms ease;
}

.apv2-section { display: flex; flex-direction: column; gap: 10px; }
.apv2-section-head { padding: 0 4px; }
.apv2-section-title {
  font-family: "Space Grotesk", sans-serif;
  font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
}
.apv2-section-sub {
  font-size: 12.5px; color: rgba(245,245,247,0.5); margin-top: 1px;
}

.apv2-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px; overflow: hidden;
}
.apv2-grid {
  padding: 18px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px;
}
.apv2-swatch {
  width: 100%; aspect-ratio: 1; border-radius: 999px; border: 0;
  cursor: pointer;
  transition: transform 180ms cubic-bezier(0.34,1.35,0.64,1), box-shadow 200ms ease;
}
.apv2-swatch:active { transform: scale(0.88); }
.apv2-swatch.is-on { box-shadow: 0 0 0 2px #000, 0 0 0 4px #f5f5f7; }

.apv2-row {
  width: 100%; display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; background: transparent; border: 0; color: inherit;
  text-align: left; cursor: pointer; font: inherit;
  transition: background-color 160ms ease;
}
.apv2-row:active { background: rgba(255,255,255,0.04); }
.apv2-row-body { flex: 1; min-width: 0; }
.apv2-row-title {
  font-family: "Space Grotesk", sans-serif;
  font-size: 14.5px; font-weight: 500; letter-spacing: -0.005em;
}
.apv2-row-sub { font-size: 12px; color: rgba(245,245,247,0.5); margin-top: 2px; }
.apv2-radio {
  width: 22px; height: 22px; border-radius: 999px;
  border: 1.5px solid rgba(255,255,255,0.25);
  display: grid; place-items: center; flex-shrink: 0;
  transition: border-color 160ms ease;
}
.apv2-row.is-on .apv2-radio { border-color: #f5f5f7; }
.apv2-radio span {
  width: 12px; height: 12px; border-radius: 999px; background: #f5f5f7;
}
.apv2-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 0 16px; }
.apv2-foot-space { height: 24px; }
`;

export default CustomizationPage;
