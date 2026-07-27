// Public list of language codes we publish in — mirrors
// supabase/functions/_shared/blog-langs.ts but lives in the client bundle.
// Single source of truth for hreflang, locale routing and language switchers.

export interface SiteLang {
  code: string; // BCP-47 (en, ar, zh, …)
  name: string; // English label
  nativeName: string; // Native label
  dir: "ltr" | "rtl";
}

export const SITE_LANGS: SiteLang[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr" },
  { code: "cs", name: "Czech", nativeName: "Čeština", dir: "ltr" },
  { code: "ro", name: "Romanian", nativeName: "Română", dir: "ltr" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "zh", name: "Chinese", nativeName: "中文", dir: "ltr" },
  // --- Second wave: 25 more locales (total 50) ---
  { code: "da", name: "Danish", nativeName: "Dansk", dir: "ltr" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", dir: "ltr" },
  { code: "nb", name: "Norwegian", nativeName: "Norsk bokmål", dir: "ltr" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", dir: "ltr" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", dir: "ltr" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", dir: "ltr" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", dir: "ltr" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", dir: "ltr" },
  { code: "sr", name: "Serbian", nativeName: "Српски", dir: "ltr" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", dir: "ltr" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", dir: "ltr" },
  { code: "et", name: "Estonian", nativeName: "Eesti", dir: "ltr" },
  { code: "ca", name: "Catalan", nativeName: "Català", dir: "ltr" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", dir: "ltr" },
  { code: "fil", name: "Filipino", nativeName: "Filipino", dir: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", dir: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", dir: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", dir: "ltr" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", dir: "ltr" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", dir: "ltr" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan", dir: "ltr" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша", dir: "ltr" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbekcha", dir: "ltr" },
];

export const SITE_LANG_CODES = SITE_LANGS.map((l) => l.code);
export const SITE_LANG_SET = new Set(SITE_LANG_CODES);
export const RTL_LANG_SET = new Set(SITE_LANGS.filter((l) => l.dir === "rtl").map((l) => l.code));

export function getSiteLang(code: string | undefined | null): SiteLang | undefined {
  if (!code) return undefined;
  return SITE_LANGS.find((l) => l.code === code);
}

/** Returns "" for English (canonical /docs), "/{lang}" otherwise. */
export function langPrefix(code: string | undefined | null): string {
  if (!code || code === "en") return "";
  return SITE_LANG_SET.has(code) ? `/${code}` : "";
}

/** Text direction for a locale code, defaulting to LTR. */
export function langDir(code: string | undefined | null): "ltr" | "rtl" {
  return code && RTL_LANG_SET.has(code) ? "rtl" : "ltr";
}
