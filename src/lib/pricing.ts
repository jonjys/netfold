import { CATALOG, CATEGORY_FAIR, type CatalogItem, type Category } from "./catalog.ts";
import { CHANNELS, type Channel, type ChannelId } from "./channels.ts";
import { clampCents } from "./money.ts";

export type Condition = "like_new" | "good" | "fair" | "poor";

export const CONDITION_MULT: Record<Condition, number> = {
  like_new: 1.0,
  good: 0.84,
  fair: 0.67,
  poor: 0.38,
};

export const CONDITION_LABEL: Record<Condition, string> = {
  like_new: "Som ny",
  good: "Bra",
  fair: "Okej",
  poor: "Sliten",
};

export type ChannelQuote = {
  channelId: ChannelId;
  name: string;
  short: string;
  soldCents: number;
  feeCents: number;
  shipCents: number;
  takeHomeCents: number;
  daysToSold: number;
  effort: Channel["effort"];
  note: string;
  rank: number;
};

export type PricedItem = {
  catalogId: string | null;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: Category;
  condition: Condition;
  confidence: number;
  fairCents: number;
  askCents: number;
  acceptCents: number;
  walkCents: number;
  quotes: ChannelQuote[];
  bestChannelId: ChannelId;
  bestTakeHomeCents: number;
  worstTakeHomeCents: number;
  trappedVsInstantCents: number;
};

export function priceItem(input: {
  catalog?: CatalogItem;
  name?: string;
  brand?: string;
  model?: string;
  category?: Category;
  condition: Condition;
  confidence?: number;
  askingCents?: number | null;
}): PricedItem {
  const catalog = input.catalog;
  const category: Category = catalog?.category ?? input.category ?? "other";
  const fairBase = catalog?.fairCents ?? CATEGORY_FAIR[category];
  const demand = catalog?.demand ?? 1;
  const condition = input.condition;
  const fairCents = clampCents(fairBase * CONDITION_MULT[condition] * demand);

  const quotes: ChannelQuote[] = CHANNELS.map((ch) => {
    const instantFloor = catalog ? catalog.instantPct : 0.42;
    const sold =
      ch.id === "instant"
        ? clampCents(fairCents * instantFloor)
        : clampCents(fairCents * (1 - ch.priceHaircut));
    const feeCents = clampCents(sold * ch.feePct + ch.feeFixedCents);
    const shipCents = ch.sellerPaysShipCents;
    const takeHomeCents = clampCents(sold - feeCents - shipCents);
    return {
      channelId: ch.id,
      name: ch.name,
      short: ch.short,
      soldCents: sold,
      feeCents,
      shipCents,
      takeHomeCents,
      daysToSold: ch.daysToSold,
      effort: ch.effort,
      note: ch.note,
      rank: 0,
    };
  }).sort((a, b) => b.takeHomeCents - a.takeHomeCents);

  quotes.forEach((q, i) => {
    q.rank = i + 1;
  });

  const best = quotes[0];
  const instant = quotes.find((q) => q.channelId === "instant") ?? quotes[quotes.length - 1];
  const worst = quotes[quotes.length - 1];
  const askCents = clampCents((fairCents * 108) / 100);
  const acceptCents = clampCents((fairCents * 93) / 100);
  const walkCents = clampCents((best.takeHomeCents * 90) / 100);

  const rawSlug =
    catalog?.slug ??
    (input.name ?? "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
  const slug = rawSlug || "item";

  return {
    catalogId: catalog?.id ?? null,
    slug,
    name: catalog?.name ?? input.name ?? "Unlisted item",
    brand: catalog?.brand ?? input.brand ?? "",
    model: catalog?.model ?? input.model ?? "",
    category,
    condition,
    confidence: input.confidence ?? (catalog ? 0.72 : 0.45),
    fairCents,
    askCents,
    acceptCents,
    walkCents,
    quotes,
    bestChannelId: best.channelId,
    bestTakeHomeCents: best.takeHomeCents,
    worstTakeHomeCents: worst.takeHomeCents,
    trappedVsInstantCents: clampCents(best.takeHomeCents - instant.takeHomeCents),
  };
}

export function blurRange(cents: number): { low: number; high: number } {
  const pad = Math.max(800, Math.round(cents * 0.18));
  return { low: clampCents(cents - pad), high: clampCents(cents + pad * 0.7) };
}

export function sumBest(items: PricedItem[]): number {
  return items.reduce((acc, it) => acc + it.bestTakeHomeCents, 0);
}

export function featuredCatalog(limit = 8): CatalogItem[] {
  return [...CATALOG].sort((a, b) => b.demand * b.fairCents - a.demand * a.fairCents).slice(0, limit);
}
