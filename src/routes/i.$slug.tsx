import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { formatEuro, formatEuroRange } from "@/lib/money";
import { getPublicItem } from "@/lib/server/public";
import { useI18n } from "@/lib/i18n";
import { channelCopyKey } from "@/lib/channels";

export const Route = createFileRoute("/i/$slug")({
  loader: async ({ params }) => getPublicItem({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    if (!loaderData || !loaderData.ok) {
      return { meta: [{ title: "Netfold" }] };
    }
    const name = loaderData.catalog.name;
    const title = `${name} — what you actually keep | Netfold`;
    const description = `Take-home after fees for a used ${name}. Local, Marketplace, Vinted, eBay and instant — not the asking price.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ItemPage,
});

function ItemPage() {
  const data = Route.useLoaderData();
  const { t } = useI18n();
  if (!data.ok) {
    return (
      <Shell>
        <h1 className="font-display text-3xl">{t("itemMissing")}</h1>
        <p className="mt-2 text-sm text-muted">{t("itemMissingLead")}</p>
      </Shell>
    );
  }
  const { catalog, teaser, likeNewBest, fairBest } = data;
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{catalog.category}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{catalog.name}</h1>
      <p className="mt-4 text-sm text-muted">{t("itemLead")}</p>
      <p className="mt-6 font-display text-5xl tracking-tight">
        {formatEuroRange(teaser.rangeLowCents, teaser.rangeHighCents)}
      </p>
      <p className="mt-3 text-sm text-muted">
        {t("itemBest")} {t(channelCopyKey(teaser.bestChannelId, teaser.bestChannelShort))}. {t("itemInstant")}{" "}
        {formatEuro(teaser.trappedVsInstantCents)} {t("itemOnTable")}
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">{t("likeNew")}</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(likeNewBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">{t("fair")}</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(fairBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">{t("brand")}</dt>
          <dd className="mt-1 text-lg">{catalog.brand}</dd>
        </div>
      </dl>
      <div className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">{t("priceYours")}</h2>
        <p className="mt-2 mb-4 text-sm text-muted">{t("priceYoursLead")}</p>
        <Extractor />
      </div>
      <p className="mt-8 text-sm">
        <Link to="/market" className="text-muted hover:text-fg">
          {t("backIndex")}
        </Link>
      </p>
    </Shell>
  );
}
