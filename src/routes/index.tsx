import { createFileRoute } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { SampleListing } from "@/components/sample-listing";
import { Shell } from "@/components/shell";
import { catalogById } from "@/lib/catalog";
import { priceItem } from "@/lib/pricing";
import { buildExtractKit, dayAnchor, DEMO_PROOF_TOKEN, proofHref, sellBy } from "@/lib/listings";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Din Blocket-annons — 72 timmar | Netfold" },
      {
        name: "description",
        content:
          "Klistra in på Blocket. Fast pris, ej bud, köparbevis. 72 timmar. Annars Swappie. 29 kr.",
      },
    ],
    links: [{ rel: "preload", as: "image", href: "/phones/iphone-14-pro-max.jpg" }],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const sampleNow = dayAnchor();
  const catalog = catalogById("iphone-14-pro-max");
  const priced = catalog ? priceItem({ catalog, condition: "good" }) : null;
  const kit = priced
    ? buildExtractKit(priced, lang, {
        proofUrl: proofHref(DEMO_PROOF_TOKEN),
        now: sampleNow,
      })
    : null;

  return (
    <Shell>
      <section className="pt-2 sm:pt-4">
        {priced && kit ? (
          <SampleListing
            priced={priced}
            kit={kit}
            deadline={sellBy(sampleNow)}
            photoSrc="/phones/iphone-14-pro-max.jpg"
          />
        ) : null}
      </section>

      <section id="go" className="mt-8 scroll-mt-24">
        <h2 className="font-display text-2xl tracking-tight">{t("goTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("step1d")}</p>
        <div className="mt-4">
          <Extractor compact />
        </div>
      </section>
    </Shell>
  );
}
