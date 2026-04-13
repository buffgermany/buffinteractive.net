import Elysia from "elysia";
import Stripe from "stripe";
import { dbPlugin } from "../../plugins/db.js";
import { orders, licenses } from "@platform/db";
import { createId } from "@paralleldrive/cuid2";

// ============================================================
// Stripe Webhook Handler
// POST /v1/webhooks/stripe
//
// Handles:
//   - invoice.paid → creates Order + License (human services)
// ============================================================

const STRIPE_SECRET = process.env["STRIPE_SECRET_KEY"];
const STRIPE_WEBHOOK_SECRET = process.env["STRIPE_WEBHOOK_SECRET"];

if (!STRIPE_SECRET || !STRIPE_WEBHOOK_SECRET) {
  throw new Error("[api] STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be set.");
}

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2025-02-24.acacia" });

export const stripeWebhook = new Elysia()
  .use(dbPlugin)
  // Intercept raw body for Stripe signature verification
  .onParse(async ({ request, headers }) => {
    if (headers["content-type"]?.startsWith("application/json")) {
      const buf = await request.arrayBuffer();
      return Buffer.from(buf);
    }
  })
  .post(
    "/v1/webhooks/stripe",
    async ({ body, headers, db, set }) => {
      const sig = headers["stripe-signature"];
      if (!sig) {
        set.status = 401;
        return { error: "Missing stripe-signature header" };
      }

      const rawBody = body as unknown as Buffer;

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET!);
      } catch (err) {
        set.status = 400;
        return { error: `Stripe signature verification failed: ${String(err)}` };
      }

      switch (event.type) {
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          const metadata = invoice.metadata ?? {};
          const userId = metadata["userId"] ?? "";
          const productId = metadata["productId"] ?? "";

          if (!userId || !productId) {
            console.warn("[stripe] invoice.paid missing userId or productId in metadata", invoice.id);
            break;
          }

          // Create the order record
          const [newOrder] = await db
            .insert(orders)
            .values({
              userId,
              productId,
              paymentType: "human",
              externalOrderId: invoice.id,
              status: "paid",
              amountCents: invoice.amount_paid,
              currency: invoice.currency.toUpperCase(),
            })
            .returning();

          if (!newOrder) break;

          // Human services also get a license key (for download access control)
          await db.insert(licenses).values({
            orderId: newOrder.id,
            userId,
            productId,
            licenseKey: `HS-${createId().toUpperCase()}`,
            hardwareId: null, // Human services don't need HWID binding
            status: "active",
          });

          break;
        }

        default:
          // Silently acknowledge
          break;
      }

      set.status = 200;
      return { received: true };
    }
  );
