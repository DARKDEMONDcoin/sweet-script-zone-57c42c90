/** @doc Inline paywall line shown inside the chat thread (no big card) when a
 *  free user asks for a premium feature. Reads like a normal assistant reply,
 *  written in the user's own language / dialect. */
import { useNavigate } from "react-router-dom";
import { translateExactText, useUserLang, type AuthLang } from "@/lib/authI18n";

type Feature = "images" | "video" | "code" | "music";

const FEATURE_EN: Record<Feature, string> = {
  images: "image generation",
  video: "video generation",
  code: "building websites & code",
  music: "music generation",
};

/** Natural, hand-written lines for the languages we care most about. */
const LINES: Partial<Record<AuthLang, Record<Feature, string>>> = {
  "ar-eg": {
    images: "دي ميزة بريميوم يا صاحبي 🙏 عشان أعملك صور بالذكاء الاصطناعي لازم تكون مشترك. اشترك وابدأ على طول.",
    video: "عمل الفيديوهات متاح للمشتركين بس 🙏 اشترك في بريميوم وهعملك الفيديو في ثواني.",
    code: "بناء المواقع والأكواد ميزة بريميوم 🙏 اشترك وهبنيلك المشروع كامل جوه الشات.",
    music: "عمل الموسيقى للمشتركين بس 🙏 اشترك في بريميوم وهعملك التراك اللي انت عايزه.",
  },
  ar: {
    images: "توليد الصور ميزة مخصّصة للمشتركين. اشترك في بريميوم وسأبدأ فورًا.",
    video: "توليد الفيديو متاح للمشتركين فقط. اشترك في بريميوم لتفعيله.",
    code: "بناء المواقع والأكواد ميزة بريميوم. اشترك لأبني لك المشروع كاملًا داخل المحادثة.",
    music: "توليد الموسيقى متاح للمشتركين فقط. اشترك في بريميوم لتفعيله.",
  },
  en: {
    images: "Image generation is a Premium feature. Upgrade and I'll start right away.",
    video: "Video generation is for subscribers only. Upgrade to Premium and I'll render it in seconds.",
    code: "Building websites and code is Premium. Upgrade and I'll build the whole project here in chat.",
    music: "Music generation is for subscribers only. Upgrade to Premium to unlock it.",
  },
};

export default function UpgradeRequiredCard({ feature }: { feature: Feature }) {
  const navigate = useNavigate();
  const lang = useUserLang();

  const line =
    LINES[lang]?.[feature] ??
    translateExactText(LINES.en![feature], lang) ??
    LINES.en![feature];
  const cta = lang.startsWith("ar")
    ? "اشترك الآن"
    : translateExactText("Upgrade now", lang) || "Upgrade now";

  return (
    <p className="text-[15px] leading-relaxed text-foreground">
      {line}{" "}
      <button
        type="button"
        onClick={() => navigate("/pricing")}
        className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
      >
        {cta}
      </button>
    </p>
  );
}

export { FEATURE_EN };
