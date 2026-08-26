import type { PricedItem } from "./pricing.ts";
import { CONDITION_LABEL } from "./pricing.ts";
import { formatEuro } from "./money.ts";

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

export function buildExtractKit(item: PricedItem): ExtractKit {
  const cond = CONDITION_LABEL[item.condition].toLowerCase();
  const ask = formatEuro(item.askCents);
  const accept = formatEuro(item.acceptCents);
  const best = item.quotes[0];

  const localBody = [
    `${item.name} in ${cond} condition.`,
    item.brand ? `Brand: ${item.brand}.` : "",
    `Priced to actually sell at ${ask}. Firm around ${accept}.`,
    "Pickup preferred. Smoke-free. Tested and working.",
    "Time-wasters skipped \u2014 please message only if you can pick up this week.",
  ]
    .filter(Boolean)
    .join(" ");

  const vintedBody = `${item.name}, ${cond}. Complete as pictured. Ships fast. Asking ${ask}.`;

  const ebayBody = [
    `Used ${item.name} \u2014 ${cond}.`,
    "Inspected before listing. See photos for exact cosmetic state.",
    "Dispatched within 1 business day. No returns on used electronics unless not as described.",
  ].join(" ");

  const listings: ListingKit[] = [
    {
      channelId: "local",
      title: `${item.name} \u2014 ${CONDITION_LABEL[item.condition]} \u2014 ${ask}`,
      body: localBody,
      tags: [item.category, item.brand, "pickup"].filter(Boolean),
    },
    {
      channelId: "facebook",
      title: `${item.name} (${CONDITION_LABEL[item.condition]}) ${ask}`,
      body: localBody,
      tags: [item.category, "marketplace"],
    },
    {
      channelId: "vinted",
      title: `${item.brand ? item.brand + " " : ""}${item.model || item.name}`.slice(0, 70),
      body: vintedBody,
      tags: [item.brand, item.model, item.category].filter(Boolean),
    },
    {
      channelId: "ebay",
      title: `${item.name} ${CONDITION_LABEL[item.condition]} used`.slice(0, 80),
      body: ebayBody,
      tags: [item.brand, item.model, "used"].filter(Boolean),
    },
  ];

  return {
    itemName: item.name,
    listings,
    firstMessage: `Still available. ${ask}, ${cond}. Pickup this week works. I will not hold without a time.`,
    lowballReply: `Thanks. I already priced this against current sold comps. I can do ${accept}. Below that I keep it.`,
    holdMessage: `I can hold it until tomorrow evening at ${accept}. After that it goes back up.`,
    acceptLine: `Best net channel is ${best.short} at ${formatEuro(best.takeHomeCents)} in about ${best.daysToSold} days. Instant cash leaves ${formatEuro(item.trappedVsInstantCents)} on the table.`,
  };
}

export function buildAllKits(items: PricedItem[]): ExtractKit[] {
  return items.map(buildExtractKit);
}
