/**
 * Lightweight heuristic detector for major Arabic dialects.
 * Not ML — just distinctive lexical markers. Good enough to hint the model.
 */
export type DialectTag = "msa" | "egy" | "gulf" | "levant" | "maghreb" | "unknown";

const MARKERS: Record<Exclude<DialectTag, "unknown" | "msa">, RegExp[]> = {
  egy: [
    /\b(ازاي|إزاي|ازيك|إزيك|عايز|عاوز|عايزة|فين|امتى|إمتى|كده|كدا|بتاع|بتاعة|اهو|أهو|ماشي|يلا|يالا|خالص|جدع|علطول|بجد|بردو|برضه|علشان|عشان)\b/i,
    /\b(دلوقتي|دلوقت|هنا|طب|طيب|معلش|مافيش|مفيش|مش|فيه|صحيح)\b/i,
  ],
  gulf: [
    /\b(شلون|شلونك|وش|وشو|وشلون|شنو|هسة|هسه|زين|كذا|جذي|هالحين|الحين|يبغى|يبى|أبغى|ابغي|أبي|ودي|ودك|شفيك|شفيه)\b/i,
    /\b(كفو|هلا|مرحبا|والله|ولا يهمك|عاد|بعد|بس)\b/i,
  ],
  levant: [
    /\b(كيفك|شو|شو الأخبار|هلق|هلأ|منيح|كتير|بدي|بدك|بدو|بدها|هيك|هون|لهون|شوي|هلق)\b/i,
    /\b(يلي|اللي|عم|رح|لسا|لسه|طيب|يعني)\b/i,
  ],
  maghreb: [
    /\b(واش|بزاف|بزّاف|دابا|شحال|شكون|كيفاش|واخا|صافي|زوين|زوينة|حنا|هاد|هادي|هادو|غادي|بغيت|بغيتي|بغى|مزيان|مزيانة|فاش|علاش)\b/i,
    /\b(بلاتي|ياك|دير|درت|كنبغيك|نتا|نتي|نتوما)\b/i,
  ],
};

export function detectArabicDialect(text: string): DialectTag {
  if (!text) return "unknown";
  const t = String(text).toLowerCase();
  // Must contain some Arabic first.
  if (!/[\u0600-\u06FF]/.test(t)) return "unknown";
  const scores: Record<string, number> = { egy: 0, gulf: 0, levant: 0, maghreb: 0 };
  for (const [tag, patterns] of Object.entries(MARKERS)) {
    for (const rx of patterns) {
      const matches = t.match(new RegExp(rx.source, "gi"));
      if (matches) scores[tag] += matches.length;
    }
  }
  const [best, bestScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (bestScore === 0) return "msa";
  // Require a small margin to avoid noise.
  const second = Object.entries(scores).filter(([k]) => k !== best).sort((a, b) => b[1] - a[1])[0][1];
  if (bestScore - second < 1 && bestScore < 2) return "msa";
  return best as DialectTag;
}

export function dialectLabel(tag: DialectTag): string {
  switch (tag) {
    case "egy": return "مصرية";
    case "gulf": return "خليجية";
    case "levant": return "شامية";
    case "maghreb": return "مغاربية";
    case "msa": return "فصحى";
    default: return "";
  }
}
