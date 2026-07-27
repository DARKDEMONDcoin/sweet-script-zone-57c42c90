import { memo, useEffect, useMemo, useState } from "react";
import MegsyStar from "@/components/files/MegsyStar";
import { t as uiT, useUserLang } from "@/lib/authI18n";

interface ThinkingLoaderProps {
  searchStatus?: string;
}

// Labor-Illusion rotating phrases inspired by ChatGPT o1 / Gemini Deep Research.
// Users perceive waits with visible progress narration as ~40% shorter and rate
// the answer as more trustworthy (Buell & Norton, 2011).
const LABOR_STEPS: Record<string, string[]> = {
  en: [
    "Framing the problem…",
    "Gathering context…",
    "Considering trade-offs…",
    "Cross-checking sources…",
    "Structuring the answer…",
    "Polishing the wording…",
  ],
  ar: [
    "بأصيغ المشكلة…",
    "بجمع السياق…",
    "بوازن بين الخيارات…",
    "بتحقق من المصادر…",
    "برتّب الإجابة…",
    "بحسّن الصياغة…",
  ],
  "ar-eg": [
    "بصيغ المشكلة…",
    "بلمّ السياق…",
    "بوازن بين الاختيارات…",
    "بتأكد من المصادر…",
    "برتّب الرد…",
    "بظبط الصياغة…",
  ],
  fr: [
    "Cadrage du problème…",
    "Collecte du contexte…",
    "Évaluation des options…",
    "Vérification des sources…",
    "Structuration de la réponse…",
    "Peaufinage du texte…",
  ],
  es: [
    "Planteando el problema…",
    "Reuniendo contexto…",
    "Sopesando opciones…",
    "Verificando fuentes…",
    "Estructurando la respuesta…",
    "Puliendo la redacción…",
  ],
  de: [
    "Problem wird erfasst…",
    "Kontext wird gesammelt…",
    "Optionen werden abgewogen…",
    "Quellen werden geprüft…",
    "Antwort wird strukturiert…",
    "Formulierung wird verfeinert…",
  ],
};

const getSteps = (lang: string): string[] => LABOR_STEPS[lang] ?? LABOR_STEPS.en;

// Thinking states:
//  • 0 – <5s   : "Thinking…"
//  • 5 – <15s  : "Thinking deeply…"
//  • >=15s     : rotating Labor-Illusion step phrases
const ThinkingLoader = ({ searchStatus }: ThinkingLoaderProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const lang = useUserLang();
  const steps = useMemo(() => getSteps(lang), [lang]);

  useEffect(() => {
    const start = Date.now();
    const t = window.setInterval(() => setElapsed(Date.now() - start), 500);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (searchStatus?.trim() || elapsed < 15000) return;
    const rot = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % steps.length);
    }, 2800);
    return () => window.clearInterval(rot);
  }, [elapsed, searchStatus, steps.length]);

  const starClass = "text-[var(--megsy-blue)]";
  const thinkingLabel = uiT("thinking", lang);
  const deepLabel = uiT("thinkingDeep", lang);
  const rtl = lang === "ar" || lang === "ar-eg" || lang === "fa" || lang === "he";

  const label = searchStatus?.trim()
    ? searchStatus
    : elapsed < 5000
      ? thinkingLabel
      : elapsed < 15000
        ? deepLabel
        : (steps[stepIdx] ?? steps[0]);

  // One single loading row for every state — same icon, size, rhythm and text style.
  return (
    <div
      className="flex items-center gap-2 py-1 min-h-6"
      aria-live="polite"
      dir={rtl ? "rtl" : undefined}
    >
      <MegsyStar size={16} className={`${starClass} animate-pulse motion-reduce:animate-none`} />
      <span
        key={label}
        className="ai-shimmer text-[13px] font-medium leading-none motion-reduce:animate-none"
      >
        {label}
      </span>
    </div>
  );
};

export default memo(ThinkingLoader);
