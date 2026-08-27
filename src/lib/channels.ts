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
    name: "Local pickup",
    short: "Local",
    feePct: 0,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0.04,
    daysToSold: 11,
    effort: "high",
    note: "No fees. You take the no-shows and the chat.",
  },
  {
    id: "facebook",
    name: "Facebook / Blocket",
    short: "Marketplace",
    feePct: 0,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0.07,
    daysToSold: 8,
    effort: "high",
    note: "Fast local demand. Lowest net only if you actually close.",
  },
  {
    id: "vinted",
    name: "Vinted",
    short: "Vinted",
    feePct: 0.05,
    feeFixedCents: 70,
    sellerPaysShipCents: 0,
    priceHaircut: 0.06,
    daysToSold: 14,
    effort: "medium",
    note: "Buyer-paid shipping on most lots. Mild seller fee.",
  },
  {
    id: "ebay",
    name: "eBay",
    short: "eBay",
    feePct: 0.1325,
    feeFixedCents: 35,
    sellerPaysShipCents: 0,
    priceHaircut: 0.02,
    daysToSold: 10,
    effort: "medium",
    note: "Highest sold prices. Fees take a real bite.",
  },
  {
    id: "instant",
    name: "Instant buyer",
    short: "Instant",
    feePct: 0.42,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0,
    daysToSold: 3,
    effort: "low",
    note: "Sellpy / trade-in style. Cash this week, half the value.",
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
  if (s.includes("instant") || s.includes("direkt")) return "chInstant";
  if (s.includes("market") || s.includes("blocket") || s.includes("facebook")) return "chFacebook";
  return "chLocal";
}
