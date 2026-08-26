import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogById } from "./catalog.ts";
import { priceItem, blurRange } from "./pricing.ts";

describe("priceItem", () => {
  it("ranks instant cash below local/vinted take-home for headphones", () => {
    const catalog = catalogById("sony-xm5");
    assert.ok(catalog);
    const priced = priceItem({ catalog, condition: "good" });
    const instant = priced.quotes.find((q) => q.channelId === "instant");
    assert.ok(instant);
    assert.equal(priced.quotes[0].channelId === "instant", false);
    assert.ok(priced.bestTakeHomeCents > instant.takeHomeCents);
    assert.ok(priced.trappedVsInstantCents > 0);
    assert.ok(priced.askCents > priced.acceptCents);
  });

  it("applies condition haircuts", () => {
    const catalog = catalogById("iphone-13-128");
    assert.ok(catalog);
    const good = priceItem({ catalog, condition: "good" });
    const poor = priceItem({ catalog, condition: "poor" });
    assert.ok(poor.bestTakeHomeCents < good.bestTakeHomeCents);
  });

  it("blurs exact numbers for teasers", () => {
    const range = blurRange(18000);
    assert.ok(range.low < 18000);
    assert.ok(range.high > 18000);
  });
});
