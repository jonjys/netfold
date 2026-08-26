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
    short: "Lokalt",
    feePct: 0,
    feeFixedCents: 0,
    sellerPaysShipCents: 0,
    priceHaircut: 0.04,
    daysToSold: 11,
    effort: "high",
    note: "Inga avgifter. Du tar no-shows och chatten.",
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
