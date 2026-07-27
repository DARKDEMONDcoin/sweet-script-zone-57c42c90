/** @doc Hub for all AI use-case landing pages (/solutions). */
import { Helmet } from "react-helmet-async";
import { USE_CASES, USE_CASE_CATEGORIES } from "@/data/useCases";
import TransformHero from "@/components/landing/heroes/TransformHero";
import {
  Section,
  SectionTitle,
  Grid,
  CardLink,
  CardTitle,
  CardBody,
} from "@/components/landing/sections/SectionKit";


export default function SolutionsHubPage() {
  const grouped = Object.entries(USE_CASE_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    items: USE_CASES.filter((u) => u.category === key),
  }));

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>AI Tools & Solutions — Megsy AI</title>
        <meta
          name="description"
          content="Every AI tool from Megsy AI: website builders, image generators, video, code, marketing, and more."
        />
        <link rel="canonical" href="/solutions" />
        <meta property="og:title" content="AI Tools & Solutions — Megsy AI" />
        <meta property="og:url" content="/solutions" />
        <meta property="og:type" content="website" />
      </Helmet>

      <TransformHero
        eyebrow="AI Tools"
        title="All AI tools by Megsy"
        subtitle={`${USE_CASES.length}+ AI tools in one platform. Pick a use case and start free.`}
        ctaLabel="Start free"
        ctaHref="/auth"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
        inputPlaceholder="Describe what you want to build…"
        bullets={["No credit card", "50+ languages", "Local payments in MENA"]}
      />

      {grouped.map((g) => (
        <Section key={g.key} width="max-w-6xl" className="py-10">
          <SectionTitle count={g.items.length}>{g.label}</SectionTitle>
          <Grid>
            {g.items.map((u) => (
              <CardLink key={u.slug} to={`/solutions/${u.slug}`}>
                <CardTitle>{u.title}</CardTitle>
                <CardBody>{u.intent}</CardBody>
              </CardLink>
            ))}
          </Grid>
        </Section>
      ))}
    </main>
  );
}

