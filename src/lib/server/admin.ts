import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { dbSource } from "@/lib/db";
import { stripeSecret } from "./stripe";

function centsSum(rows: { v: number | string | null }[]): number {
  return rows.reduce((acc, r) => acc + Number(r.v ?? 0), 0);
}

export const getMachine = createServerFn({ method: "GET" })
  .validator(z.object({ key: z.string().max(80).optional() }))
  .handler(async ({ data }) => {
    const admin = process.env.ADMIN_TOKEN?.trim();
    if (admin && data.key !== admin) {
      return { ok: false as const, error: "locked" as const };
    }

    const sql = await getSql();
    const todayRev = await sql<{ v: number | string | null }>`
      select coalesce(sum(amount_cents), 0) as v from payments
      where status = 'paid' and created_at >= date_trunc('day', now())`;
    const todayTx = await sql<{ v: number | string | null }>`
      select count(*) as v from payments
      where status = 'paid' and created_at >= date_trunc('day', now())`;
    const weekRev = await sql<{ v: number | string | null }>`
      select coalesce(sum(amount_cents), 0) as v from payments
      where status = 'paid' and created_at >= now() - interval '7 days'`;
    const weekTx = await sql<{ v: number | string | null }>`
      select count(*) as v from payments
      where status = 'paid' and created_at >= now() - interval '7 days'`;
    const weekScans = await sql<{ v: number | string | null }>`
      select count(*) as v from scans where created_at >= now() - interval '7 days'`;
    const weekUnlocks = await sql<{ v: number | string | null }>`
      select count(*) as v from scans
      where unlocked = true and created_at >= now() - interval '7 days'`;
    const aiCost = await sql<{ v: number | string | null }>`
      select coalesce(sum(cost_cents), 0) as v from api_usage
      where created_at >= now() - interval '7 days'`;
    const topSku = await sql<{ sku: string; v: number | string | null }>`
      select sku, count(*) as v from payments
      where status = 'paid' and created_at >= now() - interval '7 days'
      group by sku order by count(*) desc limit 1`;
    const recent = await sql<{
      name: string;
      sku: string | null;
      created_at: string;
    }>`
      select name, sku, created_at from events
      order by created_at desc limit 12`;
    const failed = await sql<{ v: number | string | null }>`
      select count(*) as v from payments
      where status <> 'paid' and created_at >= now() - interval '7 days'`;

    const revenue7 = centsSum(weekRev);
    const ai7 = centsSum(aiCost);
    const stripeCost = Math.round(centsSum(weekTx) * 25 + revenue7 * 0.015);
    const gross = revenue7 - stripeCost - ai7;

    return {
      ok: true as const,
      today: {
        revenue: centsSum(todayRev),
        transactions: Number(todayTx[0]?.v ?? 0),
      },
      week: {
        revenue: revenue7,
        transactions: Number(weekTx[0]?.v ?? 0),
        scans: Number(weekScans[0]?.v ?? 0),
        unlocks: Number(weekUnlocks[0]?.v ?? 0),
        conversion:
          Number(weekScans[0]?.v ?? 0) > 0
            ? Number(weekUnlocks[0]?.v ?? 0) / Number(weekScans[0]?.v ?? 0)
            : 0,
        aiCost: ai7,
        stripeCost,
        gross,
        topSku: topSku[0]?.sku ?? "—",
        failed: Number(failed[0]?.v ?? 0),
      },
      status: {
        stripe: Boolean(stripeSecret()),
        database: dbSource,
        xai: Boolean(process.env.XAI_API_KEY),
        email: Boolean(process.env.RESEND_API_KEY),
        webhooks: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      },
      recent: recent.map((e) => ({
        name: e.name,
        sku: e.sku,
        at: e.created_at,
      })),
    };
  });
