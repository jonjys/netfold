import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { cookieHasConsent } from "@/lib/consent";
import { buildAllKits } from "@/lib/listings";
import { SKUS, STRIPE_PRICE_DEFAULT, type SkuId } from "@/lib/skus";
import { newId } from "@/lib/utils";
import { loadScan, saveScan } from "./scan";
import { recordPurchase } from "./accounts";

function stripeSecret(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key || undefined;
}

function priceId(sku: SkuId): string {
  return STRIPE_PRICE_DEFAULT[sku];
}

function publicOrigin(): string {
  try {
    const req = getRequest();
    const url = new URL(req.url);
    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "0.0.0.0"
    ) {
      return `http://${url.host}`;
    }
    if (url.protocol === "http:" || url.protocol === "https:") {
      const proto =
        getRequestHeader("x-forwarded-proto") ?? url.protocol.replace(":", "");
      const host = getRequestHeader("x-forwarded-host") ?? url.host;
      return `${proto}://${host}`;
    }
  } catch {
    /* fall through */
  }
  const proto = getRequestHeader("x-forwarded-proto") ?? "http";
  const host =
    getRequestHeader("x-forwarded-host") ?? getRequestHeader("host") ?? "127.0.0.1:8080";
  return `${proto}://${host}`;
}

export async function fulfillOrder(input: {
  provider: string;
  providerId: string;
  sku: SkuId;
  amountCents: number;
  scanToken?: string | null;
  walletToken?: string | null;
  userId?: string | null;
}): Promise<void> {
  const sql = await getSql();
  const existing = await sql<{ id: string }>`
    select id from payments where provider_id = ${input.providerId} limit 1`;
  if (existing[0]) return;

  const paymentId = newId();
  await sql`insert into payments (
      id, provider, provider_id, sku, amount_cents, currency, status, scan_token, wallet_token, user_id
    ) values (
      ${paymentId}, ${input.provider}, ${input.providerId}, ${input.sku},
      ${input.amountCents}, ${"sek"}, ${"paid"}, ${input.scanToken ?? null}, ${input.walletToken ?? null},
      ${input.userId ?? null}
    )`;
  await sql`insert into ledger (id, entry_type, amount_cents, payment_id, scan_token, note)
    values (${newId()}, ${"revenue"}, ${input.amountCents}, ${paymentId}, ${input.scanToken ?? null}, ${input.sku})`;

  if (input.userId) {
    await recordPurchase({
      userId: input.userId,
      sku: input.sku,
      productId: `netfold_${input.sku}`,
      scanToken: input.scanToken,
      stripeSessionId: input.providerId,
      amountCents: input.amountCents,
    });
    if (input.scanToken) {
      await sql`update scans set user_id = ${input.userId} where token = ${input.scanToken} and user_id is null`;
    }
  }

  const sku = SKUS[input.sku];
  if (sku.credits > 0 && input.walletToken) {
    await sql`insert into wallets (token, credits) values (${input.walletToken}, ${0})
      on conflict (token) do nothing`;
    await sql`update wallets set credits = credits + ${sku.credits} where token = ${input.walletToken}`;
  }

  if (input.scanToken) {
    const full = await loadScan(input.scanToken);
    if (full) {
      full.unlocked = true;
      if (sku.includesKit) {
        full.hasKit = true;
        full.kits = buildAllKits(full.items);
        if (sku.credits > 0 && input.walletToken) {
          await sql`update wallets set credits = credits - 1
            where token = ${input.walletToken} and credits > 0`;
        }
      }
      await saveScan(full);
    }
  }

  await sql`insert into events (id, name, scan_token, sku)
    values (${newId()}, ${"payment_paid"}, ${input.scanToken ?? null}, ${input.sku})`;
}

export const startCheckout = createServerFn({ method: "POST" })
  .validator(
    z.object({
      sku: z.enum(["report", "extract", "pack"]),
      wallet: z.string().min(16).max(80),
      scanToken: z.string().min(8).max(80).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    if (!cookieHasConsent(getRequestHeader("cookie"))) {
      throw new Error("Cookies required");
    }
    const sku = SKUS[data.sku];
    const secret = stripeSecret();
    const origin = publicOrigin();
    const success =
      `${origin}/paid?sku=${data.sku}` +
      (data.scanToken ? `&token=${data.scanToken}` : "");

    if (!secret) {
      const previewId = `preview_${newId()}`;
      await fulfillOrder({
        provider: "preview",
        providerId: previewId,
        sku: data.sku,
        amountCents: sku.amountCents,
        scanToken: data.scanToken,
        walletToken: data.wallet,
      });
      const previewPath =
        `/paid?sku=${data.sku}` +
        (data.scanToken ? `&token=${data.scanToken}` : "") +
        `&preview=1`;
      return {
        url: previewPath,
        preview: true as const,
      };
    }

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", `${success}&session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", data.scanToken ? `${origin}/s/${data.scanToken}` : origin);
    params.set("line_items[0][price]", priceId(data.sku));
    params.set("line_items[0][quantity]", "1");
    params.set("metadata[sku]", data.sku);
    params.set("metadata[wallet]", data.wallet);
    if (data.scanToken) params.set("metadata[scan_token]", data.scanToken);
    params.set("allow_promotion_codes", "false");
    params.set("billing_address_collection", "auto");
    params.set("locale", "sv");

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    if (!res.ok) {
      throw new Error(`Checkout failed (${res.status}).`);
    }
    const session = (await res.json()) as { url?: string };
    if (!session.url) throw new Error("Checkout did not return a URL.");
    return { url: session.url, preview: false as const };
  });

export const confirmSession = createServerFn({ method: "POST" })
  .validator(
    z.object({
      sessionId: z.string().max(200).optional(),
      preview: z.boolean().optional(),
      sku: z.enum(["report", "extract", "pack"]).optional(),
      token: z.string().max(80).optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (data.preview) {
      return { ok: true as const, token: data.token ?? null, sku: data.sku ?? null };
    }
    const secret = stripeSecret();
    if (!secret || !data.sessionId) {
      return { ok: true as const, token: data.token ?? null, sku: data.sku ?? null };
    }
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(data.sessionId)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    if (!res.ok) return { ok: false as const };
    const session = (await res.json()) as {
      id: string;
      payment_status?: string;
      amount_total?: number;
      metadata?: { sku?: string; wallet?: string; scan_token?: string; user_id?: string };
    };
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return { ok: false as const };
    }
    const sku = (session.metadata?.sku ?? data.sku) as SkuId | undefined;
    if (!sku || !(sku in SKUS)) return { ok: false as const };
    await fulfillOrder({
      provider: "stripe",
      providerId: session.id,
      sku,
      amountCents: session.amount_total ?? SKUS[sku].amountCents,
      scanToken: session.metadata?.scan_token ?? data.token,
      walletToken: session.metadata?.wallet,
      userId: session.metadata?.user_id ?? null,
    });
    return {
      ok: true as const,
      token: session.metadata?.scan_token ?? data.token ?? null,
      sku,
    };
  });

export { stripeSecret };
