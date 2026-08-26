export const CONSENT_COOKIE = "netfold_consent";
export type ConsentValue = "accepted" | "declined";

export function readConsent(): ConsentValue | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)netfold_consent=(accepted|declined)(?:;|$)/);
  return (match?.[1] as ConsentValue | undefined) ?? null;
}

export function writeConsent(value: ConsentValue) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function hasAcceptedConsent(): boolean {
  return readConsent() === "accepted";
}

export function cookieHasConsent(header: string | null | undefined): boolean {
  return /(?:^|;\s*)netfold_consent=accepted(?:;|$)/.test(header ?? "");
}
