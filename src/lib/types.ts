import type { ExtractKit } from "./listings";
import type { PricedItem } from "./pricing";

export type ScanMode = "sell" | "buy";

export type ScanTeaser = {
  token: string;
  mode: ScanMode;
  createdAt: string;
  itemCount: number;
  names: string[];
  bestTakeHomeCents: number;
  rangeLowCents: number;
  rangeHighCents: number;
  trappedVsInstantCents: number;
  bestChannelShort: string;
  unlocked: boolean;
  hasKit: boolean;
};

export type ScanFull = ScanTeaser & {
  items: PricedItem[];
  askingCents: number | null;
  kits: ExtractKit[] | null;
  source: "photo" | "search" | "catalog";
};

export type PublicIndexRow = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  bestTakeHomeCents: number;
  rangeLowCents: number;
  rangeHighCents: number;
  bestChannelShort: string;
};
