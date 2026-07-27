/**
 * LocalPaymentsSection — Arabic-only payment reassurance block.
 *
 * Rendered on Arabic landing pages so that high-intent queries like
 * "الدفع بفودافون كاش" / "اشتراك بدون فيزا" have real on-page content to match.
 * Returns `null` for every other locale by design.
 */
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import {
  LOCAL_PAYMENT_COUNTRIES,
  LOCAL_PAYMENTS_HEADING,
  LOCAL_PAYMENTS_SUBHEAD,
} from "@/data/localPayments";

interface Props {
  /** Locale of the surrounding page. Anything other than "ar" renders nothing. */
  lang?: string;
}

const LocalPaymentsSection = ({ lang }: Props) => {
  if (lang !== "ar") return null;

  return (
    <section
      dir="rtl"
      aria-labelledby="local-payments-heading"
      className="border-t border-border/50 bg-background px-6 py-16"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="local-payments-heading"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          {LOCAL_PAYMENTS_HEADING}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {LOCAL_PAYMENTS_SUBHEAD}
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOCAL_PAYMENT_COUNTRIES.map((country) => (
            <li
              key={country.code}
              className="rounded-2xl border border-border/50 bg-card/60 p-5"
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span aria-hidden>{country.flag}</span>
                {country.name}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {country.methods.map((m) => (
                  <li
                    key={m.latin}
                    className="rounded-full border border-border/50 bg-muted/40 px-3 py-1 text-[13px] text-muted-foreground"
                  >
                    {m.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-muted-foreground">
          التفعيل فوري بعد الدفع، وتقدر تلغي الاشتراك في أي وقت.{" "}
          <Link to="/pricing" className="text-foreground underline underline-offset-4">
            شوف الأسعار
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LocalPaymentsSection;
