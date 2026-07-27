/**
 * SeoMeta — the single head-tag helper for every programmatic SEO page.
 *
 * Emits an absolute canonical, the full 50-locale hreflang cluster plus
 * `x-default`, Open Graph / Twitter cards and optional JSON-LD. English is the
 * un-prefixed canonical (`/solutions/x`); every other locale lives under
 * `/{lang}/solutions/x`.
 */
import { Helmet } from "react-helmet-async";
import { SITE_LANGS, langDir, langPrefix } from "@/lib/siteLangs";

export const SITE_URL = "https://megsyai.com";

export interface SeoMetaProps {
  title: string;
  description: string;
  /** Locale-independent path, always starting with "/" (e.g. "/solutions/ai-logo"). */
  path: string;
  /** Current locale — omit or "en" for the canonical English page. */
  lang?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  keywords?: string[];
  /** Extra structured data objects appended as <script type="application/ld+json">. */
  jsonLd?: Array<Record<string, unknown>>;
  /** Shortcut for a FAQPage graph. */
  faqs?: Array<{ q: string; a: string }>;
  /** Breadcrumb trail; paths are locale-independent like `path`. */
  breadcrumbs?: Array<{ name: string; path: string }>;
}

const abs = (lang: string | undefined, path: string) =>
  `${SITE_URL}${langPrefix(lang)}${path === "/" ? "" : path}` || `${SITE_URL}/`;

const SeoMeta = ({
  title,
  description,
  path,
  lang = "en",
  image,
  type = "website",
  noindex = false,
  keywords,
  jsonLd = [],
  faqs,
  breadcrumbs,
}: SeoMetaProps) => {
  const canonical = abs(lang, path);
  const graphs: Array<Record<string, unknown>> = [...jsonLd];

  if (faqs && faqs.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: abs(lang, b.path),
      })),
    });
  }

  return (
    <Helmet>
      <html lang={lang} dir={langDir(lang)} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 ? (
        <meta name="keywords" content={keywords.join(", ")} />
      ) : null}
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}

      {SITE_LANGS.map((l) => (
        <link key={l.code} rel="alternate" hrefLang={l.code} href={abs(l.code, path)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={abs("en", path)} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Megsy AI" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image ? <meta property="og:image" content={image} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@MegsyAI" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      {graphs.map((g, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(g)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoMeta;
