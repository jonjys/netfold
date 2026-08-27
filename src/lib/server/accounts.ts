import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/utils";

export async function ensureAccount(userId: string, email: string | null, name?: string | null) {
  const sql = await getSql();
  await sql`
    insert into accounts (user_id, email, name)
    values (${userId}, ${email}, ${name ?? null})
    on conflict (user_id) do update set
      email = coalesce(excluded.email, accounts.email),
      name = coalesce(excluded.name, accounts.name),
      updated_at = now()`;
}

export async function ensureStripeCustomer(userId: string, email: string | null): Promise<string | null> {
  await ensureAccount(userId, email);
  const sql = await getSql();
  const existing = await sql<{ stripe_customer_id: string | null }>`
    select stripe_customer_id from accounts where user_id = ${userId} limit 1`;
  if (existing[0]?.stripe_customer_id) return existing[0].stripe_customer_id;

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) return null;

  const params = new URLSearchParams();
  if (email) params.set("email", email);
  params.set("metadata[user_id]", userId);
  const res = await fetch("https://api.stripe.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  if (!res.ok) return null;
  const customer = (await res.json()) as { id?: string };
  if (!customer.id) return null;
  await sql`
    update accounts
    set stripe_customer_id = ${customer.id}, updated_at = now()
    where user_id = ${userId}`;
  return customer.id;
}

export const listMyPurchases = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string;
      sku: string;
      product_id: string;
      scan_token: string | null;
      amount_cents: number;
      status: string;
      created_at: string;
      item_names: string | null;
    }>`
      select p.id, p.sku, p.product_id, p.scan_token, p.amount_cents, p.status, p.created_at,
        s.teaser_json as item_names
      from purchases p
      left join scans s on s.token = p.scan_token
      where p.user_id = ${context.userId}
      order by p.created_at desc`;
  });

export const bootstrapAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureAccount(context.userId, null);
    const customerId = await ensureStripeCustomer(context.userId, null);
    return { ok: true as const, customerId };
  });

export async function recordPurchase(input: {
  userId: string;
  sku: string;
  productId: string;
  scanToken?: string | null;
  stripeSessionId: string;
  amountCents: number;
}) {
  const sql = await getSql();
  await sql`
    insert into purchases (
      id, user_id, sku, product_id, scan_token, stripe_session_id, amount_cents, currency, status
    ) values (
      ${newId()}, ${input.userId}, ${input.sku}, ${input.productId},
      ${input.scanToken ?? null}, ${input.stripeSessionId}, ${input.amountCents}, ${"eur"}, ${"paid"}
    )
    on conflict (stripe_session_id) do nothing`;
}
