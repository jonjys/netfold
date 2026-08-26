const KEY = "netfold_wallet";

export function getWalletToken(): string {
  if (typeof window === "undefined") return "server";
  let token = window.localStorage.getItem(KEY);
  if (!token) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    token = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(KEY, token);
  }
  return token;
}
