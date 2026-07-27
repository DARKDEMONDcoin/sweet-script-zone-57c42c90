/**
 * ChurchShowcase — post-signup mobile showcase ("Christ Family Church").
 * Three 375x812 iPhone artboards inside black rounded frames, stacked
 * vertically and scaled to fit the phone screen. Text uses a typewriter
 * effect; frames fade in. Mobile only (rendered by WelcomeShowcasePage).
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";

const IMG = {
  portrait: "https://framerusercontent.com/images/7nIpqB1Y0QYgLe70j5NmdtK5Rk.png",
  logo: "https://framerusercontent.com/images/Fr3jIzrNgNkSo8ZgFFTkpS308.png",
  quote: "https://framerusercontent.com/images/DmIPflrtvNHr7mnr6k3K5Ayn8w.png",
  star: "https://framerusercontent.com/images/yi0dRg7NDCZUtTbPxCa115nMU5M.png",
  hero: "https://framerusercontent.com/images/G9ZdWZubRnpc37d5d7uUzqaBqiw.png",
  avatars: "https://framerusercontent.com/images/l3LBaTwnoXLWZd6axR7m3Q9iWeU.png",
  arrow: "https://framerusercontent.com/images/zBmfi9e2hdwkTHpcMqbS61FIc3c.png",
  preacher: "https://framerusercontent.com/images/Q7jLZsObox26xQCiWPAVYWzTsYs.png",
  play: "https://framerusercontent.com/images/3M0CPgfOsuyRxuRs37KkTOTrUM.png",
};

const DARK = "rgb(29, 25, 26)";
const CREAM = "#F1E5C6";
const MANROPE = 'Manrope, -apple-system, "SF Pro Text", system-ui, sans-serif';

const W = 375;
const H = 812;

/* ---------------------------------- text --------------------------------- */

function Type({
  text,
  delay = 0,
  speed = 22,
  style,
  as: As = "span",
}: {
  text: string;
  delay?: number;
  speed?: number;
  style?: React.CSSProperties;
  as?: any;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let id: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      id = setInterval(() => {
        setN((c) => {
          if (c >= text.length) {
            clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id!);
    };
  }, [text, delay, speed]);
  return (
    <As style={{ fontFamily: MANROPE, ...style }}>
      {text.slice(0, n)}
      <span style={{ opacity: 0 }}>{text.slice(n)}</span>
    </As>
  );
}

/* --------------------------------- chrome -------------------------------- */

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        paddingTop: 48,
        paddingLeft: 19,
        paddingRight: 19,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src={IMG.logo} alt="" width={46} height={46} style={{ objectFit: "contain" }} />
        <Type
          text="Christ Family Church"
          delay={120}
          style={{ fontSize: 17, fontWeight: 400, color: "#fff", lineHeight: "20px" }}
        />
      </div>
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          padding: 6,
          background: "transparent",
          border: 0,
        }}
      >
        <span style={{ width: 24, height: 1.5, background: "#fff", display: "block" }} />
        <span style={{ width: 24, height: 1.5, background: "#fff", display: "block" }} />
        <span style={{ width: 14, height: 1.5, background: "#fff", display: "block" }} />
      </button>
    </div>
  );
}

function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = ["Home", "About", "Events", "Sermons", "Contact"];
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", inset: 0, zIndex: 100, background: DARK }}
        >
          <div
            style={{
              paddingTop: 48,
              paddingLeft: 19,
              paddingRight: 19,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={IMG.logo} alt="" width={46} height={46} style={{ objectFit: "contain" }} />
              <span style={{ fontFamily: MANROPE, fontSize: 17, color: "#fff", lineHeight: "20px" }}>
                Christ Family Church
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              style={{ width: 28, height: 28, position: "relative", background: "transparent", border: 0 }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 2,
                  top: 13,
                  width: 24,
                  height: 1.5,
                  background: "#fff",
                  transform: "rotate(45deg)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 2,
                  top: 13,
                  width: 24,
                  height: 1.5,
                  background: "#fff",
                  transform: "rotate(-45deg)",
                }}
              />
            </button>
          </div>

          <div style={{ marginTop: 60, paddingLeft: 19, display: "flex", flexDirection: "column", gap: 22 }}>
            {links.map((l, i) => (
              <Type
                key={l}
                as="div"
                text={l}
                delay={80 * i}
                style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.8px", color: "#fff" }}
              />
            ))}
          </div>

          <CreamButton label="Join us" style={{ position: "absolute", left: 19, right: 19, bottom: 36 }} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function CreamButton({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height: 52,
        borderRadius: 26,
        background: CREAM,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        ...style,
      }}
    >
      <span style={{ fontFamily: MANROPE, fontSize: 21, fontWeight: 500, color: "#1a1a1a" }}>{label}</span>
      <img src={IMG.arrow} alt="" width={16} height={16} style={{ objectFit: "contain" }} />
    </div>
  );
}

/* --------------------------------- screens -------------------------------- */

function Screen1() {
  const [menu, setMenu] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, background: DARK, overflow: "hidden" }}>
      <Header onMenu={() => setMenu(true)} />

      <div
        style={{
          position: "absolute",
          left: -44,
          top: 115,
          transform: "translateX(-60px) rotate(-90deg)",
          transformOrigin: "center",
          display: "flex",
          gap: 10,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: MANROPE,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "1.2px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Anna Miller
        </span>
        <span
          style={{
            fontFamily: MANROPE,
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: "1.2px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Community Member
        </span>
      </div>

      <img
        src={IMG.portrait}
        alt="Anna Miller"
        style={{ position: "absolute", top: 120, left: 125, width: 240, height: 300, objectFit: "cover" }}
      />

      <img src={IMG.quote} alt="" style={{ position: "absolute", left: 19, top: 395, width: 28, height: 24 }} />

      <Type
        as="p"
        text="We want to be a family where people can connect and benefit from friendships in Christ."
        delay={400}
        speed={18}
        style={{
          position: "absolute",
          left: 19,
          top: 440,
          width: 336,
          margin: 0,
          fontSize: 20,
          lineHeight: "27px",
          color: "rgba(255,255,255,0.77)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 245,
          background: "#fff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "28px 19px",
        }}
      >
        <Type
          as="div"
          text="Sunday Worship Service"
          delay={300}
          style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.5px", color: "#1a1a1a", lineHeight: "40px" }}
        />
        <div style={{ marginTop: 12, fontFamily: MANROPE, fontSize: 17, color: "#888888" }}>Dec 7th, 10-11:30am</div>
        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: MANROPE, fontSize: 17, color: "#1a1a1a" }}>Learn more</span>
          <img src={IMG.arrow} alt="" width={16} height={16} style={{ objectFit: "contain", filter: "invert(1)" }} />
        </div>
        <img
          src={IMG.star}
          alt=""
          style={{ position: "absolute", right: 19, bottom: 40, width: 48, height: 48, objectFit: "contain" }}
        />
      </div>

      <MenuOverlay open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}

function Screen2() {
  const [menu, setMenu] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, background: DARK, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 472 }}>
        <img src={IMG.hero} alt="Worship" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
      </div>

      <Header onMenu={() => setMenu(true)} />

      <img
        src={IMG.avatars}
        alt=""
        style={{ position: "absolute", left: 19, top: 442, width: 149, height: 53, objectFit: "contain" }}
      />

      <Type
        as="h2"
        text="Take a step toward the light"
        delay={250}
        speed={26}
        style={{
          position: "absolute",
          left: 19,
          right: 19,
          top: 520,
          margin: 0,
          fontSize: 52,
          fontWeight: 300,
          lineHeight: "52px",
          letterSpacing: "-2.5px",
          color: CREAM,
        }}
      />

      <Type
        as="p"
        text="Discover faith, hope, and a home for your soul"
        delay={900}
        style={{
          position: "absolute",
          left: 19,
          right: 19,
          top: 690,
          margin: 0,
          fontSize: 21,
          lineHeight: "27px",
          color: "rgba(255,255,255,0.6)",
        }}
      />

      <CreamButton label="Join us" style={{ position: "absolute", left: 19, right: 19, bottom: 32 }} />

      <MenuOverlay open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}

const EVENTS = [
  { day: "14", month: "Dec", title: "Luke 1 | A Story From Zechariah", time: "6:30 - 8:00 pm", cream: false, faded: false },
  { day: "21", month: "Dec", title: "Romans 15 | Living For Christ Alone", time: "8:30 - 10:00 am", cream: true, faded: false },
  { day: "28", month: "Dec", title: "Romans 9 | The Sovereignty Of God", time: "5:30 - 7:00 pm", cream: true, faded: false },
  { day: "4", month: "Jan", title: "John 3 | Born Again", time: "", cream: true, faded: true },
];

function Screen3() {
  const [menu, setMenu] = useState(false);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F5F0E8", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: -20, width: 415, height: 345 }}>
        <img src={IMG.preacher} alt="Sermon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      </div>

      <Header onMenu={() => setMenu(true)} />

      <div
        style={{
          position: "absolute",
          top: 175,
          left: "50%",
          transform: "translateX(-50%)",
          width: 65,
          height: 65,
          borderRadius: 33,
          background: CREAM,
          display: "grid",
          placeItems: "center",
        }}
      >
        <img src={IMG.play} alt="" width={22} height={22} style={{ objectFit: "contain" }} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 343,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 220, background: DARK, padding: "28px 19px" }}>
          <Type
            as="div"
            text="Upcoming"
            delay={200}
            style={{ fontSize: 38, letterSpacing: "-0.8px", color: "#fff" }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 120,
            left: 19,
            right: 19,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {EVENTS.map((e) => (
            <div
              key={e.title}
              style={{ display: "flex", alignItems: "center", gap: 16, opacity: e.faded ? 0.5 : 1 }}
            >
              <div
                style={{
                  width: 68,
                  height: 90,
                  borderRadius: 14,
                  background: e.cream ? CREAM : "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <span style={{ fontFamily: MANROPE, fontSize: 34, fontWeight: 500, color: "#1a1a1a" }}>{e.day}</span>
                <span style={{ fontFamily: MANROPE, fontSize: 18, color: "#1a1a1a" }}>{e.month}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: MANROPE, fontSize: 21, lineHeight: "26px", color: "#1a1a1a" }}>
                  {e.title}
                </div>
                {e.time ? (
                  <div style={{ marginTop: 6, fontFamily: MANROPE, fontSize: 17, color: "#999999" }}>{e.time}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MenuOverlay open={menu} onClose={() => setMenu(false)} />
    </div>
  );
}

/* ---------------------------------- frame --------------------------------- */

function PhoneFrame({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      style={{
        width: W,
        height: H,
        borderRadius: 50,
        border: "2px solid #2a2a2a",
        background: "#000",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
        flexShrink: 0,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 126,
          height: 36,
          borderRadius: 18,
          background: "#000",
          zIndex: 50,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: 134,
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.3)",
          zIndex: 50,
        }}
      />
    </motion.div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function ChurchShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const fit = () => {
      const avail = (wrapRef.current?.clientWidth ?? window.innerWidth) - 40;
      setScale(Math.min(1, avail / W));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const screens = [<Screen1 key="1" />, <Screen2 key="2" />, <Screen3 key="3" />];

  return (
    <div ref={wrapRef} style={{ background: "#5A4C41", minHeight: "100dvh", padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 * scale }}>
        {screens.map((s, i) => (
          <div key={i} style={{ width: W * scale, height: H * scale }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PhoneFrame index={i}>{s}</PhoneFrame>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
