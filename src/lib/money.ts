const EUR = new Intl.NumberFormat("en-EU", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const EUR_EXACT = new Intl.NumberFormat("en-EU", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEuro(cents: number, exact = false): string {
  const value = Math.round(cents) / 100;
  return exact ? EUR_EXACT.format(value) : EUR.format(value);
}

export function formatEuroRange(lowCents: number, highCents: number): string {
  if (Math.abs(highCents - lowCents) < 150) return formatEuro(Math.round((lowCents + highCents) / 2));
  return `${formatEuro(lowCents)}–${formatEuro(highCents)}`;
}

export function clampCents(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}
