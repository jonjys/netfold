# Netfold

**Live:** [https://www.netfold.site](https://www.netfold.site)

Såld innan helgen. Annars Swappie.

Inte PriceRunner. Netfold skriver en **72-timmars Blocket-annons**: fast pris, inga bud, köparbevis och ett klockslag då du tar Swappie istället.

Svenska UI = kronor. English UI = dollar. Inget konto. Gästcheckout via Stripe.

## Länkar

| Vad | URL |
|---|---|
| Produkt | [www.netfold.site](https://www.netfold.site) |
| Köparbevis (demo) | [www.netfold.site/b/demo](https://www.netfold.site/b/demo) |
| Swappie vs Blocket | [www.netfold.site/swappie-vs-blocket](https://www.netfold.site/swappie-vs-blocket) |
| iPhone-värde | [www.netfold.site/iphone-varde](https://www.netfold.site/iphone-varde) |
| Prisindex | [www.netfold.site/market](https://www.netfold.site/market) |
| Repo | [github.com/jonjys/netfold](https://github.com/jonjys/netfold) |

## Vad 29 kr ger

1. Fast Blocket-titel och brödtext (ej bud, hämtas i veckan)
2. Svar som dödar låga bud
3. En publik köparbevis-länk `/b/{token}` som klistras in i annonsen
4. Deadline 72 timmar. Efter det: Swappie

Siffran är gratis. Annonsen är produkten.

## Priser

Stripe-konto `acct_1U96jtIz5w9JsopQ`. SEK default, USD när språket är English.

| SKU | SEK | USD | Stripe SEK | Stripe USD |
|---|---|---|---|---|
| 72-timmarsannons | 29 kr | $2.99 | `price_1U9kH8Iz5w9JsopQUiPrlTHW` | `price_1UATDdIz5w9JsopQ2zaE5how` |
| Extra kit | 79 kr | $7.99 | `price_1U9kH9Iz5w9JsopQI1otqjGu` | `price_1UATDeIz5w9JsopQwD2ERcwV` |
| 5-pack | 99 kr | $9.99 | `price_1U9kHAIz5w9JsopQ1mK4iDfX` | `price_1UATDfIz5w9JsopQnPnjYLUm` |

Utan `STRIPE_SECRET_KEY` går checkout i preview-läge (ingen riktig debitering).

## Routes

- `/` — säljplanen
- `/s/:token` — scan + paywall
- `/b/:token` — köparbevis (publikt efter upplåsning, `/b/demo` alltid)
- `/i/:slug` — publik prylsida
- `/market` — index
- `/check` — kolla utrop
- `/swappie-vs-blocket` `/iphone-varde`
- `/paid` — Stripe return
- `/ops` — maskinen
- `/terms` `/privacy` `/refund` `/contact`
- Webhook: `https://www.netfold.site/api/webhooks/stripe`
- Health: `GET /api/health`

## Stack

TanStack Start · React 19 · Tailwind v4 · Postgres (Neon i prod) · Stripe Checkout · xAI vision · Vercel.

Auth är av. Köp = scan-token + plånbok i `localStorage`.

## Environment

Inga secrets i repot.

| Variable | Krävs för | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Live checkout | Preview-fulfilment utan den |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | Signatur |
| `STRIPE_PRICE_REPORT` | Override | Default: SEK-priset ovan |
| `STRIPE_PRICE_EXTRACT` | Override | |
| `STRIPE_PRICE_PACK` | Override | |
| `ADMIN_TOKEN` | Lås `/ops` | Öppen i preview utan den |
| `XAI_API_KEY` | Foto-ID | Sök funkar utan |
| `DATABASE_URL` | Prod-databas | Neon |

## Inte det här

- Inte Klartext / Skrivklart — annat repo: [jonjys/klartext](https://github.com/jonjys/klartext)
- Inte GateZero — annat repo: [jonjys/gatekeeper](https://github.com/jonjys/gatekeeper)
- Inte `netfold-six.vercel.app` — gammal preview. Live är **www.netfold.site**
