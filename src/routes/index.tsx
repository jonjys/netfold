import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { DeadlineClock } from "@/components/deadline-clock";
import { Button } from "@/components/ui/button";
import { catalogById, catalogImage } from "@/lib/catalog";
import { priceItem } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import { dayAnchor, DEMO_PROOF_TOKEN, sellBy } from "@/lib/listings";
import { useI18n } from "@/lib/i18n";
import { formatSkuPrice } from "@/lib/skus";

const HOME_ITEMS = [
  "iphone-14-pro-max",
  "iphone-16-128",
  "sony-xm5",
  "ps5-slim",
  "iphone-13-pro-max",
  "iphone-15-pro-max",
] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Såld innan helgen — 72-timmarsannons | Netfold" },
      {
        name: "description",
        content:
          "Färdig Blocket-annons med fast pris, köparbevis och 72 timmar. Sen Swappie. 29 kr.",
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
  const items = HOME_ITEMS.map((id) => catalogById(id)).filter(
    (row): row is NonNullable<typeof row> => Boolean(row),
  );

  return (
    <Shell>
      <section className="pt-2 sm:pt-6">
        {priced ? (
          <article className="overflow-hidden rounded-3xl bg-fg text-accent-fg shadow-[var(--shadow-lift)] sm:grid sm:grid-cols-2">
            <div className="relative">
              <img
                src="/phones/iphone-14-pro-max.jpg"
                alt={priced.name}
                width={900}
                height={1200}
                className="aspect-[4/5] w-full object-cover sm:aspect-auto sm:h-full"
              />
              <div className="absolute left-4 top-4 rounded-full bg-fg/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-fg backdrop-blur">
                {t("homeKicker")}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6 p-5 sm:p-8">
              <DeadlineClock at={sellBy(sampleNow)} size="hero" />
              <div>
                <h1 className="font-display text-[2.1rem] leading-[1.05] tracking-tight sm:text-5xl">
                  {t("homeTitle")}
                </h1>
                <p className="mt-3 text-sm text-accent-fg/70">{t("homeLead")}</p>
                <p className="mt-6 font-display text-lg leading-snug">{priced.name}</p>
                <p className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
                  {formatMoney(priced.acceptCents, lang)}
                </p>
                <p className="mt-2 font-mono text-sm tabular-nums text-ok">
                  +{formatMoney(priced.trappedVsInstantCents, lang)} {t("vsHeadline")}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent-fg/55">
                  {t("homeAsk")}
                </p>
                <Button asChild size="lg" className="mt-6 w-full bg-accent-fg text-fg hover:opacity-90">
                  <a href="#go">
                    {t("sampleCta")} · {formatSkuPrice("report", lang)}
                  </a>
                </Button>
                <Link
                  to="/b/$token"
                  params={{ token: DEMO_PROOF_TOKEN }}
                  className="mt-3 flex h-10 items-center justify-center text-sm text-accent-fg/70 hover:text-accent-fg"
                >
                  {t("sampleProof")}
                </Link>
              </div>
            </div>
          </article>
        ) : null}
      </section>

      <section id="go" className="mt-8 scroll-mt-24">
        <Extractor compact />
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["step1t", "step1d"],
            ["step2t", "step2d"],
            ["step3t", "step3d"],
          ] as const
        ).map(([title, desc], i) => (
          <div key={title} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">
              0{i + 1}
            </p>
            <h2 className="mt-2 font-display text-xl tracking-tight">{t(title)}</h2>
            <p className="mt-1 text-sm text-muted">{t(desc)}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">{t("priceIndex")}</h2>
          <Link to="/market" className="text-sm text-muted hover:text-fg">
            {t("allItems")}
          </Link>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const row = priceItem({ catalog: item, condition: "good" });
            const img = catalogImage(item.id);
            return (
              <li key={item.id}>
                <Link
                  to="/i/$slug"
                  params={{ slug: item.slug }}
                  className="flex min-h-20 overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="h-24 w-24 shrink-0 object-cover"
                    />
                  ) : (
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center bg-surface-2 font-display text-2xl text-muted">
                      {item.brand.slice(0, 1)}
                    </span>
                  )}
                  <span className="flex flex-1 items-center justify-between gap-3 px-4">
                    <span className="text-sm leading-snug">{item.name}</span>
                    <span className="font-mono text-sm tabular-nums text-ok">
                      +{formatMoney(row.trappedVsInstantCents, lang)}
                    </span>
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
