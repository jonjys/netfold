import type { Lang } from "./copy.ts";

const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const USD_EXACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Catalog and quotes are stored in SEK öre. ~10.5 kr per USD. */
export const SEK_PER_USD = 10.5;

export function sekToUsdCents(sekOre: number): number {
  return Math.round(sekOre / SEK_PER_USD);
}

export function usdToSekOre(usdCents: number): number {
  return Math.round(usdCents * SEK_PER_USD);
}

export function formatMoney(sekOre: number, lang: Lang = "sv", exact = false): string {
  if (lang === "en") {
    const usd = sekToUsdCents(sekOre) / 100;
    return exact ? USD_EXACT.format(usd) : USD.format(usd);
  }
  const kr = Math.round(sekOre) / 100;
  return SEK.format(kr);
}

export function formatMoneyRange(lowCents: number, highCents: number, lang: Lang = "sv"): string {
  const span = lang === "en" ? 2000 : 1500;
  if (Math.abs(highCents - lowCents) < span) return formatMoney(Math.round((lowCents + highCents) / 2), lang);
  return `${formatMoney(lowCents, lang)}–${formatMoney(highCents, lang)}`;
}

/** @deprecated use formatMoney — kept for server/admin SEK */
export function formatEuro(cents: number, exact = false): string {
  return formatMoney(cents, "sv", exact);
}

export function formatEuroRange(lowCents: number, highCents: number): string {
  return formatMoneyRange(lowCents, highCents, "sv");
}

export function clampCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}
