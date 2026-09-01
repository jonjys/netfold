import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COPY } from "./copy.ts";
import { catalogById } from "./catalog.ts";
import { buildExtractKit } from "./listings.ts";
import { formatMoney, sekToUsdCents } from "./money.ts";
import { priceItem } from "./pricing.ts";
import { formatSkuPrice, SKUS } from "./skus.ts";

describe("copy keys", () => {
  it("en and sv expose the same keys", () => {
    assert.deepEqual(Object.keys(COPY.en).sort(), Object.keys(COPY.sv).sort());
  });
});

describe("formatMoney", () => {
  it("prints kronor on Swedish and dollars on English", () => {
    const ore = 1_013_900;
    const sv = formatMoney(ore, "sv");
    const en = formatMoney(ore, "en");
    assert.match(sv, /kr/i);
    assert.equal(sv.includes("$"), false);
    assert.match(en, /\$/);
    assert.equal(en.toLowerCase().includes("kr"), false);
    assert.equal(sekToUsdCents(ore), Math.round(ore / 10.5));
  });
});

describe("sku prices", () => {
  it("charges 29 kr / $2.99 for the listing", () => {
    assert.equal(SKUS.report.amountCents, 2900);
    assert.equal(SKUS.report.usdCents, 299);
    assert.equal(SKUS.report.includesKit, true);
    assert.match(formatSkuPrice("report", "sv"), /29/);
    assert.match(formatSkuPrice("report", "en"), /2\.99/);
  });
});

describe("listing kit", () => {
  it("writes a Blocket ad in Swedish and a Marketplace ad in English", () => {
    const catalog = catalogById("iphone-16-128");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const sv = buildExtractKit(priced, "sv");
    const en = buildExtractKit(priced, "en");
    assert.equal(sv.listings[0].channelId, "local");
    assert.match(sv.listings[0].body, /Hämtas/);
    assert.match(sv.listings[0].title, /kr/i);
    assert.equal(en.listings[0].channelId, "facebook");
    assert.match(en.listings[0].body, /Pickup/);
    assert.match(en.listings[0].title, /\$/);
    assert.equal(sv.lowballReply.includes("$"), false);
    assert.match(en.lowballReply, /\$/);
  });
});

describe("swappie vs blocket", () => {
  it("leaves a few thousand kronor on a 14 Pro Max", () => {
    const catalog = catalogById("iphone-14-pro-max");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const blocket = priced.quotes.find((q) => q.channelId === "local");
    const swappie = priced.quotes.find((q) => q.channelId === "instant");
    assert.ok(blocket);
    assert.ok(swappie);
    assert.ok(blocket.takeHomeCents > 400_000);
    assert.ok(swappie.takeHomeCents < 180_000);
    assert.ok(priced.trappedVsInstantCents > 250_000);
  });
});
