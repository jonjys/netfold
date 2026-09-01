export type ChannelId =
  | "local"
  | "facebook"
  | "vinted"
  | "ebay"
  | "instant";

export type Channel = {
  id: ChannelId;
  name: string;
  short: string;
  feePct: number;
  feeFixedCents: number;
  sellerPaysShipCents: number;
  /** Typical sold-price haircut vs a fair private-sale ask. */
  priceHaircut: number;
  daysToSold: number;
  effort: "low" | "medium" | "high";
  note: string;
};

export const CHANNELS: Channel[] = [
  {
    id: "local",
    name: "Blocket",
    short: "Blocket",
    feePct: 0,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0.04,
    daysToSold: 11,
    effort: "high",
    note: "Sveriges flöde. Inga avgifter. Du tar no-shows och chatten.",
  },
  {
    id: "facebook",
    name: "Facebook Marketplace",
    short: "Marketplace",
    feePct: 0,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0.07,
    daysToSold: 8,
    effort: "high",
    note: "Snabb lokal efterfrågan. Nettot håller bara om du stänger affären.",
  },
  {
    id: "vinted",
    name: "Vinted",
    short: "Vinted",
    feePct: 0.05,
    feeFixedCents: 770,
    sellerPaysShipCents: 0,
    priceHaircut: 0.06,
    daysToSold: 14,
    effort: "medium",
    note: "Köparen betalar oftast frakt. Mild säljaravgift.",
  },
  {
    id: "ebay",
    name: "eBay",
    short: "eBay",
    feePct: 0.1325,
    feeFixedCents: 385,
    sellerPaysShipCents: 0,
    priceHaircut: 0.02,
    daysToSold: 10,
    effort: "medium",
    note: "Högre sålda priser. Avgifterna tar en rejäl tugga.",
  },
  {
    id: "instant",
    name: "Swappie",
    short: "Swappie",
    feePct: 0.42,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0,
    daysToSold: 1,
    effort: "low",
    note: "Swappie / inbyte. Pengar idag. Ungefär en tredjedel av Blocket.",
  },
];

export function channelById(id: ChannelId): Channel {
  const found = CHANNELS.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown channel ${id}`);
  return found;
}

export const CHANNEL_COPY_KEY: Record<ChannelId, "chLocal" | "chFacebook" | "chVinted" | "chEbay" | "chInstant"> = {
  local: "chLocal",
  facebook: "chFacebook",
  vinted: "chVinted",
  ebay: "chEbay",
  instant: "chInstant",
};

export function channelCopyKey(id?: string | null, short?: string | null) {
  if (id && id in CHANNEL_COPY_KEY) return CHANNEL_COPY_KEY[id as ChannelId];
  const s = (short ?? "").toLowerCase();
  if (s.includes("vinted")) return "chVinted";
  if (s.includes("ebay")) return "chEbay";
  if (s.includes("instant") || s.includes("direkt") || s.includes("swappie") || s.includes("trade")) return "chInstant";
  if (s.includes("market") || s.includes("facebook")) return "chFacebook";
  return "chLocal";
}
