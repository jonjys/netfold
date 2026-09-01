import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { formatMoneyRange } from "@/lib/money";
import { listMarket } from "@/lib/server/public";
import { useI18n } from "@/lib/i18n";
import { channelCopyKey } from "@/lib/channels";
import { catalogImage } from "@/lib/catalog";
import type { PublicIndexRow } from "@/lib/types";

export const Route = createFileRoute("/market")({
  loader: () => listMarket({ data: {} }),
  head: () => ({
    meta: [
      { title: "Begagnat värde på Blocket — prisindex | Netfold" },
      {
        name: "description",
        content:
          "Vad ger iPhone, MacBook och hörlurar i fickan på Blocket? Netto efter avgifter — inte utropspris.",
      },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const rows = Route.useLoaderData();
  const { t, lang } = useI18n();
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{t("marketKicker")}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">{t("marketTitle")}</h1>
      <p className="mt-3 max-w-md text-sm text-muted">{t("marketLead")}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {rows.map((row: PublicIndexRow) => {
          const img = catalogImage(row.slug);
          return (
            <li key={row.slug}>
              <Link
                to="/i/$slug"
                params={{ slug: row.slug }}
                className="flex min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-2xl bg-surface pr-4 shadow-[var(--shadow-border)] transition-transform duration-150 hover:-translate-y-0.5"
              >
                {img ? (
                  <img src={img} alt="" className="h-[4.5rem] w-[4.5rem] object-cover" />
                ) : (
                  <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center bg-surface-2 font-display text-xl text-muted">
                    {row.brand.slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{row.name}</span>
                  <span className="text-xs text-subtle">
                    {t(channelCopyKey(row.bestChannelId, row.bestChannelShort))}
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums text-muted">
                  {formatMoneyRange(row.rangeLowCents, row.rangeHighCents, lang)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
