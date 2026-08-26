import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { BRAND } from "@/lib/brand";
import { featuredCatalog } from "@/lib/pricing";
import { formatEuro } from "@/lib/money";
import { priceItem } from "@/lib/pricing";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featured = featuredCatalog(6);

  return (
    <Shell>
      <section className="pb-6 pt-4 sm:pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Vad du får i fickan</p>
        <h1 className="mt-3 max-w-2xl font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-6xl">
          {BRAND.tagline}
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted">
          Utropet ljuger. Avgifter, no-shows och instant-köpare tar resten. Netfold
          räknar nettot per kanal — Blocket, Vinted, eBay — innan du säljer.
        </p>
      </section>

      <Extractor />

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { n: "01", t: "Namn eller foto", d: "Identifiera prylen. Skick ingår." },
          { n: "02", t: "Netto per kanal", d: "Lokalt, Blocket, Vinted, eBay, instant." },
          { n: "03", t: "Lås upp rapporten", d: "Betala en gång. Spara den på kontot." },
        ].map((s) => (
          <article key={s.n} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs text-subtle">{s.n}</p>
            <h2 className="mt-2 font-display text-xl tracking-tight">{s.t}</h2>
            <p className="mt-1 text-sm text-muted">{s.d}</p>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Prisindex</h2>
          <Link to="/market" className="text-sm text-muted hover:text-fg">
            Alla prylar
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
          {featured.map((item) => {
            const priced = priceItem({ catalog: item, condition: "good" });
            return (
              <li key={item.id}>
                <Link
                  to="/i/$slug"
                  params={{ slug: item.slug }}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <span className="text-sm">{item.name}</span>
                  <span className="font-mono text-sm tabular-nums text-muted">
                    {formatEuro(priced.bestTakeHomeCents)}
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
