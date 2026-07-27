/**
 * Shared prop contract for the three cinematic landing-hero designs used by
 * the programmatic SEO landing pages.
 *
 *  - `wandor`   → frosted glass "prompt card" over a looping video (comparisons)
 *  - `organic`  → cinematic serif hero with staggered fade-in (model pages)
 *  - `transform`→ modern hero with a search-style input box (solutions / cities)
 */
export type LandingHeroVariant = "wandor" | "organic" | "transform";

export interface LandingHeroProps {
  /** Small label above the headline (category, locale badge, …). */
  eyebrow?: string;
  /** Main H1 text. */
  title: string;
  /** Optional emphasised tail of the headline, rendered in the accent style. */
  titleAccent?: string;
  /** Supporting paragraph under the headline. */
  subtitle?: string;
  /** Primary call-to-action label. */
  ctaLabel: string;
  /** Primary call-to-action destination (in-app route). */
  ctaHref: string;
  /** Optional secondary call-to-action. */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Placeholder text for the prompt/search input (wandor + transform). */
  inputPlaceholder?: string;
  /** Short proof points rendered under the CTA. */
  bullets?: string[];
  /** Text direction — RTL for Arabic/Hebrew/Persian landings. */
  dir?: "ltr" | "rtl";
}
