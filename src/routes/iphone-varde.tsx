import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { CATALOG } from "@/lib/catalog";
import { formatEuro } from "@/lib/money";
import { priceItem } from "@/lib/pricing";

export const Route = createFileRoute("/iphone-varde")({
  head: () => ({
    meta: [
      { title: "iPhone värde på Blocket — mot Swappie | Netfold" },
      {
        name: "description",
        content:
          "Vad är min iPhone värd på Blocket jämfört med Swappie? iPhone 16, 15, 14 Pro Max, 13 — netto i kronor, inte utropspriset.",
      },
    ],
  }),
  component: IphonePage,
});

function IphonePage() {
  const phones = CATALOG.filter((c) => c.category === "phone" && c.brand === "Apple");
  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Blocket · iPhone</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
        Vad är min iPhone värd på Blocket?
      </h1>
      <p className="mt-4 max-w-lg text-base text-muted">
        Swappie ger pengar idag. Blocket ger mer om du orkar chatten. Skriv modell eller ta foto —
        Netfold räknar båda i kronor och skriver annonsen.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/swappie-vs-blocket" className="text-muted hover:text-fg">
          Swappie vs Blocket →
        </Link>
      </p>
      <div className="mt-8">
        <Extractor />
      </div>
      <ul className="mt-10 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        {phones.map((item) => {
          const priced = priceItem({ catalog: item, condition: "good" });
          const swappie = priced.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0;
          return (
            <li key={item.id}>
              <Link
                to="/i/$slug"
                params={{ slug: item.slug }}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <span>
                  <span className="block text-sm">{item.name}</span>
                  <span className="text-xs text-subtle">Swappie {formatEuro(swappie)}</span>
                </span>
                <span className="font-mono text-sm tabular-nums text-muted">
                  {formatEuro(priced.bestTakeHomeCents)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
