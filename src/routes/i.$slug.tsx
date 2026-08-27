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
        <h1 className="font-display text-3xl">Inte i indexet än</h1>
        <p className="mt-2 text-sm text-muted">Kör en scan — så kommer nya modeller in.</p>
      </Shell>
    );
  }
  const { catalog, teaser, likeNewBest, fairBest } = data;
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">{catalog.category}</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{catalog.name}</h1>
      <p className="mt-4 text-sm text-muted">
        Begagnat, bra skick, netto efter avgifter — inte utropsfantasin.
      </p>
      <p className="mt-6 font-display text-5xl tracking-tight">
        {formatEuroRange(teaser.rangeLowCents, teaser.rangeHighCents)}
      </p>
      <p className="mt-3 text-sm text-muted">
        Bästa nettot brukar vara {teaser.bestChannelShort}. Instant-köpare lämnar ungefär{" "}
        {formatEuro(teaser.trappedVsInstantCents)} på bordet.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Som ny</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(likeNewBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Okej skick</dt>
          <dd className="mt-1 font-mono text-lg tabular-nums">{formatEuro(fairBest)}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
          <dt className="text-xs text-subtle">Märke</dt>
          <dd className="mt-1 text-lg">{catalog.brand}</dd>
        </div>
      </dl>
      <div className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Prissätt din</h2>
        <p className="mt-2 mb-4 text-sm text-muted">
          Exakta tal per skick och annonstext ligger bakom upplåsningen.
        </p>
        <Extractor />
      </div>
      <p className="mt-8 text-sm">
        <Link to="/market" className="text-muted hover:text-fg">
          Tillbaka till index
        </Link>
      </p>
    </Shell>
  );
}
