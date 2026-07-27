/**
 * ModelVersusPage — programmatic "X vs Y" comparison landing (/vs/:pair and
 * /{lang}/vs/:pair). Uses the Wandor hero design per the landing-design split:
 * comparisons → Wandor, models → Organic, solutions/cities → Transform.
 */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import SeoMeta from "@/components/common/SeoMeta";
import WandorHero from "@/components/landing/heroes/WandorHero";
import LocalPaymentsSection from "@/components/landing/LocalPaymentsSection";
import { getVersusPair, VERSUS_PAIRS, type MatrixModel } from "@/data/modelMatrix2026";
import { getVersusCopy, versusMeta } from "@/data/versusCopy";
import { SITE_LANG_SET, langDir, langPrefix } from "@/lib/siteLangs";

function ModelColumn({ model, strengthsLabel, tradeoffsLabel }: {
  model: MatrixModel;
  strengthsLabel: string;
  tradeoffsLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{model.vendor}</p>
      <h3 className="mt-1 text-xl font-bold text-foreground">{model.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{model.summary}</p>

      <dl className="mt-5 space-y-2">
        {model.specs.map((s) => (
          <div key={s.label} className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{s.label}</dt>
            <dd className="text-foreground">{s.value}</dd>
          </div>
        ))}
      </dl>

      <h4 className="mt-6 text-sm font-semibold text-foreground">{strengthsLabel}</h4>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {model.strengths.map((s) => (
          <li key={s}>· {s}</li>
        ))}
      </ul>

      <h4 className="mt-5 text-sm font-semibold text-foreground">{tradeoffsLabel}</h4>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {model.tradeoffs.map((s) => (
          <li key={s}>· {s}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ModelVersusPage() {
  const { pair, slug, lang: rawLang } = useParams<{ pair?: string; slug?: string; lang?: string }>();
  const lang = rawLang && SITE_LANG_SET.has(rawLang) ? rawLang : "en";
  const data = getVersusPair(pair ?? slug);
  const prefix = langPrefix(lang);

  if (!data) return <Navigate to={`${prefix}/models`} replace />;

  const { a, b } = data;
  const copy = getVersusCopy(lang);
  const meta = versusMeta(a, b, lang);
  const path = `/vs/${data.slug}`;
  const dir = langDir(lang);

  const related = VERSUS_PAIRS.filter(
    (p) => p.slug !== data.slug && (p.a.slug === a.slug || p.b.slug === a.slug || p.a.slug === b.slug || p.b.slug === b.slug),
  ).slice(0, 8);

  const faqs = [
    {
      q: lang === "ar" ? `إيه الفرق بين ${a.name} و${b.name}؟` : `What is the difference between ${a.name} and ${b.name}?`,
      a: lang === "ar"
        ? `${a.name} ${a.tagline} أما ${b.name} ${b.tagline}`
        : `${a.name} — ${a.tagline} ${b.name} — ${b.tagline}`,
    },
    {
      q: lang === "ar" ? `أقدر أستخدم ${a.name} و${b.name} في مكان واحد؟` : `Can I use both ${a.name} and ${b.name} in one place?`,
      a: lang === "ar"
        ? `أيوه. Megsy AI بيديك النموذجين وأكتر من ٥٠ نموذج تاني باشتراك واحد، وتقدر تدفع بفودافون كاش أو إنستاباي أو مدى.`
        : `Yes. Megsy AI gives you both models — and dozens more — on a single subscription, and you can switch between them mid-conversation.`,
    },
  ];

  return (
    <main className="min-h-dvh bg-background text-foreground" dir={dir}>
      <SeoMeta
        title={meta.title}
        description={meta.description}
        path={path}
        lang={lang}
        type="article"
        faqs={faqs}
        breadcrumbs={[
          { name: "Megsy AI", path: "/" },
          { name: "Models", path: "/models" },
          { name: `${a.name} vs ${b.name}`, path },
        ]}
      />

      <WandorHero
        dir={dir}
        eyebrow={copy.eyebrow}
        title={copy.compare(a.name, b.name)}
        subtitle={copy.subtitle(a.name, b.name)}
        ctaLabel={copy.cta}
        ctaHref={`${prefix}/chat`}
        secondaryLabel={copy.secondary}
        secondaryHref={`${prefix}/models`}
        inputPlaceholder={copy.placeholder}
        bullets={copy.bullets}
      />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">{copy.sideBySide}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <ModelColumn model={a} strengthsLabel={copy.strengths} tradeoffsLabel={copy.tradeoffs} />
          <ModelColumn model={b} strengthsLabel={copy.strengths} tradeoffsLabel={copy.tradeoffs} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{copy.verdict}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">{copy.verdictBody(a.name, b.name)}</p>
      </section>

      <LocalPaymentsSection lang={lang} />

      {related.length > 0 ? (
        <section className="border-t border-border/50 px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-5 text-lg font-semibold">{copy.alsoCompare}</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`${prefix}/vs/${p.slug}`}
                    className="inline-flex rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {p.a.name} vs {p.b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
