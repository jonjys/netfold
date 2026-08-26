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
        <p className="text-xs uppercase tracking-[0.2em] text-subtle">Take-home extractor</p>
        <h1 className="mt-3 max-w-2xl font-display text-[2.6rem] leading-[0.95] tracking-tight sm:text-6xl">
          {BRAND.tagline}
        </h1>
        <p className="mt-4 max-w-lg text-base text-muted">
          Asking prices lie. Fees, no-shows and instant-buyers take the rest. Netfold
          folds the channel math and shows what you actually keep.
        </p>
      </section>

      <Extractor />

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { n: "01", t: "Name or photo", d: "Identify the item. Condition included." },
          { n: "02", t: "Net by channel", d: "Local, Vinted, eBay, marketplace, instant." },
          { n: "03", t: "Unlock & extract", d: "Pay once. Copy listings. Share the number." },
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
          <h2 className="font-display text-2xl tracking-tight">Live index</h2>
          <Link to="/market" className="text-sm text-muted hover:text-fg">
            All items
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
