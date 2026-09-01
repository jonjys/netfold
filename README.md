# Netfold

**Live: [www.netfold.site](https://www.netfold.site)**

Såld innan helgen. Annars Swappie.

Inte PriceRunner. Netfold skriver en **72-timmars Blocket-annons**: fast pris, inga bud, köparbevis och ett klockslag då du tar Swappie istället.

Svenska UI = kronor. English UI = dollar. Inget konto. Gästcheckout via Stripe.

## Länkar

| Vad | URL |
|---|---|
| Produkt | [www.netfold.site](https://www.netfold.site) |
| Köparbevis | [www.netfold.site/b/demo](https://www.netfold.site/b/demo) |
| Swappie vs Blocket | [www.netfold.site/swappie-vs-blocket](https://www.netfold.site/swappie-vs-blocket) |
| iPhone-värde | [www.netfold.site/iphone-varde](https://www.netfold.site/iphone-varde) |
| Prisindex | [www.netfold.site/market](https://www.netfold.site/market) |
| Repo | [github.com/jonjys/netfold](https://github.com/jonjys/netfold) |

## Vad 29 kr ger

1. Fast Blocket-titel och brödtext (ej bud, hämtas i veckan)
2. Svar som dödar låga bud
3. Publik köparbevis-länk `/b/{token}`
4. Deadline 72 timmar. Efter det: Swappie

Siffran är gratis. Annonsen är produkten.

## Priser

SEK default. USD när språket är English.

| SKU | SEK | USD |
|---|---|---|
| 72-timmarsannons | 29 kr | $2.99 |
| Extra kit | 79 kr | $7.99 |
| 5-pack | 99 kr | $9.99 |

## Routes

- `/` — säljplanen
- `/s/:token` — scan + paywall
- `/b/:token` — köparbevis (`/b/demo` alltid öppet)
- `/i/:slug` — prylsida
- `/market` — index
- `/check` — kolla utrop
- `/swappie-vs-blocket` `/iphone-varde`
- `/paid` — Stripe return
- `/ops` — maskinen
- `/terms` `/privacy` `/refund` `/contact`
- Webhook: `https://www.netfold.site/api/webhooks/stripe`

## Stack

TanStack Start · React 19 · Tailwind v4 · Postgres · Stripe Checkout · xAI vision · Vercel.

Auth av. Köp = scan-token + plånbok i `localStorage`.

## Inte det här

- Inte Skrivklart — [jonjys/skrivklart](https://github.com/jonjys/skrivklart)
- Inte `netfold-six.vercel.app` — live är **www.netfold.site**
