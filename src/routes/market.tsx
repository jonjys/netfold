import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { formatEuroRange } from "@/lib/money";
import { listMarket } from "@/lib/server/public";

export const Route = createFileRoute("/market")({
  loader: () => listMarket({ data: {} }),
  component: MarketPage,
});

function MarketPage() {
  const rows = Route.useLoaderData();
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Public index</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">What used things actually net</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Good-condition take-home ranges. Not asking prices. Every row is a page you
        can share.
      </p>
      <ul className="mt-8 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        {rows.map((row) => (
          <li key={row.slug}>
            <Link
              to="/i/$slug"
              params={{ slug: row.slug }}
              className="flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <span>
                <span className="block text-sm">{row.name}</span>
                <span className="text-xs text-subtle">
                  {row.brand} · {row.bestChannelShort}
                </span>
              </span>
              <span className="font-mono text-sm tabular-nums text-muted">
                {formatEuroRange(row.rangeLowCents, row.rangeHighCents)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
