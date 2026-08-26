import { normalizeQuery } from "./utils.ts";

export type Category =
  | "phone"
  | "tablet"
  | "laptop"
  | "headphones"
  | "console"
  | "camera"
  | "watch"
  | "sneakers"
  | "lego"
  | "kitchen"
  | "vacuum"
  | "bike"
  | "speaker"
  | "gpu"
  | "monitor"
  | "other";

export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  category: Category;
  aliases: string[];
  /** Typical sold price in EUR cents, used/good condition, private-sale fair. */
  fairCents: number;
  instantPct: number;
  demand: number;
};

export const CATALOG: CatalogItem[] = [
  item("iphone-16-128", "iPhone 16 128GB", "Apple", "iPhone 16", "phone", ["iphone 16"], 74900, 0.48, 1.08),
  item("iphone-15-128", "iPhone 15 128GB", "Apple", "iPhone 15", "phone", ["iphone 15"], 51900, 0.5, 1.05),
  item("iphone-14-128", "iPhone 14 128GB", "Apple", "iPhone 14", "phone", ["iphone 14"], 32900, 0.52, 1.02),
  item("iphone-13-128", "iPhone 13 128GB", "Apple", "iPhone 13", "phone", ["iphone 13"], 22900, 0.54, 1.0),
  item("iphone-12-128", "iPhone 12 128GB", "Apple", "iPhone 12", "phone", ["iphone 12"], 15900, 0.5, 0.92),
  item("iphone-se-2022", "iPhone SE 2022", "Apple", "iPhone SE", "phone", ["iphone se"], 12900, 0.48, 0.88),
  item("pixel-8", "Pixel 8 128GB", "Google", "Pixel 8", "phone", ["pixel 8"], 27900, 0.5, 0.94),
  item("pixel-9", "Pixel 9 128GB", "Google", "Pixel 9", "phone", ["pixel 9"], 42900, 0.5, 0.98),
  item("galaxy-s24", "Galaxy S24 128GB", "Samsung", "Galaxy S24", "phone", ["s24"], 33900, 0.5, 0.96),
  item("galaxy-s23", "Galaxy S23 128GB", "Samsung", "Galaxy S23", "phone", ["s23"], 23900, 0.5, 0.9),
  item("ipad-10", "iPad 10th gen 64GB", "Apple", "iPad 10", "tablet", ["ipad 10"], 24900, 0.46, 0.95),
  item("ipad-air-m2", "iPad Air M2 128GB", "Apple", "iPad Air", "tablet", ["ipad air"], 44900, 0.5, 1.02),
  item("ipad-pro-m4-11", "iPad Pro 11 M4 256GB", "Apple", "iPad Pro", "tablet", ["ipad pro"], 72900, 0.52, 1.04),
  item("macbook-air-m1", "MacBook Air M1 13", "Apple", "MacBook Air M1", "laptop", ["mba m1", "macbook air m1"], 42900, 0.5, 1.06),
  item("macbook-air-m2", "MacBook Air M2 13", "Apple", "MacBook Air M2", "laptop", ["mba m2", "macbook air m2"], 62900, 0.52, 1.08),
  item("macbook-air-m3", "MacBook Air M3 13", "Apple", "MacBook Air M3", "laptop", ["mba m3"], 77900, 0.52, 1.1),
  item("macbook-pro-14-m3", "MacBook Pro 14 M3", "Apple", "MacBook Pro 14", "laptop", ["mbp 14"], 109900, 0.5, 1.04),
  item("thinkpad-x1-c9", "ThinkPad X1 Carbon Gen 9", "Lenovo", "X1 Carbon", "laptop", ["x1 carbon"], 38900, 0.42, 0.86),
  item("framework-13", "Framework Laptop 13", "Framework", "Laptop 13", "laptop", ["framework"], 54900, 0.4, 0.9),
  item("sony-xm5", "Sony WH-1000XM5", "Sony", "WH-1000XM5", "headphones", ["xm5", "wh-1000xm5", "sony xm5"], 17900, 0.46, 1.12),
  item("sony-xm4", "Sony WH-1000XM4", "Sony", "WH-1000XM4", "headphones", ["xm4", "wh-1000xm4"], 10900, 0.44, 1.08),
  item("sony-xm3", "Sony WH-1000XM3", "Sony", "WH-1000XM3", "headphones", ["xm3"], 6900, 0.4, 0.92),
  item("airpods-pro-2", "AirPods Pro 2", "Apple", "AirPods Pro 2", "headphones", ["airpods pro"], 13900, 0.5, 1.1),
  item("airpods-max", "AirPods Max", "Apple", "AirPods Max", "headphones", ["airpods max"], 28900, 0.48, 0.98),
  item("bose-qc-ultra", "Bose QC Ultra Headphones", "Bose", "QC Ultra", "headphones", ["bose ultra", "qc ultra"], 16900, 0.44, 0.96),
  item("airpods-3", "AirPods 3", "Apple", "AirPods 3", "headphones", ["airpods 3"], 7900, 0.46, 0.94),
  item("ps5-slim", "PlayStation 5 Slim", "Sony", "PS5 Slim", "console", ["ps5", "playstation 5"], 35900, 0.55, 1.14),
  item("ps5-digital", "PlayStation 5 Digital", "Sony", "PS5 Digital", "console", ["ps5 digital"], 28900, 0.54, 1.08),
  item("xbox-series-x", "Xbox Series X", "Microsoft", "Series X", "console", ["series x"], 31900, 0.5, 1.02),
  item("switch-oled", "Nintendo Switch OLED", "Nintendo", "Switch OLED", "console", ["switch oled"], 21900, 0.52, 1.1),
  item("switch-lite", "Nintendo Switch Lite", "Nintendo", "Switch Lite", "console", ["switch lite"], 10900, 0.48, 0.95),
  item("steam-deck-512", "Steam Deck 512GB", "Valve", "Steam Deck", "console", ["steam deck"], 27900, 0.46, 1.06),
  item("steam-deck-oled", "Steam Deck OLED 1TB", "Valve", "Steam Deck OLED", "console", ["deck oled"], 42900, 0.48, 1.08),
  item("canon-r50", "Canon EOS R50", "Canon", "R50", "camera", ["eos r50"], 44900, 0.5, 0.98),
  item("sony-a6400", "Sony a6400", "Sony", "a6400", "camera", ["a6400"], 52900, 0.5, 1.0),
  item("sony-a7iii", "Sony a7 III", "Sony", "a7 III", "camera", ["a7iii", "a7 iii"], 74900, 0.52, 1.04),
  item("gopro-12", "GoPro Hero 12", "GoPro", "Hero 12", "camera", ["hero 12"], 21900, 0.46, 0.96),
  item("insta360-x3", "Insta360 X3", "Insta360", "X3", "camera", ["x3"], 18900, 0.44, 0.92),
  item("apple-watch-s9", "Apple Watch Series 9 45mm", "Apple", "Watch S9", "watch", ["watch series 9", "watch s9"], 21900, 0.48, 1.02),
  item("apple-watch-se-2", "Apple Watch SE 2 44mm", "Apple", "Watch SE 2", "watch", ["watch se"], 12900, 0.46, 0.96),
  item("garmin-fenix-7", "Garmin Fenix 7", "Garmin", "Fenix 7", "watch", ["fenix 7"], 27900, 0.42, 0.9),
  item("jordan-1-chicago", "Air Jordan 1 Chicago", "Nike", "Jordan 1 Chicago", "sneakers", ["jordan 1", "chicago"], 24900, 0.35, 1.05),
  item("dunk-panda", "Nike Dunk Low Panda", "Nike", "Dunk Low Panda", "sneakers", ["dunk panda", "panda dunks"], 9900, 0.32, 0.98),
  item("yeezy-350-oreos", "Yeezy 350 V2 Oreo", "Adidas", "350 V2 Oreo", "sneakers", ["yeezy 350", "oreos"], 13900, 0.3, 0.9),
  item("nb-550", "New Balance 550", "New Balance", "550", "sneakers", ["nb 550"], 7900, 0.3, 0.88),
  item("lego-75192", "LEGO UCS Millennium Falcon 75192", "LEGO", "75192", "lego", ["millennium falcon", "75192"], 54900, 0.4, 1.12),
  item("lego-10294", "LEGO Titanic 10294", "LEGO", "10294", "lego", ["titanic lego", "10294"], 42900, 0.38, 1.0),
  item("lego-technic-porsche", "LEGO Technic Porsche 911 RSR", "LEGO", "42096", "lego", ["porsche lego"], 18900, 0.36, 0.94),
  item("kitchenaid-artisan", "KitchenAid Artisan mixer", "KitchenAid", "Artisan", "kitchen", ["kitchenaid", "stand mixer"], 18900, 0.4, 1.04),
  item("nespresso-vertuo", "Nespresso Vertuo", "Nespresso", "Vertuo", "kitchen", ["vertuo"], 6900, 0.34, 0.86),
  item("instant-pot-duo", "Instant Pot Duo 7-in-1", "Instant Pot", "Duo", "kitchen", ["instant pot"], 5900, 0.32, 0.84),
  item("dyson-v15", "Dyson V15 Detect", "Dyson", "V15", "vacuum", ["v15", "dyson v15"], 27900, 0.46, 1.06),
  item("dyson-v11", "Dyson V11", "Dyson", "V11", "vacuum", ["v11"], 16900, 0.44, 0.96),
  item("roborock-s8", "Roborock S8", "Roborock", "S8", "vacuum", ["roborock"], 28900, 0.42, 0.94),
  item("canyon-road", "Canyon Endurace AL", "Canyon", "Endurace", "bike", ["canyon", "endurace"], 64900, 0.38, 0.9),
  item("brompton-c-line", "Brompton C Line", "Brompton", "C Line", "bike", ["brompton"], 79900, 0.4, 1.02),
  item("sonos-era-100", "Sonos Era 100", "Sonos", "Era 100", "speaker", ["era 100"], 14900, 0.44, 0.98),
  item("sonos-move-2", "Sonos Move 2", "Sonos", "Move 2", "speaker", ["move 2"], 27900, 0.44, 1.0),
  item("homepod-mini", "HomePod mini", "Apple", "HomePod mini", "speaker", ["homepod mini"], 5900, 0.4, 0.92),
  item("rtx-4070", "GeForce RTX 4070", "NVIDIA", "RTX 4070", "gpu", ["4070"], 38900, 0.48, 1.04),
  item("rtx-3080", "GeForce RTX 3080", "NVIDIA", "RTX 3080", "gpu", ["3080"], 24900, 0.4, 0.9),
  item("rx-7800-xt", "Radeon RX 7800 XT", "AMD", "7800 XT", "gpu", ["7800 xt"], 32900, 0.46, 0.96),
  item("lg-c3-42", "LG C3 42 OLED", "LG", "C3 42", "monitor", ["c3 42", "lg oled 42"], 54900, 0.42, 0.94),
  item("dell-u2723qe", "Dell U2723QE 27 4K", "Dell", "U2723QE", "monitor", ["u2723qe"], 32900, 0.4, 0.9),
  item("kindle-paperwhite-11", "Kindle Paperwhite 11", "Amazon", "Paperwhite", "other", ["paperwhite", "kindle"], 7900, 0.4, 0.95),
  item("switch-mario-kart-8", "Mario Kart 8 Deluxe", "Nintendo", "MK8 Deluxe", "other", ["mario kart"], 3900, 0.35, 1.05),
  item("dyson-airwrap", "Dyson Airwrap Complete", "Dyson", "Airwrap", "other", ["airwrap"], 24900, 0.48, 1.08),
  item("gopro-11", "GoPro Hero 11", "GoPro", "Hero 11", "camera", ["hero 11"], 16900, 0.44, 0.9),
  item("oculus-quest-3", "Meta Quest 3 128GB", "Meta", "Quest 3", "console", ["quest 3", "oculus"], 28900, 0.5, 1.06),
  item("ipad-mini-6", "iPad mini 6 64GB", "Apple", "iPad mini 6", "tablet", ["ipad mini"], 27900, 0.46, 0.98),
];

function item(
  id: string,
  name: string,
  brand: string,
  model: string,
  category: Category,
  aliases: string[],
  fairCents: number,
  instantPct: number,
  demand: number,
): CatalogItem {
  return { id, slug: id, name, brand, model, category, aliases, fairCents, instantPct, demand };
}

export const CATEGORY_FAIR: Record<Category, number> = {
  phone: 24000,
  tablet: 28000,
  laptop: 52000,
  headphones: 12000,
  console: 24000,
  camera: 36000,
  watch: 16000,
  sneakers: 11000,
  lego: 18000,
  kitchen: 9000,
  vacuum: 18000,
  bike: 42000,
  speaker: 12000,
  gpu: 28000,
  monitor: 28000,
  other: 8000,
};

export function catalogById(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}

export function catalogBySlug(slug: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.slug === slug);
}

export function searchCatalog(query: string, limit = 8): CatalogItem[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];
  const tokens = q.split(" ").filter(Boolean);
  const scored = CATALOG.map((item) => {
    const hay = normalizeQuery(
      [item.name, item.brand, item.model, item.slug, ...item.aliases].join(" "),
    );
    let score = 0;
    if (hay.includes(q)) score += 12;
    for (const t of tokens) {
      if (hay.includes(t)) score += 4;
    }
    if (normalizeQuery(item.model) === q) score += 10;
    return { item, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  return scored.slice(0, limit).map((s) => s.item);
}

export function matchIdentified(input: {
  brand?: string;
  model?: string;
  name?: string;
  category?: string;
}): CatalogItem | undefined {
  const q = [input.brand, input.model, input.name].filter(Boolean).join(" ");
  const hits = searchCatalog(q, 3);
  return hits[0];
}
