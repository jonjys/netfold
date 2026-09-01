import { Link } from "@tanstack/react-router";
import { DeadlineClock } from "@/components/deadline-clock";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { formatSkuPrice } from "@/lib/skus";
import { DEMO_PROOF_TOKEN, type ExtractKit } from "@/lib/listings";
import type { PricedItem } from "@/lib/pricing";
import { useI18n } from "@/lib/i18n";

export function SampleListing({
  priced,
  kit,
  deadline,
  photoSrc,
}: {
  priced: PricedItem;
  kit: ExtractKit;
  deadline: Date;
  photoSrc: string;
}) {
  const { t, lang } = useI18n();
  const listing = kit.listings[0];
  if (!listing) return null;

  const swap = priced.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-lift)] lg:grid lg:grid-cols-2">
      <div className="relative bg-surface-2">
        <div className="relative aspect-[4/3] overflow-hidden lg:hidden">
          <img
            src={photoSrc}
            alt={priced.name}
            width={1024}
            height={768}
            className="absolute inset-0 size-full object-cover object-[center_42%]"
          />
        </div>
        <img
          src={photoSrc}
          alt=""
          width={1024}
          height={1365}
          className="hidden h-full min-h-[28rem] w-full object-cover lg:block"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent-fg">
            {t("sampleChannel")}
          </span>
          <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted backdrop-blur-sm">
            {t("sampleKicker")}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center p-4 sm:p-6">
        <h1 className="font-display text-[1.55rem] leading-[1.12] tracking-tight sm:text-4xl">
          {priced.name}
        </h1>
        <p className="mt-2 font-display text-4xl tracking-tight sm:text-6xl">
          {formatMoney(priced.acceptCents, lang)}
        </p>
        <p className="mt-1 text-sm text-muted">{t("sampleFirm")}</p>

        <p className="mt-3 font-mono text-sm tabular-nums text-ok">
          <DeadlineClock at={deadline} size="inline" /> · {t("sampleThen")} {formatMoney(swap, lang)}
        </p>
        <p className="mt-1 font-mono text-base tabular-nums text-ok">
          +{formatMoney(priced.trappedVsInstantCents, lang)} {t("vsHeadline")}
        </p>

        <Button asChild size="lg" className="mt-4 h-14 w-full text-base sm:mt-6">
          <a href="#go">
            {t("sampleCta")} · {formatSkuPrice("report", lang)}
          </a>
        </Button>
        <p className="mt-3 text-center text-sm text-muted">{t("sampleDone")}</p>
        <Link
          to="/b/$token"
          params={{ token: DEMO_PROOF_TOKEN }}
          className="mt-1 flex h-11 items-center justify-center text-sm text-muted hover:text-fg"
        >
          {t("sampleProof")}
        </Link>
      </div>
    </article>
  );
}
