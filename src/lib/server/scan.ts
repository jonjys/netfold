import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { catalogById, matchIdentified, searchCatalog } from "@/lib/catalog";
import { buildAllKits } from "@/lib/listings";
import { blurRange, priceItem, sumBest, type Condition, type PricedItem } from "@/lib/pricing";
import type { ScanFull, ScanMode, ScanTeaser } from "@/lib/types";
import { newId } from "@/lib/utils";
import { getSql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/verify.server";
import { identifyPhoto } from "./xai";

const walletSchema = z.string().min(16).max(80);

async function ensureWallet(token: string) {
  const sql = await getSql();
  await sql`insert into wallets (token, credits) values (${token}, ${0}) on conflict (token) do nothing`;
}

async function bumpRate(key: string, max: number, windowMs: number) {
  const sql = await getSql();
  const rows = await sql<{ count: number; window_start: string }>`
    select count, window_start from rate_limits where key = ${key}`;
  const now = Date.now();
  if (rows[0]) {
    const start = new Date(rows[0].window_start).getTime();
    if (now - start > windowMs) {
      await sql`update rate_limits set count = ${1}, window_start = now() where key = ${key}`;
      return;
    }
    if (rows[0].count >= max) {
      throw new Error("Slow down — too many scans from this device. Try search, or come back later.");
    }
    await sql`update rate_limits set count = count + 1 where key = ${key}`;
    return;
  }
  await sql`insert into rate_limits (key, count) values (${key}, ${1})`;
}

function toTeaser(full: ScanFull): ScanTeaser {
  return {
    token: full.token,
    mode: full.mode,
    createdAt: full.createdAt,
    itemCount: full.itemCount,
    names: full.names,
    bestTakeHomeCents: full.bestTakeHomeCents,
    rangeLowCents: full.rangeLowCents,
    rangeHighCents: full.rangeHighCents,
    trappedVsInstantCents: full.trappedVsInstantCents,
    bestChannelShort: full.bestChannelShort,
    unlocked: full.unlocked,
    hasKit: full.hasKit,
  };
}

function present(full: ScanFull, reveal: boolean): ScanFull | ScanTeaser {
  if (reveal) return full;
  return toTeaser(full);
}

function buildFull(input: {
  token: string;
  mode: ScanMode;
  source: ScanFull["source"];
  items: PricedItem[];
  askingCents: number | null;
  unlocked?: boolean;
  hasKit?: boolean;
}): ScanFull {
  const bestTakeHomeCents = sumBest(input.items);
  const range = blurRange(bestTakeHomeCents);
  const trapped = input.items.reduce((a, i) => a + i.trappedVsInstantCents, 0);
  const best = input.items[0]?.quotes[0];
  return {
    token: input.token,
    mode: input.mode,
    createdAt: new Date().toISOString(),
    itemCount: input.items.length,
    names: input.items.map((i) => i.name),
    bestTakeHomeCents,
    rangeLowCents: range.low,
    rangeHighCents: range.high,
    trappedVsInstantCents: trapped,
    bestChannelShort: best?.short ?? "Lokalt",
    unlocked: input.unlocked ?? false,
    hasKit: input.hasKit ?? false,
    items: input.items,
    askingCents: input.askingCents,
    kits: input.hasKit ? buildAllKits(input.items) : null,
    source: input.source,
  };
}

export async function persistScan(full: ScanFull, wallet: string, imageHash: string | null) {
  const sql = await getSql();
  const teaser = toTeaser(full);
  const session = await getSessionUser();
  const userId = session?.id ?? null;
  await sql`insert into scans (
      id, token, wallet_token, mode, source, image_hash, item_count,
      teaser_json, full_json, unlocked, has_kit, public_slug, asking_cents, user_id
    ) values (
      ${newId()}, ${full.token}, ${wallet}, ${full.mode}, ${full.source}, ${imageHash},
      ${full.itemCount}, ${JSON.stringify(teaser)}, ${JSON.stringify(full)},
      ${full.unlocked}, ${full.hasKit}, ${full.items[0]?.slug ?? null}, ${full.askingCents},
      ${userId}
    )`;
  await sql`insert into events (id, name, scan_token, source)
    values (${newId()}, ${"scan_created"}, ${full.token}, ${full.source})`;
}

export async function loadScan(token: string): Promise<ScanFull | null> {
  const sql = await getSql();
  const rows = await sql<{ full_json: string }>`
    select full_json from scans where token = ${token} limit 1`;
  if (!rows[0]) return null;
  return JSON.parse(rows[0].full_json) as ScanFull;
}

export async function saveScan(full: ScanFull) {
  const sql = await getSql();
  const teaser = toTeaser(full);
  await sql`update scans set
    teaser_json = ${JSON.stringify(teaser)},
    full_json = ${JSON.stringify(full)},
    unlocked = ${full.unlocked},
    has_kit = ${full.hasKit}
    where token = ${full.token}`;
}

export const createScan = createServerFn({ method: "POST" })
  .validator(
    z.object({
      wallet: walletSchema,
      mode: z.enum(["sell", "buy"]),
      askingCents: z.number().int().min(0).max(10_000_000).nullable().optional(),
      kind: z.enum(["photo", "search", "catalog"]),
      imageBase64: z.string().max(700_000).optional(),
      query: z.string().max(120).optional(),
      catalogId: z.string().max(80).optional(),
      condition: z.enum(["like_new", "good", "fair", "poor"]).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await ensureWallet(data.wallet);
    const askingCents = data.askingCents ?? null;
    const token = newId(10);

    if (data.kind === "photo") {
      if (!data.imageBase64 || data.imageBase64.length < 2000) {
        throw new Error("Fotot saknas eller är för litet.");
      }
      await bumpRate(`photo:${data.wallet}`, 8, 24 * 60 * 60 * 1000);
      const identified = await identifyPhoto(data.imageBase64, token);
      if (identified.items.length === 0) {
        throw new Error("Inget gick att läsa. Ta en tightare bild eller sök på namnet.");
      }
      const items = identified.items.map((row) => {
        const catalog = matchIdentified(row);
        return priceItem({
          catalog,
          name: catalog?.name ?? row.name,
          brand: row.brand,
          model: row.model,
          category: row.category,
          condition: row.condition,
          confidence: row.confidence,
          askingCents,
        });
      });
      const full = buildFull({
        token,
        mode: data.mode,
        source: "photo",
        items,
        askingCents,
      });
      await persistScan(full, data.wallet, newId(8));
      return { teaser: toTeaser(full), token };
    }

    if (data.kind === "catalog") {
      const catalog = data.catalogId ? catalogById(data.catalogId) : undefined;
      if (!catalog) throw new Error("Okänd pryl.");
      const condition = (data.condition ?? "good") as Condition;
      const items = [priceItem({ catalog, condition, askingCents })];
      const full = buildFull({
        token,
        mode: data.mode,
        source: "catalog",
        items,
        askingCents,
      });
      await persistScan(full, data.wallet, null);
      return { teaser: toTeaser(full), token };
    }

    const query = (data.query ?? "").trim();
    const hits = searchCatalog(query, 1);
    if (!hits[0]) throw new Error("Ingen träff. Prova modellnamn som Sony XM5 eller iPhone 13.");
    const condition = (data.condition ?? "good") as Condition;
    const items = [priceItem({ catalog: hits[0], condition, askingCents })];
    const full = buildFull({
      token,
      mode: data.mode,
      source: "search",
      items,
      askingCents,
    });
    await persistScan(full, data.wallet, null);
    return { teaser: toTeaser(full), token };
  });

export const getScan = createServerFn({ method: "GET" })
  .validator(z.object({ token: z.string().min(8).max(80) }))
  .handler(async ({ data }) => {
    const full = await loadScan(data.token);
    if (!full) return { ok: false as const };
    return { ok: true as const, view: present(full, full.unlocked) };
  });

export const searchItems = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().max(80) }))
  .handler(async ({ data }) => {
    return searchCatalog(data.q, 6).map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
    }));
  });

export const applyCredit = createServerFn({ method: "POST" })
  .validator(
    z.object({
      wallet: walletSchema,
      token: z.string().min(8).max(80),
      kit: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const wallets = await sql<{ credits: number }>`
      select credits from wallets where token = ${data.wallet}`;
    const credits = wallets[0]?.credits ?? 0;
    if (credits < 1) return { ok: false as const, reason: "no_credits" as const };
    const full = await loadScan(data.token);
    if (!full) return { ok: false as const, reason: "missing" as const };
    await sql`update wallets set credits = credits - 1 where token = ${data.wallet} and credits > 0`;
    full.unlocked = true;
    full.hasKit = true;
    full.kits = buildAllKits(full.items);
    await saveScan(full);
    await sql`insert into events (id, name, scan_token, sku)
      values (${newId()}, ${"credit_unlock"}, ${full.token}, ${"pack"})`;
    return { ok: true as const, view: full };
  });

export const getWalletState = createServerFn({ method: "GET" })
  .validator(z.object({ wallet: walletSchema }))
  .handler(async ({ data }) => {
    await ensureWallet(data.wallet);
    const sql = await getSql();
    const rows = await sql<{ credits: number }>`
      select credits from wallets where token = ${data.wallet}`;
    return { credits: rows[0]?.credits ?? 0 };
  });
