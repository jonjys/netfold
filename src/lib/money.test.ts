import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COPY } from "./copy.ts";
import { catalogById } from "./catalog.ts";
import {
  buildExtractKit,
  buildPublicProof,
  dayAnchor,
  DEMO_PROOF_TOKEN,
  proofHref,
  sellBy,
} from "./listings.ts";
import { formatMoney, sekToUsdCents } from "./money.ts";
import { priceItem } from "./pricing.ts";
import { formatSkuPrice, SKUS } from "./skus.ts";

describe("copy keys", () => {
  it("en and sv expose the same keys", () => {
    assert.deepEqual(Object.keys(COPY.en).sort(), Object.keys(COPY.sv).sort());
  });

  it("keeps Swedish on Blocket/Swappie and English on Marketplace/trade-in", () => {
    assert.match(COPY.sv.homeKicker, /Blocket/);
    assert.match(COPY.sv.sampleChannel, /Blocket/);
    assert.match(COPY.sv.sampleThen, /Swappie/);
    assert.match(COPY.sv.vsHeadline, /Swappie/);
    assert.match(COPY.sv.sampleCta, /Skriv min/);
    assert.equal(COPY.sv.homeKicker.includes("Marketplace"), false);
    assert.equal(COPY.sv.sampleThen.includes("trade-in"), false);
    assert.equal(COPY.sv.sampleCta.includes("$"), false);

    assert.match(COPY.en.homeKicker, /Marketplace/);
    assert.match(COPY.en.sampleChannel, /Marketplace/);
    assert.match(COPY.en.sampleThen, /trade-in/);
    assert.match(COPY.en.vsHeadline, /trade-in/);
    assert.match(COPY.en.sampleCta, /Write mine/);
    assert.equal(COPY.en.homeKicker.includes("Blocket"), false);
    assert.equal(COPY.en.sampleThen.includes("Swappie"), false);
    assert.equal(COPY.en.sampleCta.includes("kr"), false);
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
  it("writes a 72-hour Blocket sell plan with buyer proof, not a quote", () => {
    const catalog = catalogById("iphone-14-pro-max");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const firm = formatMoney(priced.acceptCents, "sv");
    const now = new Date("2026-09-01T15:00:00Z");
    const proof = proofHref("demo");
    const sv = buildExtractKit(priced, "sv", { proofUrl: proof, now });
    const en = buildExtractKit(priced, "en", { now });
    assert.equal(sv.listings[0].channelId, "local");
    assert.match(sv.listings[0].title, /ej bud/i);
    assert.match(sv.listings[0].title, new RegExp(firm.replace(/\s/g, "\\s")));
    assert.match(sv.listings[0].body, /Fast pris/);
    assert.match(sv.listings[0].body, /Swappie/);
    assert.match(sv.listings[0].body, /Köparbevis/);
    assert.match(sv.listings[0].body, /\/b\/demo/);
    assert.match(sv.lowballReply, /Swappie/);
    assert.ok(sv.deadlineLabel.length > 3);
    assert.equal(en.listings[0].channelId, "facebook");
    assert.match(en.listings[0].body, /Firm/);
    assert.match(en.listings[0].body, /No offers/);
    assert.equal(sv.lowballReply.includes("$"), false);
    assert.equal(sellBy(now).toISOString(), "2026-09-04T15:00:00.000Z");
  });

  it("freezes the deadline to the scan clock, not the page load", () => {
    const catalog = catalogById("iphone-14-pro-max");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const a = buildExtractKit(priced, "sv", { now: new Date("2026-01-01T00:00:00Z") });
    const b = buildExtractKit(priced, "sv", { now: new Date("2026-01-01T00:00:00Z") });
    assert.equal(a.deadlineLabel, b.deadlineLabel);
    const later = buildExtractKit(priced, "sv", { now: new Date("2026-06-01T00:00:00Z") });
    assert.notEqual(a.deadlineLabel, later.deadlineLabel);
  });
});

describe("buyer proof", () => {
  it("publishes firm price and Swappie floor, not walk/ask", () => {
    const catalog = catalogById("iphone-14-pro-max");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const created = new Date("2026-09-01T12:00:00Z");
    const proof = buildPublicProof(priced, created, DEMO_PROOF_TOKEN);
    assert.equal(proof.token, "demo");
    assert.equal(proof.firmCents, priced.acceptCents);
    assert.ok(proof.swappieCents < proof.firmCents);
    assert.equal(proof.deadlineISO, sellBy(created).toISOString());
    assert.equal(proofHref("abc"), "https://www.netfold.site/b/abc");
    assert.ok(dayAnchor(created).toISOString().endsWith("T06:00:00.000Z"));
    assert.equal("askCents" in proof, false);
    assert.equal("walkCents" in proof, false);
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
