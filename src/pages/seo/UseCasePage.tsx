/** @doc Use-case landing page (/solutions/<slug>) — programmatic SEO for "AI X" queries. */
import { useParams, Navigate } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { Helmet } from "react-helmet-async";
import { USE_CASES, getUseCase, USE_CASE_CATEGORIES } from "@/data/useCases";
import { ArrowRight } from "lucide-react";
import TransformHero from "@/components/landing/heroes/TransformHero";
import {
  Section,
  SectionTitle,
  BulletList,
  NumberedSteps,
  Faq,
  Chip,
  ChipRow,
} from "@/components/landing/sections/SectionKit";


export default function UseCasePage() {
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getUseCase(slug) : undefined;
  if (!data) return <Navigate to="/solutions" replace />;

  const title = `${data.title} — Megsy AI`;
  const description = data.description;
  const url = `/solutions/${data.slug}`;
  const category = USE_CASE_CATEGORIES[data.category];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: data.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: data.title,
            description: data.description,
            step: data.steps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.title,
              text: s.description,
            })),
          })}
        </script>
      </Helmet>

      <TransformHero
        eyebrow={category}
        title={data.title}
        subtitle={data.intent}
        ctaLabel="Try it free"
        ctaHref="/auth"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
        inputPlaceholder={data.description}
        bullets={data.benefits.slice(0, 3)}
      />

      <Section width="max-w-4xl">
        <SectionTitle>Why Megsy AI</SectionTitle>
        <BulletList items={data.benefits} />
      </Section>

      <Section width="max-w-4xl" className="pt-0">
        <SectionTitle>How it works</SectionTitle>
        <NumberedSteps items={data.steps} />
      </Section>

      <Section width="max-w-3xl" className="pt-0">
        <SectionTitle>FAQ</SectionTitle>
        <Faq items={data.faqs} />
      </Section>

      <Section width="max-w-3xl" bordered>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to try {data.title}?
        </h2>
        <p className="mt-3 text-muted-foreground">No credit card required.</p>
        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get started free
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>
      </Section>

      <Section bordered>
        <p className="mb-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          More AI tools
        </p>
        <ChipRow>
          {USE_CASES.filter((u) => u.slug !== data.slug)
            .slice(0, 24)
            .map((u) => (
              <Chip key={u.slug} to={`/solutions/${u.slug}`}>
                {u.title}
              </Chip>
            ))}
        </ChipRow>
      </Section>
    </main>
  );
}

