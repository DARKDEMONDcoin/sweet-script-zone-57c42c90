import WandorHero from "./WandorHero";
import OrganicHero from "./OrganicHero";
import TransformHero from "./TransformHero";
import type { LandingHeroProps, LandingHeroVariant } from "./types";

export { WandorHero, OrganicHero, TransformHero };
export type { LandingHeroProps, LandingHeroVariant };

/** Renders the hero design that matches the landing page family. */
export default function LandingHero({
  variant,
  ...props
}: LandingHeroProps & { variant: LandingHeroVariant }) {
  if (variant === "organic") return <OrganicHero {...props} />;
  if (variant === "transform") return <TransformHero {...props} />;
  return <WandorHero {...props} />;
}
