import { createFileRoute, Link } from "@tanstack/react-router";
import { Extractor } from "@/components/extractor";
import { Shell } from "@/components/shell";
import { VsCard } from "@/components/vs-card";
import { CATALOG, catalogById } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { priceItem } from "@/lib/pricing";

export const Route = createFileRoute("/swappie-vs-blocket")({
  head: () => ({
    meta: [
      { title: "Swappie vs Blocket — vad du får för iPhone | Netfold" },
      {
        name: "description",
        content:
          "Vad ger Swappie för iPhone 13, 14 och 15 Pro Max — och vad får du kvar på Blocket? Samma modell, två utfall. 29 kr för Blocket-annonsen.",
      },
      {
        name: "keywords",
        content:
          "swappie vs blocket, sälj iphone swappie, vad ger swappie, swappie iphone 14 pro max, sälja iphone blocket eller swappie",
      },
    ],
  }),
  component: SwappiePage,
});

function SwappiePage() {
  const hero = catalogById("iphone-14-pro-max");
  const pricedHero = hero ? priceItem({ catalog: hero, condition: "good" }) : null;
  const phones = CATALOG.filter((c) => c.category === "phone" && c.brand === "Apple");

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-subtle">Swappie · Blocket</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
        Swappie vs Blocket
      </h1>
      <p className="mt-4 max-w-lg text-base text-muted">
        Swappie tar Googlesökningen och betalar ut idag. På en iPhone 14 Pro Max i bra skick är det
        ungefär 1 300 kr. Samma telefon på Blocket ger runt 4 500 kr. Skillnaden är det du tjänar på
        att inte klicka på annonsen.
      </p>
      {pricedHero ? (
        <VsCard
          blocketCents={
            pricedHero.quotes.find((q) => q.channelId === "local")?.takeHomeCents ??
            pricedHero.bestTakeHomeCents
          }
          swappieCents={
            pricedHero.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0
          }
        />
      ) : null}

      <div className="mt-8">
        <Extractor />
      </div>

      <ul className="mt-10 divide-y divide-border rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        {phones.map((item) => {
          const priced = priceItem({ catalog: item, condition: "good" });
          const blocket =
            priced.quotes.find((q) => q.channelId === "local")?.takeHomeCents ??
            priced.bestTakeHomeCents;
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
                  <span className="text-xs text-subtle">
                    Swappie {formatMoney(swappie, "sv")} · Blocket {formatMoney(blocket, "sv")}
                  </span>
                </span>
                <span className="font-mono text-sm tabular-nums text-ok">
                  +{formatMoney(priced.trappedVsInstantCents, "sv")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 max-w-lg text-sm text-muted">
        Swappie är rätt om du vill ha pengarna idag och skippa chatten. Blocket är rätt om telefonen
        startar, Face ID fungerar och du kan vänta en vecka. 29 kr är annonsen — inte en värdering.
      </p>
    </Shell>
  );
}
