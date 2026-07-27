/**
 * Localised copy for the versus / model landing family.
 *
 * Full 50-locale prose is generated at request time by the existing
 * i18n-translate pipeline; this module only carries the small set of strings
 * that must be correct on the server-rendered first paint (headline template,
 * CTA, section labels) for the highest-traffic locales, and falls back to
 * English elsewhere.
 */
import type { MatrixModel } from "@/data/modelMatrix2026";

export interface VersusCopy {
  eyebrow: string;
  compare: (a: string, b: string) => string;
  subtitle: (a: string, b: string) => string;
  cta: string;
  secondary: string;
  placeholder: string;
  bullets: string[];
  sideBySide: string;
  strengths: string;
  tradeoffs: string;
  verdict: string;
  verdictBody: (a: string, b: string) => string;
  alsoCompare: string;
}

const EN: VersusCopy = {
  eyebrow: "Model comparison · 2026",
  compare: (a, b) => `${a} vs ${b}`,
  subtitle: (a, b) =>
    `An honest, side-by-side look at ${a} and ${b} — strengths, trade-offs, context windows and what each one is actually best at. Both run inside Megsy AI on one subscription.`,
  cta: "Try both free",
  secondary: "See all models",
  placeholder: "Ask both models the same question…",
  bullets: ["No credit card", "Switch models mid-chat", "One subscription"],
  sideBySide: "Side by side",
  strengths: "Strengths",
  tradeoffs: "Trade-offs",
  verdict: "The verdict",
  verdictBody: (a, b) =>
    `There is no single winner. ${a} and ${b} are tuned for different shapes of work, and the right answer usually depends on the task in front of you. That is exactly why Megsy AI gives you both — start a chat with one, switch to the other mid-conversation, and keep the context.`,
  alsoCompare: "People also compare",
};

const AR: VersusCopy = {
  eyebrow: "مقارنة نماذج · 2026",
  compare: (a, b) => `${a} ضد ${b}`,
  subtitle: (a, b) =>
    `مقارنة صريحة بين ${a} و${b} — نقاط القوة، والعيوب، وحجم السياق، وأفضل استخدام لكل واحد. الاتنين متاحين جوه Megsy AI باشتراك واحد، وتقدر تدفع بفودافون كاش أو إنستاباي.`,
  cta: "جرّب الاتنين مجاناً",
  secondary: "كل النماذج",
  placeholder: "اسأل النموذجين نفس السؤال…",
  bullets: ["من غير بطاقة ائتمان", "بدّل النموذج وسط المحادثة", "اشتراك واحد"],
  sideBySide: "جنباً إلى جنب",
  strengths: "نقاط القوة",
  tradeoffs: "العيوب",
  verdict: "الخلاصة",
  verdictBody: (a, b) =>
    `مفيش فايز واحد. ${a} و${b} متظبطين لأنواع شغل مختلفة، والاختيار الصح بيعتمد على المهمة اللي قدامك. عشان كده Megsy AI بيديك الاتنين — ابدأ بواحد، وبدّل للتاني وسط المحادثة من غير ما تفقد السياق.`,
  alsoCompare: "مقارنات ذات صلة",
};

const BY_LANG: Record<string, VersusCopy> = { en: EN, ar: AR };

export function getVersusCopy(lang: string | undefined): VersusCopy {
  return BY_LANG[lang ?? "en"] ?? EN;
}

/** Meta title/description for a versus page, localised where we have copy. */
export function versusMeta(a: MatrixModel, b: MatrixModel, lang: string | undefined) {
  if (lang === "ar") {
    return {
      title: `${a.name} ضد ${b.name}: أيهما أفضل في 2026؟ | Megsy AI`,
      description: `مقارنة كاملة بين ${a.name} و${b.name} في 2026 — السرعة، حجم السياق، البرمجة، الكتابة والسعر. جرّب الاتنين في Megsy AI باشتراك واحد وادفع بفودافون كاش.`,
    };
  }
  return {
    title: `${a.name} vs ${b.name}: Which Is Better in 2026? | Megsy AI`,
    description: `A full ${a.name} vs ${b.name} comparison for 2026 — speed, context window, coding, writing and price. Try both inside Megsy AI on a single subscription.`,
  };
}
