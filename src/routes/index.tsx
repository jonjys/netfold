import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { VsCard } from "@/components/vs-card";
import { DeadlineClock } from "@/components/deadline-clock";
import { catalogById } from "@/lib/catalog";
import { priceItem } from "@/lib/pricing";
import { formatMoney } from "@/lib/money";
import {
  buildExtractKit,
  dayAnchor,
  DEMO_PROOF_TOKEN,
  proofHref,
  sellBy,
} from "@/lib/listings";
import { BRAND } from "@/lib/brand";
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
        content:
          "Inte PriceRunner. En färdig Blocket-annons med fast pris, köparbevis och ett klockslag då du tar Swappie. 29 kr.",
      },
      {
        name: "keywords",
        content:
          "sälja iphone blocket, 72 timmar blocket, köparbevis, swappie vs blocket, iPhone 14 Pro Max blocket",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const heroCatalog = catalogById("iphone-14-pro-max");
  const hero = heroCatalog ? priceItem({ catalog: heroCatalog, condition: "good" }) : null;
  const heroBlocket = hero?.quotes.find((q) => q.channelId === "local")?.takeHomeCents ?? 0;
  const heroSwappie = hero?.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0;
  const sampleCatalog = catalogById("iphone-14-pro-max");
  const sampleNow = dayAnchor();
  const sample = sampleCatalog
    ? buildExtractKit(priceItem({ catalog: sampleCatalog, condition: "good" }), lang, {
        proofUrl: proofHref(DEMO_PROOF_TOKEN, `https://${BRAND.domain}`),
        now: sampleNow,
      })
    : null;
  const sampleListing = sample?.listings[0];
  const phones = HOME_PHONES.map((id) => catalogById(id)).filter(
    (row): row is NonNullable<typeof row> => Boolean(row),
  );

  return (
    <Shell>
      <section className="pb-2 pt-4 sm:pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("homeKicker")}</p>
        <h1 className="mt-3 max-w-2xl font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-6xl">
          {t("homeTitle")}
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted">{t("homeLead")}</p>
      </section>

      {sampleListing ? (
        <section className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("sampleKicker")}</p>
          <h2 className="mt-2 font-display text-2xl tracking-tight">{t("sampleLead")}</h2>
          <article className="mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-subtle">{t("adKicker")}</p>
              <DeadlineClock at={sellBy(sampleNow)} />
            </div>
            <p className="mt-3 font-display text-xl tracking-tight">{sampleListing.title}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{sampleListing.body}</p>
            <p className="mt-4 text-xs text-subtle">{sample?.lowballReply}</p>
            <Link
              to="/b/$token"
              params={{ token: DEMO_PROOF_TOKEN }}
              className="mt-4 inline-flex h-11 items-center text-sm text-muted hover:text-fg"
            >
              {t("sampleProof")}
            </Link>
          </article>
          <p className="mt-3 text-sm text-muted">
            {t("sampleCta")} · {formatSkuPrice("report", lang)}
          </p>
        </section>
      ) : null}

      <Extractor />

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { n: "01", t: t("step1t"), d: t("step1d") },
          { n: "02", t: t("step2t"), d: t("step2d") },
          { n: "03", t: t("step3t"), d: t("step3d") },
        ].map((s) => (
          <article key={s.n} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs text-subtle">{s.n}</p>
            <h2 className="mt-2 font-display text-xl tracking-tight">{s.t}</h2>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </article>
        ))}
      </section>

      {hero ? (
        <section className="mt-12">
          <VsCard blocketCents={heroBlocket} swappieCents={heroSwappie} />
          <p className="mt-3 text-xs text-subtle">
            <Link to="/swappie-vs-blocket" className="hover:text-fg">
              iPhone 13 / 14 / 15 Pro Max — Swappie mot Blocket
            </Link>
          </p>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">{t("priceIndex")}</h2>
          <Link to="/market" className="text-sm text-muted hover:text-fg">
            {t("allItems")}
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
          {phones.map((item) => {
            const priced = priceItem({ catalog: item, condition: "good" });
            const blocket =
              priced.quotes.find((q) => q.channelId === "local")?.takeHomeCents ??
              priced.bestTakeHomeCents;
            const swappie =
              priced.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0;
            return (
              <li key={item.id}>
                <Link
                  to="/i/$slug"
                  params={{ slug: item.slug }}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <span>
                    <span className="block text-sm">{item.name}</span>
                    <span className="text-xs text-subtle">
                      {t("vsSwappie")} {formatMoney(swappie, lang)} · {t("vsBlocket")}{" "}
                      {formatMoney(blocket, lang)}
                    </span>
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ok">
                    +{formatMoney(priced.trappedVsInstantCents, lang)}
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
