import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { formatEuro, formatEuroRange } from "@/lib/money";
import { getPublicItem } from "@/lib/server/public";

export const Route = createFileRoute("/i/$slug")({
  loader: async ({ params }) => getPublicItem({ data: { slug: params.slug } }),
  component: ItemPage,
});

function ItemPage() {
  const data = Route.useLoaderData();
  if (!data.ok) {
    return (
      <Shell>
        <h1 className="font-display text-3xl">Not in the index yet</h1>
        <p className="mt-2 text-sm text-muted">Run a scan — that is how new models enter.</p>
      </Shell>
    );
  }
  const { catalog, teaser, likeNewBest, fairBest } = data;
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{catalog.category}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{catalog.name}</h1>
      <p className="mt-4 text-sm text-muted">
        Used, good condition, take-home after fees — not the fantasy ask.
      </p>
      <p className="mt-6 font-display text-5xl tracking-tight">
        {formatEuroRange(teaser.rangeLowCents, teaser.rangeHighCents)}
      </p>
      <p className="mt-3 text-sm text-muted">
        Best net usually {teaser.bestChannelShort}. Instant buyers leave about{" "}
        {formatEuro(teaser.trappedVsInstantCents)} on the table.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Like new</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(likeNewBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Fair</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(fairBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Brand</dt>
          <dd className="mt-1 text-lg">{catalog.brand}</dd>
        </div>
      </dl>
      <div className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Price yours</h2>
        <p className="mt-2 mb-4 text-sm text-muted">
          Condition-specific numbers and listing copy sit behind the unlock.
        </p>
        <Extractor />
      </div>
      <p className="mt-8 text-sm">
        <Link to="/market" className="text-muted hover:text-fg">
          Back to index
        </Link>
      </p>
    </Shell>
  );
}
