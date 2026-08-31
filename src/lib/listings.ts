import type { Lang } from "./copy.ts";
import type { PricedItem } from "./pricing.ts";
import { formatMoney } from "./money.ts";

export type ListingKit = {
  channelId: string;
  title: string;
  body: string;
  tags: string[];
};

export type ExtractKit = {
  itemName: string;
  listings: ListingKit[];
  firstMessage: string;
  lowballReply: string;
  holdMessage: string;
  acceptLine: string;
};

const COND_SV: Record<string, string> = {
  like_new: "som ny",
  good: "bra skick",
  fair: "ok skick",
  poor: "sliten",
};

const COND_EN: Record<string, string> = {
  like_new: "like new",
  good: "good condition",
  fair: "fair condition",
  poor: "worn",
};

function buildSv(item: PricedItem): ExtractKit {
  const cond = COND_SV[item.condition] ?? "bra skick";
  const ask = formatMoney(item.askCents, "sv");
  const accept = formatMoney(item.acceptCents, "sv");
  const best = item.quotes[0];

  const blocketBody = [
    `${item.name} i ${cond}.`,
    item.brand ? `Märke: ${item.brand}.` : "",
    `Prissatt för att sälja: ${ask}. Jag kan mötas kring ${accept}.`,
    "Hämtas. Rökfritt. Testad och fungerar.",
    "Skriv bara om du kan hämta den här veckan.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    itemName: item.name,
    listings: [
      {
        channelId: "local",
        title: `${item.name} — ${cond} — ${ask}`,
        body: blocketBody,
        tags: [item.category, item.brand, "blocket"].filter(Boolean),
      },
      {
        channelId: "facebook",
        title: `${item.name} (${cond}) ${ask}`,
        body: `${item.name} i ${cond}. ${ask}. Hämtas den här veckan.`,
        tags: [item.category, "marketplace"],
      },
      {
        channelId: "vinted",
        title: `${item.brand ? item.brand + " " : ""}${item.model || item.name}`.slice(0, 70),
        body: `${item.name}, ${cond}. Utrop ${ask}.`,
        tags: [item.brand, item.model, item.category].filter(Boolean),
      },
      {
        channelId: "ebay",
        title: `${item.name} ${cond} begagnad`.slice(0, 80),
        body: `Begagnad ${item.name} — ${cond}. Kollad. Skickas inom 1 arbetsdag.`,
        tags: [item.brand, item.model, "begagnad"].filter(Boolean),
      },
    ],
    firstMessage: `Finns kvar. ${ask}, ${cond}. Hämtning den här veckan går bra. Jag håller den inte utan tid.`,
    lowballReply: `Tack. Jag har redan räknat mot sålda priser. Jag kan göra ${accept}. Under det behåller jag den.`,
    holdMessage: `Jag kan hålla den till imorgon kväll för ${accept}. Sen går den upp igen.`,
    acceptLine: `Bäst netto: ${best.short} ${formatMoney(best.takeHomeCents, "sv")} på ca ${best.daysToSold} dagar. Direktköp lämnar ${formatMoney(item.trappedVsInstantCents, "sv")} på bordet.`,
  };
}

function buildEn(item: PricedItem): ExtractKit {
  const cond = COND_EN[item.condition] ?? "good condition";
  const ask = formatMoney(item.askCents, "en");
  const accept = formatMoney(item.acceptCents, "en");
  const best = item.quotes[0];

  const marketBody = [
    `${item.name} in ${cond}.`,
    item.brand ? `Brand: ${item.brand}.` : "",
    `Priced to sell at ${ask}. I can meet around ${accept}.`,
    "Pickup. Smoke-free. Tested and working.",
    "Message only if you can collect this week.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    itemName: item.name,
    listings: [
      {
        channelId: "facebook",
        title: `${item.name} (${cond}) ${ask}`,
        body: marketBody,
        tags: [item.category, "marketplace"],
      },
      {
        channelId: "local",
        title: `${item.name} — ${cond} — ${ask}`,
        body: `${item.name} in ${cond}. Asking ${ask}, firm around ${accept}. Local pickup this week.`,
        tags: [item.category, item.brand, "local"].filter(Boolean),
      },
      {
        channelId: "vinted",
        title: `${item.brand ? item.brand + " " : ""}${item.model || item.name}`.slice(0, 70),
        body: `${item.name}, ${cond}. Asking ${ask}.`,
        tags: [item.brand, item.model, item.category].filter(Boolean),
      },
      {
        channelId: "ebay",
        title: `${item.name} ${cond} used`.slice(0, 80),
        body: `Used ${item.name} — ${cond}. Inspected. Ships in 1 business day.`,
        tags: [item.brand, item.model, "used"].filter(Boolean),
      },
    ],
    firstMessage: `Still available. ${ask}, ${cond}. Pickup this week is fine. I will not hold it without a time.`,
    lowballReply: `Thanks. I already priced this against sold comps. I can do ${accept}. Below that I keep it.`,
    holdMessage: `I can hold it until tomorrow evening for ${accept}. Then it goes back up.`,
    acceptLine: `Best net: ${best.short} ${formatMoney(best.takeHomeCents, "en")} in about ${best.daysToSold} days. Cash-now leaves ${formatMoney(item.trappedVsInstantCents, "en")} on the table.`,
  };
}

export function buildExtractKit(item: PricedItem, lang: Lang = "sv"): ExtractKit {
  return lang === "en" ? buildEn(item) : buildSv(item);
}

export function buildAllKits(items: PricedItem[], lang: Lang = "sv"): ExtractKit[] {
  return items.map((item) => buildExtractKit(item, lang));
}

export function lockedAdPreview(name: string, lang: Lang): { title: string; body: string } {
  if (lang === "en") {
    return {
      title: `${name} — good condition`,
      body: `${name} in good condition. Priced to sell. Pickup this week. Smoke-free. Tested and working. Message only if you can collect this week.`,
    };
  }
  return {
    title: `${name} — bra skick`,
    body: `${name} i bra skick. Prissatt för att sälja. Hämtas. Rökfritt. Testad och fungerar. Skriv bara om du kan hämta den här veckan.`,
  };
}
