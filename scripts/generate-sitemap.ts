#!/usr/bin/env bun
/**
 * Generates a split sitemap: `public/sitemap.xml` is a <sitemapindex> that
 * points at chunked child sitemaps in `public/sitemaps/`.
 *
 * Run: bun scripts/generate-sitemap.ts
 * Data is imported straight from the app so the sitemap can never drift from
 * the routes in src/App.tsx.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { SITE_LANGS } from "../src/lib/siteLangs";
import { USE_CASES } from "../src/data/useCases";
import { COMPETITORS, INDUSTRIES, TEMPLATE_CATEGORIES } from "../src/data/programmaticSeo";
import { CITIES } from "../src/data/cities";
import { BLOG_POSTS } from "../src/data/blogPosts";
import { COMPARISONS } from "../src/data/comparisons";
import { MATRIX_MODELS, VERSUS_SLUGS } from "../src/data/modelMatrix2026";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://megsyai.com";
const OUT_DIR = resolve(root, "public/sitemaps");

/** Hard caps — publishing rejects builds over 50k files / 3 GiB unpacked. */
const MAX_URLS_PER_FILE = 5_000;
const MAX_CHILD_SITEMAPS = 60;

const LOCALES = SITE_LANGS.map((l) => l.code).filter((c) => c !== "en");

type Entry = { path: string; priority: string; changefreq: string; alternates?: boolean };

const url = (p: string) => `${BASE_URL}${p === "/" ? "/" : p}`;

const STATIC_ROUTES: Array<[string, string, string]> = [
  ["/", "1.0", "daily"],
  ["/pricing", "0.9", "weekly"],
  ["/features", "0.8", "weekly"],
  ["/features-guide", "0.7", "monthly"],
  ["/enterprise", "0.7", "monthly"],
  ["/models", "0.9", "weekly"],
  ["/megsy-model", "0.7", "monthly"],
  ["/ai-chat", "0.8", "weekly"],
  ["/solutions", "0.9", "weekly"],
  ["/tools", "0.6", "weekly"],
  ["/compare", "0.7", "weekly"],
  ["/for", "0.7", "weekly"],
  ["/templates", "0.7", "weekly"],
  ["/apps", "0.6", "weekly"],
  ["/blog", "0.8", "daily"],
  ["/docs", "0.8", "weekly"],
  ["/about", "0.6", "monthly"],
  ["/changelog", "0.5", "weekly"],
  ["/contact", "0.5", "monthly"],
  ["/referrals", "0.5", "monthly"],
  ["/security", "0.5", "monthly"],
  ["/compliance", "0.4", "yearly"],
  ["/privacy", "0.4", "yearly"],
  ["/refund", "0.4", "yearly"],
  ["/cookies", "0.3", "yearly"],
  ["/acceptable-use", "0.3", "yearly"],
  ["/policies/content", "0.3", "yearly"],
  ["/legal/dmca", "0.3", "yearly"],
  ["/legal/dpa", "0.3", "yearly"],
  ["/legal/affiliate", "0.3", "yearly"],
  ["/legal/ai-disclaimer", "0.3", "yearly"],
  ["/legal/accessibility", "0.3", "yearly"],
  ["/legal/age", "0.3", "yearly"],
  ["/legal/moderation", "0.3", "yearly"],
  ["/legal/subprocessors", "0.3", "yearly"],
];

/** Sections, each written to its own chunked child sitemap file. */
const sections: Array<{ name: string; entries: Entry[] }> = [];
const addSection = (name: string, entries: Entry[]) => {
  if (entries.length > 0) sections.push({ name, entries });
};

// 1. Core marketing + legal pages (with hreflang alternates).
addSection(
  "static",
  STATIC_ROUTES.map(([path, priority, changefreq]) => ({
    path,
    priority,
    changefreq,
    alternates: true,
  })),
);

// 2. Localised home landings (/es, /ar, …).
addSection(
  "locales",
  LOCALES.map((lang) => ({ path: `/${lang}`, priority: "0.7", changefreq: "weekly" })),
);

// 3. Blog.
addSection(
  "blog",
  BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    priority: "0.7",
    changefreq: "monthly",
    alternates: true,
  })),
);

// 4. Model-vs-model comparisons: English + every locale prefix.
const versusEntries: Entry[] = [];
for (const slug of VERSUS_SLUGS) {
  versusEntries.push({ path: `/vs/${slug}`, priority: "0.8", changefreq: "weekly" });
  for (const lang of LOCALES) {
    versusEntries.push({ path: `/${lang}/vs/${slug}`, priority: "0.6", changefreq: "weekly" });
  }
}
for (const c of COMPARISONS) {
  versusEntries.push({ path: `/vs/${c.slug}`, priority: "0.7", changefreq: "monthly" });
}
addSection("versus", versusEntries);

// 5. Model pages, plus per-industry and per-city variants.
const modelEntries: Entry[] = [];
for (const m of MATRIX_MODELS) {
  modelEntries.push({ path: `/models/${m.slug}`, priority: "0.8", changefreq: "weekly" });
  for (const ind of INDUSTRIES) {
    modelEntries.push({
      path: `/models/${m.slug}/for/${ind.slug}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
  for (const city of CITIES) {
    modelEntries.push({
      path: `/models/${m.slug}/in/${city.slug}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
}
addSection("models", modelEntries);

// 6. Use-case (solutions) pages, plus per-industry and per-city variants.
const solutionEntries: Entry[] = [];
for (const u of USE_CASES) {
  solutionEntries.push({ path: `/solutions/${u.slug}`, priority: "0.8", changefreq: "weekly" });
  for (const ind of INDUSTRIES) {
    solutionEntries.push({
      path: `/solutions/${u.slug}/for/${ind.slug}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
  for (const city of CITIES) {
    solutionEntries.push({
      path: `/solutions/${u.slug}/in/${city.slug}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
}
addSection("solutions", solutionEntries);

// 7. Competitor comparisons and industry / template hubs.
const compareEntries: Entry[] = [];
for (const c of COMPETITORS) {
  compareEntries.push({
    path: `/compare/megsy-vs-${c.slug}`,
    priority: "0.7",
    changefreq: "monthly",
  });
  for (const ind of INDUSTRIES) {
    compareEntries.push({
      path: `/compare/megsy-vs-${c.slug}/for/${ind.slug}`,
      priority: "0.4",
      changefreq: "monthly",
    });
  }
}
addSection("compare", compareEntries);

const industryEntries: Entry[] = [];
for (const ind of INDUSTRIES) {
  industryEntries.push({ path: `/for/${ind.slug}`, priority: "0.7", changefreq: "monthly" });
  for (const city of CITIES) {
    industryEntries.push({
      path: `/for/${ind.slug}/in/${city.slug}`,
      priority: "0.5",
      changefreq: "monthly",
    });
  }
}
addSection("industries", industryEntries);

const templateEntries: Entry[] = [];
for (const t of TEMPLATE_CATEGORIES) {
  templateEntries.push({ path: `/templates/${t.slug}`, priority: "0.6", changefreq: "monthly" });
  for (const ind of INDUSTRIES) {
    templateEntries.push({
      path: `/templates/${t.slug}/for/${ind.slug}`,
      priority: "0.4",
      changefreq: "monthly",
    });
  }
}
addSection("templates", templateEntries);

// ---- Serialisation -------------------------------------------------------

const seen = new Set<string>();

const xmlForEntry = (e: Entry) => {
  const loc = url(e.path);
  const lines = [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
  ];
  if (e.alternates) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${loc}"/>`,
    );
    for (const lang of LOCALES) {
      const localised = e.path === "/" ? url(`/${lang}`) : url(`/${lang}${e.path}`);
      lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${localised}"/>`);
    }
  }
  lines.push("  </url>");
  return lines.join("\n");
};

const wrapUrlset = (entries: Entry[]) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map(xmlForEntry),
    "</urlset>",
    "",
  ].join("\n");

mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith(".xml")) rmSync(resolve(OUT_DIR, f));
}

const childFiles: string[] = [];
let totalUrls = 0;

outer: for (const section of sections) {
  const unique = section.entries.filter((e) => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });

  for (let i = 0; i < unique.length; i += MAX_URLS_PER_FILE) {
    if (childFiles.length >= MAX_CHILD_SITEMAPS) {
      console.warn(`sitemap: hit MAX_CHILD_SITEMAPS (${MAX_CHILD_SITEMAPS}) — truncating.`);
      break outer;
    }
    const chunk = unique.slice(i, i + MAX_URLS_PER_FILE);
    const index = Math.floor(i / MAX_URLS_PER_FILE) + 1;
    const name =
      unique.length > MAX_URLS_PER_FILE
        ? `sitemap-${section.name}-${index}.xml`
        : `sitemap-${section.name}.xml`;
    writeFileSync(resolve(OUT_DIR, name), wrapUrlset(chunk));
    childFiles.push(name);
    totalUrls += chunk.length;
  }
}

const indexXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...childFiles.map((f) => `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${f}</loc>\n  </sitemap>`),
  "</sitemapindex>",
  "",
].join("\n");

writeFileSync(resolve(root, "public/sitemap.xml"), indexXml);
console.log(`sitemap index written — ${childFiles.length} child sitemaps, ${totalUrls} URLs`);
