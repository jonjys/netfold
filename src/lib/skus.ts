export type SkuId = "report" | "extract" | "pack";

export type Sku = {
  id: SkuId;
  name: string;
  blurb: string;
  amountCents: number;
  currency: "sek";
  credits: number;
  includesKit: boolean;
};

export const SKUS: Record<SkuId, Sku> = {
  report: {
    id: "report",
    name: "Lås upp rapport",
    blurb: "Exakt netto, ask/accept och rankade kanaler.",
    amountCents: 2900,
    currency: "sek",
    credits: 0,
    includesKit: false,
  },
  extract: {
    id: "extract",
    name: "Extract-kit",
    blurb: "Rapport plus annonstext, titlar och svar på lowball.",
    amountCents: 7900,
    currency: "sek",
    credits: 0,
    includesKit: true,
  },
  pack: {
    id: "pack",
    name: "5-pack",
    blurb: "Fem kit. För en låda, en flytt eller en garderob.",
    amountCents: 9900,
    currency: "sek",
    credits: 5,
    includesKit: true,
  },
};

export const STRIPE_PRICE_DEFAULT: Record<SkuId, string> = {
  report: "price_1U9kH8Iz5w9JsopQUiPrlTHW",
  extract: "price_1U9kH9Iz5w9JsopQI1otqjGu",
  pack: "price_1U9kHAIz5w9JsopQ1mK4iDfX",
};
