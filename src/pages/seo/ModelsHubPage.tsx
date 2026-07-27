/** @doc AI Models hub (/models) — lists every chat, image, and video model available on Megsy AI. */
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import OrganicHero from "@/components/landing/heroes/OrganicHero";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import { Spinner } from "@/components/ui/spinner";
import {
  Section,
  SectionTitle,
  Grid,
  CardLink,
  CardTitle,
  CardMeta,
  CardBody,
} from "@/components/landing/sections/SectionKit";

type ModelLite = {
  slug: string;
  name: string;
  provider: string;
  kind: "chat" | "image" | "video";
  badge?: string | null;
  description?: string | null;
  isNew?: boolean;
  isPremium?: boolean;
};

const KIND_LABEL: Record<string, string> = {
  chat: "Chat & code models",
  image: "Image models",
  video: "Video models",
};


export function chatIdToSlug(id: string): string {
  return (
    "chat-" +
    id
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

export default function ModelsHubPage() {
  const [models, setModels] = useState<ModelLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [chat, img, vid] = await Promise.all([
        supabase
          .from("model_pricing")
          .select("id,label,provider,kind,badge")
          .eq("enabled", true)
          .order("sort_order"),
        supabase
          .from("image_models")
          .select("slug,display_name,provider,description,is_new,is_premium,is_featured")
          .eq("is_active", true)
          .order("sort_order"),
        supabase
          .from("video_models")
          .select("slug,display_name,provider,description,is_new,is_premium,is_featured")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      if (cancelled) return;
      const all: ModelLite[] = [
        ...((chat.data as any[]) ?? [])
          .filter((m) => m.kind === "chat" || m.kind === "code")
          .map((m) => ({
            slug: chatIdToSlug(m.id),
            name: m.label,
            provider: m.provider,
            kind: "chat" as const,
            badge: m.badge,
          })),
        ...((img.data as any[]) ?? []).map((m) => ({
          slug: "image-" + m.slug,
          name: m.display_name,
          provider: m.provider,
          kind: "image" as const,
          description: m.description,
          isNew: m.is_new,
          isPremium: m.is_premium,
        })),
        ...((vid.data as any[]) ?? []).map((m) => ({
          slug: "video-" + m.slug,
          name: m.display_name,
          provider: m.provider,
          kind: "video" as const,
          description: m.description,
          isNew: m.is_new,
          isPremium: m.is_premium,
        })),
      ];
      setModels(all);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = (kind: "chat" | "image" | "video") => models.filter((m) => m.kind === kind);

  const title = "All AI Models — 130+ Image, Video, Chat & Code Models | Megsy AI";
  const description =
    "Every AI model in one place. Generate images with FLUX, GPT Image 2, Nano Banana, Seedream and Imagen. Produce videos with Veo 3, Kling, Sora, Runway and Luma. Chat & code with Claude, Gemini, GPT-5 and Qwen.";

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href="/models" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="/models" />
        <meta property="og:type" content="website" />
      </Helmet>

      <OrganicHero
        title="EVERY AI MODEL"
        titleAccent="IN ONE PLACE"
        subtitle="Image, video, chat and code — switch between providers in one click. No separate subscriptions, no API keys, no quota juggling."
        ctaLabel="Start free"
        ctaHref="/auth"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
        bullets={["130+ models", "One subscription", "No API keys"]}
      />

      {(["image", "video", "chat"] as const).map((kind) => {
        const list = grouped(kind);
        if (loading && list.length === 0) {
          return (
            <Section key={kind}>
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Spinner className="h-4 w-4" />
                Loading models
              </div>
            </Section>
          );
        }
        if (list.length === 0) return null;
        return (
          <Section key={kind} width="max-w-6xl" className="py-10">
            <SectionTitle count={list.length}>{KIND_LABEL[kind]}</SectionTitle>
            <Grid>
              {list.map((m) => (
                <CardLink key={m.slug} to={`/models/${m.slug}`} className="h-full">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors group-hover:text-foreground">
                      {hasBrandIcon(m.name, m.provider) ? (
                        <BrandIcon name={m.name} provider={m.provider} size={18} variant="mono" />
                      ) : (
                        <span className="text-xs font-medium">{m.name.slice(0, 1)}</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle>{m.name}</CardTitle>
                        {m.badge || m.isNew || m.isPremium ? (
                          <span className="shrink-0 rounded-full border border-border/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {m.badge || (m.isNew ? "New" : "Pro")}
                          </span>
                        ) : null}
                      </div>
                      <CardMeta>{m.provider}</CardMeta>
                      {m.description ? <CardBody>{m.description}</CardBody> : null}
                    </div>
                  </div>
                </CardLink>
              ))}
            </Grid>
          </Section>
        );
      })}
    </main>
  );
}

