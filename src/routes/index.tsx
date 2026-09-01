import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { DeadlineClock } from "@/components/deadline-clock";
import { Button } from "@/components/ui/button";
import { catalogById } from "@/lib/catalog";
import { priceItem } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { dayAnchor, DEMO_PROOF_TOKEN, sellBy } from "@/lib/listings";
import { useI18n } from "@/lib/i18n";
import { formatSkuPrice } from "@/lib/skus";

const HOME_PHONES = [
  "iphone-14-pro-max",
  "iphone-13-pro-max",
  "iphone-15-pro-max",
  "iphone-16-128",
  "iphone-15-128",
  "iphone-13-128",
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Såld innan helgen — 72-timmarsannons | Netfold" },
      {
        name: "description",
        content: "Färdig Blocket-annons. Fast pris, köparbevis, 72 timmar. Sen Swappie. 29 kr.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const sampleNow = dayAnchor();
  const catalog = catalogById("iphone-14-pro-max");
  const priced = catalog ? priceItem({ catalog, condition: "good" }) : null;
  const phones = HOME_PHONES.map((id) => catalogById(id)).filter(
    (row): row is NonNullable<typeof row> => Boolean(row),
  );

  return (
    <Shell>
      <section className="pt-4 sm:pt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">{t("homeKicker")}</p>
        <div className="mt-3">
          <DeadlineClock at={sellBy(sampleNow)} size="hero" />
        </div>

        {priced ? (
          <article className="mt-6 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-lift)] sm:grid sm:grid-cols-2">
            <img
              src="/phones/iphone-14-pro-max.jpg"
              alt={priced.name}
              width={900}
              height={1200}
              className="aspect-[3/4] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10 sm:h-full"
            />
            <div className="flex flex-col justify-end p-4 sm:p-6">
              <h1 className="font-display text-3xl leading-[1.05] tracking-tight">
                {priced.name}
              </h1>
              <p className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
                {formatMoney(priced.acceptCents, lang)}
              </p>
              <p className="mt-2 font-mono text-sm tabular-nums text-ok">
                +{formatMoney(priced.trappedVsInstantCents, lang)} {t("vsHeadline")}
              </p>
              <p className="mt-2 text-sm text-muted">
                {lang === "sv" ? "ej bud · hämtas i veckan" : "firm · pickup this week"}
              </p>
              <Button asChild size="lg" className="mt-5 w-full">
                <a href="#go">
                  {t("sampleCta")} · {formatSkuPrice("report", lang)}
                </a>
              </Button>
              <Link
                to="/b/$token"
                params={{ token: DEMO_PROOF_TOKEN }}
                className="mt-3 flex h-11 items-center justify-center text-sm text-muted hover:text-fg"
              >
                {t("sampleProof")}
              </Link>
            </div>
          </article>
        ) : null}
      </section>

      <section id="go" className="mt-8 scroll-mt-24">
        <Extractor compact />
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">{t("priceIndex")}</h2>
          <Link to="/market" className="text-sm text-muted hover:text-fg">
            {t("allItems")}
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
          {phones.map((item) => {
            const row = priceItem({ catalog: item, condition: "good" });
            return (
              <li key={item.id}>
                <Link
                  to="/i/$slug"
                  params={{ slug: item.slug }}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="text-sm">{item.name}</span>
                  <span className="font-mono text-sm tabular-nums text-ok">
                    +{formatMoney(row.trappedVsInstantCents, lang)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Shell>
  );
}
