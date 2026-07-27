/** @doc Public changelog — renders src/data/changelog.ts as a simple marketing page. */
import { lazy, Suspense } from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import SEOHead from "@/components/common/SEOHead";
import { CHANGELOG } from "@/data/changelog";
const LandingFooter = lazy(() => import("@/components/landing/LandingFooter"));

const TAG_STYLES: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  improved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  fixed: "bg-muted/60 text-foreground border-border",
  security: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const ChangelogPage = () => {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://megsyai.com/" },
      { "@type": "ListItem", position: 2, name: "Changelog", item: "https://megsyai.com/changelog" },
    ],
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <SEOHead
        title="Changelog"
        description="What's new in Megsy AI — new features, improvements, fixes and security updates, in one place."
        path="/changelog"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <LandingNavbar />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:pt-32">
        <header className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Changelog
          </h1>
          <p className="mt-3 text-muted-foreground">
            Every notable update to Megsy AI, newest first.
          </p>
        </header>

        <ol className="relative space-y-10 border-s border-border ps-6">
          {CHANGELOG.map((entry) => (
            <li key={`${entry.date}-${entry.title}`} className="relative">
              <span className="absolute -start-[29px] top-1.5 h-3 w-3 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={entry.date} className="text-sm text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {entry.tag && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
                      TAG_STYLES[entry.tag] ?? "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {entry.tag}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{entry.title}</h2>
              <ul className="mt-3 list-disc space-y-1.5 ps-5 text-[15px] leading-relaxed text-muted-foreground">
                {entry.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>

      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>
    </div>
  );
};

export default ChangelogPage;
