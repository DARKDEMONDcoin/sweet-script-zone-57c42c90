/**
 * VersusRouter — dispatches /vs/:slug to the right comparison page.
 * Legacy editorial comparisons (src/data/comparisons.ts) win; everything else
 * falls through to the programmatic model-vs-model landing.
 */
import { useParams } from "react-router-dom";
import { lazy, Suspense } from "react";
import { getComparison } from "@/data/comparisons";
import { Spinner } from "@/components/ui/spinner";

const ComparisonPage = lazy(() => import("@/pages/marketing/ComparisonPage"));
const ModelVersusPage = lazy(() => import("@/pages/seo/ModelVersusPage"));

export default function VersusRouter() {
  const { slug = "" } = useParams<{ slug: string }>();
  const isEditorial = Boolean(getComparison(slug));

  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-background">
          <Spinner />
        </div>
      }
    >
      {isEditorial ? <ComparisonPage /> : <ModelVersusPage />}
    </Suspense>
  );
}
