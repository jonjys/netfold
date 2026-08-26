export type SkuId = "report" | "extract" | "pack";

export type Sku = {
  id: SkuId;
  name: string;
  blurb: string;
  amountCents: number;
  currency: "eur";
  credits: number;
  includesKit: boolean;
};

export const SKUS: Record<SkuId, Sku> = {
  report: {
    id: "report",
    name: "Unlock report",
    blurb: "Exact take-home, ask/accept prices, ranked channels.",
    amountCents: 249,
    currency: "eur",
    credits: 0,
    includesKit: false,
  },
  extract: {
    id: "extract",
    name: "Extract kit",
    blurb: "Report plus listing copy, titles, and lowball replies for every item.",
    amountCents: 690,
    currency: "eur",
    credits: 0,
    includesKit: true,
  },
  pack: {
    id: "pack",
    name: "5-extract pack",
    blurb: "Five extract kits. For a drawer, a move, or a closet.",
    amountCents: 990,
    currency: "eur",
    credits: 5,
    includesKit: true,
  },
};

export const STRIPE_PRICE_DEFAULT: Record<SkuId, string> = {
  report: "price_1U8mk3BEo0Yzuylwi2JJrWiF",
  extract: "price_1U8mk5BEo0Yzuylw3xTpywzM",
  pack: "price_1U8mk7BEo0YzuylwI70qxILE",
};

