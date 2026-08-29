import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { CATALOG } from "@/lib/catalog";
import { formatEuro } from "@/lib/money";
import { priceItem } from "@/lib/pricing";

export const Route = createFileRoute("/iphone-varde")({
  head: () => ({
    meta: [
      { title: "iPhone värde på Blocket — vad du får kvar | Netfold" },
      {
        name: "description",
        content:
          "Vad är min iPhone värd på Blocket? Netfold räknar nettot i kronor efter avgifter för iPhone 16, 15, 14, 13 och 12 — innan du lägger ut annonsen.",
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
        Blocket visar utropspris. Du får något annat i fickan. Skriv modell eller ta foto — Netfold
        räknar nettot i kronor.
      </p>
      <div className="mt-8">
        <Extractor />
      </div>
      <ul className="mt-10 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        {phones.map((item) => {
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
    </Shell>
  );
}
