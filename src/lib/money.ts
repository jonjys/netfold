const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const SEK_EXACT = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatEuro(cents: number, exact = false): string {
  const value = Math.round(cents) / 100;
  return exact ? SEK_EXACT.format(value) : SEK.format(value);
}

export function formatEuroRange(lowCents: number, highCents: number): string {
  if (Math.abs(highCents - lowCents) < 1500) return formatEuro(Math.round((lowCents + highCents) / 2));
  return `${formatEuro(lowCents)}–${formatEuro(highCents)}`;
}

export function clampCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}
