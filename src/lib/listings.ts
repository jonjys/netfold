import type { Lang } from "./copy.ts";
import type { PricedItem } from "./pricing.ts";
import { formatMoney } from "./money.ts";
import { BRAND } from "./brand.ts";

export type ListingKit = {
  channelId: string;
  title: string;
  body: string;
  tags: string[];
};

export type ExtractKit = {
  itemName: string;
  listings: ListingKit[];
  firstMessage: string;
  lowballReply: string;
  holdMessage: string;
  acceptLine: string;
  deadlineLabel: string;
  proofLine: string;
};

export type KitOpts = {
  proofUrl?: string;
  now?: Date;
};

export type PublicProof = {
  token: string;
  name: string;
  condition: string;
  firmCents: number;
  swappieCents: number;
  deadlineISO: string;
};

export const DEMO_PROOF_TOKEN = "demo";

const COND_SV: Record<string, string> = {
  like_new: "som ny",
  good: "bra skick",
  fair: "ok skick",
  poor: "sliten",
};

const COND_EN: Record<string, string> = {
  like_new: "like new",
  good: "good condition",
  fair: "fair condition",
  poor: "worn",
};

export function sellBy(now = new Date()): Date {
  return new Date(now.getTime() + 72 * 60 * 60 * 1000);
}

/** Stable midnight-ish UTC date so demo SSR and client share a deadline. */
export function dayAnchor(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 0, 0));
}

export function formatDeadline(at: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "sv" ? "sv-SE" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(at);
}

export function formatRemaining(at: Date, lang: Lang, now = new Date()): string {
  const ms = Math.max(0, at.getTime() - now.getTime());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return lang === "en" ? `${h}h ${mm}m ${ss}s` : `${h}t ${mm}m ${ss}s`;
}

export function isPast(at: Date, now = new Date()): boolean {
  return at.getTime() <= now.getTime();
}

export function proofHref(token: string, origin = `https://${BRAND.domain}`): string {
  return `${origin.replace(/\/$/, "")}/b/${token}`;
}

export function swappieCents(item: PricedItem): number {
  return item.quotes.find((q) => q.channelId === "instant")?.takeHomeCents ?? 0;
}

export function buildPublicProof(item: PricedItem, createdAt: Date, token: string): PublicProof {
  return {
    token,
    name: item.name,
    condition: item.condition,
    firmCents: item.acceptCents,
    swappieCents: swappieCents(item),
    deadlineISO: sellBy(createdAt).toISOString(),
  };
}

function buildSv(item: PricedItem, opts: KitOpts = {}): ExtractKit {
  const cond = COND_SV[item.condition] ?? "bra skick";
  const firm = formatMoney(item.acceptCents, "sv");
  const when = formatDeadline(sellBy(opts.now), "sv");
  const swap = formatMoney(swappieCents(item), "sv");
  const proof = opts.proofUrl
    ? `Köparbevis (fast pris, inte påhittat): ${opts.proofUrl}`
    : "";

  const body = [
    `${item.name} i ${cond}. Fast pris ${firm}. Inga bud.`,
    item.brand ? `Märke: ${item.brand}.` : "",
    "Hämtas den här veckan, punkt. Jag sitter inte i chatten och håller den.",
    "Rökfritt. Testad och fungerar.",
    `Efter ${when} går den till Swappie istället (${swap} idag).`,
    proof,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    itemName: item.name,
    listings: [
      {
        channelId: "local",
        title: `${item.name} — hämtas i veckan — ${firm} — ej bud`,
        body,
        tags: [item.category, item.brand, "blocket"].filter(Boolean),
      },
      {
        channelId: "facebook",
        title: `${item.name} ${firm} — hämtas i veckan`,
        body: `${item.name} i ${cond}. Fast pris ${firm}. Hämtas före ${when}. Inga bud.`,
        tags: [item.category, "marketplace"],
      },
      {
        channelId: "vinted",
        title: `${item.brand ? item.brand + " " : ""}${item.model || item.name}`.slice(0, 70),
        body: `${item.name}, ${cond}. Fast pris ${firm}.`,
        tags: [item.brand, item.model, item.category].filter(Boolean),
      },
      {
        channelId: "ebay",
        title: `${item.name} ${cond} used`.slice(0, 80),
        body: `Used ${item.name} — ${cond}. Firm ${firm}.`,
        tags: [item.brand, item.model, "used"].filter(Boolean),
      },
    ],
    firstMessage: `Finns. ${firm} fast. Kan du hämta före ${when}? Tid nu, annars går jag vidare.`,
    lowballReply: `Nej. Fast pris ${firm}. Under det tar jag Swappie ${when}.`,
    holdMessage: `Jag håller till imorgon kväll för ${firm}. Sen är det Swappie.`,
    acceptLine: `72-timmarsplan: sälj för ${firm} på Blocket före ${when}. Swappie ger ${swap} idag. Du lämnar ${formatMoney(item.trappedVsInstantCents, "sv")}.`,
    deadlineLabel: when,
    proofLine: proof,
  };
}

function buildEn(item: PricedItem, opts: KitOpts = {}): ExtractKit {
  const cond = COND_EN[item.condition] ?? "good condition";
  const firm = formatMoney(item.acceptCents, "en");
  const when = formatDeadline(sellBy(opts.now), "en");
  const swap = formatMoney(swappieCents(item), "en");
  const proof = opts.proofUrl
    ? `Buyer proof (firm ask, not a fantasy): ${opts.proofUrl}`
    : "";

  const body = [
    `${item.name} in ${cond}. Firm ${firm}. No offers.`,
    item.brand ? `Brand: ${item.brand}.` : "",
    "Pickup this week only. I will not hold it in chat.",
    "Smoke-free. Tested and working.",
    `After ${when} it goes to trade-in instead (${swap} today).`,
    proof,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    itemName: item.name,
    listings: [
      {
        channelId: "facebook",
        title: `${item.name} — pickup this week — ${firm} — firm`,
        body,
        tags: [item.category, "marketplace"],
      },
      {
        channelId: "local",
        title: `${item.name} — ${cond} — ${firm}`,
        body: `${item.name} in ${cond}. Firm ${firm}. Pickup before ${when}. No offers.`,
        tags: [item.category, item.brand, "local"].filter(Boolean),
      },
      {
        channelId: "vinted",
        title: `${item.brand ? item.brand + " " : ""}${item.model || item.name}`.slice(0, 70),
        body: `${item.name}, ${cond}. Firm ${firm}.`,
        tags: [item.brand, item.model, item.category].filter(Boolean),
      },
      {
        channelId: "ebay",
        title: `${item.name} ${cond} used`.slice(0, 80),
        body: `Used ${item.name} — ${cond}. Firm ${firm}.`,
        tags: [item.brand, item.model, "used"].filter(Boolean),
      },
    ],
    firstMessage: `Still here. ${firm} firm. Can you pick up before ${when}? Time now or I move on.`,
    lowballReply: `No. Firm ${firm}. Below that it goes to trade-in on ${when}.`,
    holdMessage: `I can hold until tomorrow evening for ${firm}. Then it is trade-in.`,
    acceptLine: `72-hour plan: sell at ${firm} before ${when}. Trade-in pays ${swap} today. You leave ${formatMoney(item.trappedVsInstantCents, "en")}.`,
    deadlineLabel: when,
    proofLine: proof,
  };
}

export function buildExtractKit(item: PricedItem, lang: Lang = "sv", opts: KitOpts = {}): ExtractKit {
  return lang === "en" ? buildEn(item, opts) : buildSv(item, opts);
}

export function buildAllKits(items: PricedItem[], lang: Lang = "sv", opts: KitOpts = {}): ExtractKit[] {
  return items.map((item) => buildExtractKit(item, lang, opts));
}

export function lockedAdPreview(name: string, lang: Lang): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: `${name} — pickup this week — firm — no offers`,
      body: `${name} in good condition. Firm price. Pickup this week only. After 72 hours it goes to trade-in instead. Buyer proof in the ad.`,
    };
  }
  return {
    title: `${name} — hämtas i veckan — ej bud`,
    body: `${name} i bra skick. Fast pris. Hämtas den här veckan, punkt. Efter 72 timmar går den till Swappie istället. Köparbevis i annonsen.`,
  };
}
