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
    name: "Lås upp rapport",
    blurb: "Exakt netto, ask/accept och rankade kanaler.",
    amountCents: 249,
    currency: "eur",
    credits: 0,
    includesKit: false,
  },
  extract: {
    id: "extract",
    name: "Extract-kit",
    blurb: "Rapport plus annonstext, titlar och svar på lowball.",
    amountCents: 690,
    currency: "eur",
    credits: 0,
    includesKit: true,
  },
  pack: {
    id: "pack",
    name: "5-pack",
    blurb: "Fem kit. För en låda, en flytt eller en garderob.",
    amountCents: 990,
    currency: "eur",
    credits: 5,
    includesKit: true,
  },
};

export const STRIPE_PRICE_DEFAULT: Record<SkuId, string> = {
  report: "price_1U96y2Iz5w9JsopQXAKOsPBq",
  extract: "price_1U96y4Iz5w9JsopQ41vSjS56",
  pack: "price_1U96y6Iz5w9JsopQ1lkArRXH",
};

