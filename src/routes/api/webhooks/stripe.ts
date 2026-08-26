import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import { SKUS, type SkuId } from "@/lib/skus";
import { newId } from "@/lib/utils";
import { fulfillOrder } from "@/lib/server/stripe";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          return Response.json({ error: "webhook unconfigured" }, { status: 503 });
        }
        const raw = await request.text();
        const header = request.headers.get("stripe-signature") ?? "";
        if (!verifyStripe(raw, header, secret)) {
          return Response.json({ error: "bad signature" }, { status: 400 });
        }
        const event = JSON.parse(raw) as {
          id: string;
          type: string;
          data?: { object?: Record<string, unknown> };
        };
        const sql = await getSql();
        try {
          await sql`insert into webhook_events (id, provider, provider_id, kind)
            values (${newId()}, ${"stripe"}, ${event.id}, ${event.type})`;
        } catch {
          return Response.json({ received: true, duplicate: true });
        }
        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const obj = event.data?.object ?? {};
          const metadata = (obj.metadata ?? {}) as Record<string, string>;
          const sku = metadata.sku as SkuId | undefined;
          if (sku && sku in SKUS) {
            await fulfillOrder({
              provider: "stripe",
              providerId: String(obj.id ?? event.id),
              sku,
              amountCents: Number(obj.amount_total ?? SKUS[sku].amountCents),
              scanToken: metadata.scan_token,
              walletToken: metadata.wallet,
              userId: metadata.user_id,
            });
          }
        }
        return Response.json({ received: true });
      },
    },
  },
});

function verifyStripe(raw: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    }),
  );
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const signed = `${ts}.${raw}`;
  const digest = createHmac("sha256", secret).update(signed).digest("hex");
  try {
    const a = Buffer.from(digest, "hex");
    const b = Buffer.from(v1, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
