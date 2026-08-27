# Netfold

See what you'll actually pocket.

Netfold is a take-home extractor for unused goods. Photo or model name in. Net proceeds by channel out. Pay to unlock the exact numbers and the listing kit. No marketplace. No inventory. No owner in the loop.

Live product (this app) is the business.

## Why this, not another price app

Everyone else quotes a sold-comp vanity number. Netfold ranks **what you keep after fees, haircuts and time**, then sells the extraction (copy, ask/accept, lowball replies). The public index (`/market`, `/i/:slug`) is the distribution engine.

## Money pipe

| SKU | Price | What happens |
|---|---|---|
| Report | €2.49 | Unlock exact take-home + ranked channels |
| Extract kit | €6.90 | Report + listing copy for local / Facebook / Vinted / eBay |
| 5-extract pack | €9.90 | Five kits. Credits sit on a browser wallet token |

Stripe products (live, NETFOLD account `acct_1U96jtIz5w9JsopQ`):

- Report €2.49 → `price_1U96y2Iz5w9JsopQXAKOsPBq`
- Extract kit €6.90 → `price_1U96y4Iz5w9JsopQ41vSjS56`
- 5-pack €9.90 → `price_1U96y6Iz5w9JsopQ1lkArRXH`

Without `STRIPE_SECRET_KEY` the app still fulfils in **preview mode** so the machine can be walked end-to-end. Preview payments are labelled `provider=preview` and are not real charges.

## Economics (EUR)

Assume mix 60% report / 30% extract / 10% pack → ~€4.20 average.

| Volume / month | Revenue | Stripe ~ | AI (if every scan is a photo) | Gross |
|---|---|---|---|---|
| 10 | €42 | €4 | €0.40 | ~€37 |
| 100 | €420 | €22 | €4 | ~€394 |
| 1,000 | €4,200 | €145 | €40 | ~€4.0k |
| 10,000 | €42,000 | €1.3k | €400 | ~€40k |
| 100,000 | €420,000 | €12k | €4k | ~€404k |

Search-only scans cost ~€0 AI. Photo scans are capped (8 / wallet / day) and cached as scan rows.

Break-even: 1 paid transaction.

## Automation

1. Identify (catalog search or xAI vision)
2. Price (deterministic fee tables)
3. Pay (Stripe Checkout)
4. Fulfil (webhook + success URL, idempotent)
5. Share (public scan + index pages)
6. Repeat (pack credits)

Owner work: glance at `/ops`. Target 0–15 min/week.

## Stack

TanStack Start · React 19 · Tailwind v4 · Postgres (Neon in prod, PGLite in preview) · Stripe Checkout · xAI vision · Vercel.

Auth is off on purpose. Purchase is a scan token + a wallet token in `localStorage`. No accounts, no PII tables.

## Environment

Do not put secrets in the repo. The platform injects `DATABASE_URL` and `XAI_API_KEY`. Add these on the host for live charges:

| Variable | Required for | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Live checkout | Skips to preview fulfilment when absent |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | Signature verification |
| `STRIPE_PRICE_REPORT` | Override | Defaults to the live price above |
| `STRIPE_PRICE_EXTRACT` | Override | |
| `STRIPE_PRICE_PACK` | Override | |
| `ADMIN_TOKEN` | Lock `/ops` | Open in preview when unset |
| `XAI_API_KEY` | Photo ID | Search still works without it |
| `RESEND_API_KEY` | Optional receipts | Status only on `/ops` |
| `DATABASE_URL` | Production DB | Injected on deploy |

Webhook URL: `https://<host>/api/webhooks/stripe`  
Health: `GET /api/health`

## Routes

- `/` extractor
- `/s/:token` scan + paywall
- `/i/:slug` public item
- `/market` index
- `/check` buyer ask-check
- `/paid` checkout return
- `/ops` revenue machine
- `/terms` `/privacy` `/refund` `/contact`

## Repo

https://github.com/jonjys/netfold
