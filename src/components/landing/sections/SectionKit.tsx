/**
 * SectionKit — the shared building blocks for every landing / programmatic-SEO
 * page body. One border weight, one radius, one type scale, no gradients, no
 * emoji, no decorative icons. Model brand marks are the only imagery allowed.
 */
import type { ReactNode } from "react";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { ChevronDown } from "lucide-react";

export function Section({
  children,
  className = "",
  bordered = false,
  width = "max-w-5xl",
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  width?: string;
}) {
  return (
    <section
      className={`px-6 py-16 ${bordered ? "border-t border-border/50" : ""} ${className}`}
    >
      <div className={`mx-auto ${width}`}>{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  count,
  eyebrow,
}: {
  children: ReactNode;
  count?: number;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h2 className="flex items-baseline gap-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {children}
        {typeof count === "number" ? (
          <span className="text-sm font-normal text-muted-foreground">{count}</span>
        ) : null}
      </h2>
    </div>
  );
}

const CARD_BASE =
  "block rounded-2xl border border-border/50 bg-card/60 p-5 transition-colors hover:border-border hover:bg-card";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${CARD_BASE} ${className}`}>{children}</div>;
}

export function CardLink({
  to,
  children,
  className = "",
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={to} className={`group ${CARD_BASE} ${className}`}>
      {children}
    </Link>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base font-medium leading-tight text-foreground transition-colors group-hover:text-foreground">
      {children}
    </h3>
  );
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-muted-foreground">{children}</p>;
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

export function Grid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={`grid items-stretch gap-3 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}
    >
      {children}
    </div>
  );
}

export function Chip({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details
          key={f.q}
          className="group rounded-2xl border border-border/50 bg-card/60 p-5 transition-colors hover:border-border"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
            {f.q}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              strokeWidth={1.8}
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function NumberedSteps({
  items,
}: {
  items: Array<{ title: string; description: string }>;
}) {
  return (
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li
          key={s.title}
          className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/60 p-5"
        >
          <span className="mt-0.5 w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-base font-medium text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((b) => (
        <li
          key={b}
          className="rounded-2xl border border-border/50 bg-card/60 p-5 text-sm leading-relaxed text-muted-foreground"
        >
          {b}
        </li>
      ))}
    </ul>
  );
}
