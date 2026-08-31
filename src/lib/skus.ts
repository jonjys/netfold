import type { Lang } from "./copy.ts";
import { formatMoney } from "./money.ts";

export type SkuId = "report" | "extract" | "pack";

export type Sku = {
  id: SkuId;
  name: string;
  blurb: string;
  amountCents: number;
  currency: "sek";
  usdCents: number;
  credits: number;
  includesKit: boolean;
};

export const SKUS: Record<SkuId, Sku> = {
  report: {
    id: "report",
    name: "Annons + netto",
    blurb: "Färdig Blocket-annons, exakt netto och svar till låga bud.",
    amountCents: 2900,
    currency: "sek",
    usdCents: 299,
    credits: 0,
    includesKit: true,
  },
  extract: {
    id: "extract",
    name: "Extra kit",
    blurb: "Samma plus fler kanaltexter.",
    amountCents: 7900,
    currency: "sek",
    usdCents: 799,
    credits: 0,
    includesKit: true,
  },
  pack: {
    id: "pack",
    name: "5-pack",
    blurb: "Fem annonser. För en låda, en flytt eller en garderob.",
    amountCents: 9900,
    currency: "sek",
    usdCents: 999,
    credits: 5,
    includesKit: true,
  },
};

export const STRIPE_PRICE_SEK: Record<SkuId, string> = {
  report: "price_1U9kH8Iz5w9JsopQUiPrlTHW",
  extract: "price_1U9kH9Iz5w9JsopQI1otqjGu",
  pack: "price_1U9kHAIz5w9JsopQ1mK4iDfX",
};

export const STRIPE_PRICE_USD: Record<SkuId, string> = {
  report: "price_1UATDdIz5w9JsopQ2zaE5how",
  extract: "price_1UATDeIz5w9JsopQwD2ERcwV",
  pack: "price_1UATDfIz5w9JsopQnPnjYLUm",
};

export const STRIPE_PRICE_DEFAULT = STRIPE_PRICE_SEK;

export function formatSkuPrice(sku: SkuId, lang: Lang): string {
  if (lang === "en") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(SKUS[sku].usdCents / 100);
  }
  return formatMoney(SKUS[sku].amountCents, "sv", true);
}
