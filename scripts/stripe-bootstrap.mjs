#!/usr/bin/env node
/**
 * Creates Netfold's three one-time products on whatever Stripe account
 * STRIPE_SECRET_KEY points at. Idempotent via metadata.sku.
 */
const SECRET = process.env.STRIPE_SECRET_KEY?.trim();
if (!SECRET) {
  console.error("Set STRIPE_SECRET_KEY");
  process.exit(1);
}

const SKUS = [
  {
    sku: "report",
    name: "Netfold Report",
    description: "Unlock exact take-home, ask/accept and ranked channels.",
    cents: 249,
  },
  {
    sku: "extract",
    name: "Netfold Extract kit",
    description: "Report plus listing copy, titles and a lowball reply.",
    cents: 690,
  },
  {
    sku: "pack",
    name: "Netfold 5-pack",
    description: "Five extract kits for a drawer, a move or a closet.",
    cents: 990,
  },
];

async function stripe(path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${path}: ${json.error?.message ?? res.status}`);
  }
  return json;
}

async function listBySku(sku) {
  const res = await fetch(
    `https://api.stripe.com/v1/products/search?query=${encodeURIComponent(`metadata['sku']:'${sku}'`)}`,
    { headers: { Authorization: `Bearer ${SECRET}` } },
  );
  const json = await res.json();
  if (!res.ok) return null;
  return json.data?.[0] ?? null;
}

const prices = {};
for (const item of SKUS) {
  let product = await listBySku(item.sku);
  if (!product) {
    product = await stripe("products", {
      name: item.name,
      description: item.description,
      "metadata[sku]": item.sku,
      "metadata[app]": "netfold",
    });
    console.log(`product ${item.sku} ${product.id}`);
  } else {
    console.log(`product ${item.sku} exists ${product.id}`);
  }

  const existingPrice =
    product.default_price && typeof product.default_price === "string"
      ? product.default_price
      : null;

  let priceId = existingPrice;
  if (!priceId) {
    const price = await stripe("prices", {
      product: product.id,
      currency: "eur",
      unit_amount: String(item.cents),
      "metadata[sku]": item.sku,
    });
    priceId = price.id;
    await stripe(`products/${product.id}`, { default_price: priceId });
    console.log(`price ${item.sku} ${priceId}`);
  } else {
    console.log(`price ${item.sku} exists ${priceId}`);
  }
  prices[item.sku] = priceId;
}

console.log("\nAdd these in Vercel → netfold → Environment Variables (Production):");
console.log(`STRIPE_PRICE_REPORT=${prices.report}`);
console.log(`STRIPE_PRICE_EXTRACT=${prices.extract}`);
console.log(`STRIPE_PRICE_PACK=${prices.pack}`);
