import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATALOG, catalogBySlug } from "@/lib/catalog";
import { blurRange, priceItem } from "@/lib/pricing";
import type { PublicIndexRow } from "@/lib/types";

function rowFromSlug(slug: string): PublicIndexRow | null {
  const catalog = catalogBySlug(slug);
  if (!catalog) return null;
  const priced = priceItem({ catalog, condition: "good" });
  const range = blurRange(priced.bestTakeHomeCents);
  return {
    slug: catalog.slug,
    name: catalog.name,
    category: catalog.category,
    brand: catalog.brand,
    bestTakeHomeCents: priced.bestTakeHomeCents,
    rangeLowCents: range.low,
    rangeHighCents: range.high,
    bestChannelShort: priced.quotes[0]?.short ?? "Local",
  };
}

export const listMarket = createServerFn({ method: "GET" })
  .validator(z.object({ category: z.string().max(40).optional() }))
  .handler(async ({ data }) => {
    const filtered = data.category
      ? CATALOG.filter((c) => c.category === data.category)
      : CATALOG;
    const rows = filtered
      .slice()
      .sort((a, b) => b.fairCents * b.demand - a.fairCents * a.demand)
      .map((c) => rowFromSlug(c.slug)!)
      .filter(Boolean);
    return rows;
  });

export const getPublicItem = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(2).max(80) }))
  .handler(async ({ data }) => {
    const catalog = catalogBySlug(data.slug);
    if (!catalog) return { ok: false as const };
    const good = priceItem({ catalog, condition: "good" });
    const likeNew = priceItem({ catalog, condition: "like_new" });
    const fair = priceItem({ catalog, condition: "fair" });
    return {
      ok: true as const,
      catalog: {
        id: catalog.id,
        slug: catalog.slug,
        name: catalog.name,
        brand: catalog.brand,
        model: catalog.model,
        category: catalog.category,
      },
      good,
      likeNewBest: likeNew.bestTakeHomeCents,
      fairBest: fair.bestTakeHomeCents,
      teaser: {
        rangeLowCents: blurRange(good.bestTakeHomeCents).low,
        rangeHighCents: blurRange(good.bestTakeHomeCents).high,
        bestChannelShort: good.quotes[0]?.short ?? "Local",
        trappedVsInstantCents: good.trappedVsInstantCents,
      },
    };
  });

export const healthPayload = async () => {
  const { dbSource, getSql } = await import("@/lib/db");
  let db = "down";
  try {
    const sql = await getSql();
    await sql`select 1 as ok`;
    db = dbSource;
  } catch {
    db = "down";
  }
  return {
    ok: db !== "down",
    service: "netfold",
    db,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    xai: Boolean(process.env.XAI_API_KEY),
    time: new Date().toISOString(),
  };
};
