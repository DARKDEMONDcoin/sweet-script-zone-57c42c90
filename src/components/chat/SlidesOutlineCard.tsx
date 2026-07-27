import { FileText } from "lucide-react";
import type { SlidesOutline, SlidesOutlineStep } from "@/lib/slidesOutlineParser";
import ToolCard from "./primitives/ToolCard";

interface SlidesOutlineCardProps {
  outline: SlidesOutline;
  onStart?: () => void;
  status?: "planning" | "generating" | "done";
}

export default function SlidesOutlineCard({
  outline,
  status = "planning",
  onStart,
}: SlidesOutlineCardProps) {
  const steps = outline.steps || [];

  return (
    <ToolCard
      icon={<FileText className="h-4 w-4" />}
      title="Slide outline"
      subtitle={`${steps.length} slide${steps.length === 1 ? "" : "s"}`}
      trailing={
        status === "generating" ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Generating…
          </span>
        ) : status === "done" ? (
          <span className="text-[11px] text-emerald-500">Done</span>
        ) : null
      }
    >
      {outline.intro && (
        <p className="mb-3 text-sm leading-relaxed text-foreground/90">{outline.intro}</p>
      )}
      <ol className="space-y-2">
        {steps.map((slide: SlidesOutlineStep, index: number) => (
          <li
            key={index}
            className="rounded-ios-md border border-border/40 bg-background/40 p-3 text-sm"
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                {slide.title}
              </span>
            </div>
            {slide.items && slide.items.length > 0 && (
              <ul className="space-y-1 ps-8">
                {slide.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-[12px] leading-snug text-foreground/70">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      {onStart && status === "planning" && steps.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-90 transition"
          >
            Generate slides
          </button>
        </div>
      )}
    </ToolCard>
  );
}
