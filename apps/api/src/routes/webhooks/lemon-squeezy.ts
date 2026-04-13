import Elysia from "elysia";
import { createHmac, timingSafeEqual } from "node:crypto";
import { dbPlugin } from "../../plugins/db.js";
import { redisPlugin } from "../../plugins/redis.js";
import { orders, licenses } from "@platform/db";
import { eq } from "@platform/db";

// ============================================================
// Lemon Squeezy Webhook Handler
// POST /v1/webhooks/lemon-squeezy
//
// Handles:
//   - order_created      → creates Order record
//   - license_key_created → creates License record + seeds Redis cache
// ============================================================

const LEMON_SQUEEZY_SECRET = process.env["LEMON_SQUEEZY_WEBHOOK_SECRET"];

if (!LEMON_SQUEEZY_SECRET) {
  throw new Error("[api] LEMON_SQUEEZY_WEBHOOK_SECRET is not set.");
}

/**
 * Verifies the Lemon Squeezy HMAC-SHA256 signature.
 * IMPORTANT: Must use raw Buffer body — NOT a parsed JSON object.
 */
function verifyLsSignature(rawBody: Buffer, signature: string): boolean {
  const hmac = createHmac("sha256", LEMON_SQUEEZY_SECRET!);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const sigBuffer = Buffer.from(signature, "utf8");

  if (digest.length !== sigBuffer.length) return false;
  return timingSafeEqual(digest, sigBuffer);
}

// Redis key helpers
const redisLicenseKey = (licenseKey: string) => `license::${licenseKey}`;

export const lemonSqueezyWebhook = new Elysia()
  .use(dbPlugin)
  .use(redisPlugin)
  // Intercept raw body before Elysia parses it
  .onParse(async ({ request, headers }) => {
    if (headers["content-type"]?.startsWith("application/json")) {
      const buf = await request.arrayBuffer();
      return Buffer.from(buf);
    }
  })
  .post(
    "/v1/webhooks/lemon-squeezy",
    async ({ body, headers, db, redis, set }) => {
      // 1. Verify signature
      const signature = headers["x-signature"];
      if (!signature || typeof signature !== "string") {
        set.status = 401;
        return { error: "Missing x-signature header" };
      }

      const rawBody = body as unknown as Buffer;
      if (!verifyLsSignature(rawBody, signature)) {
        set.status = 401;
        return { error: "Invalid signature" };
      }

      // 2. Parse event
      const event = JSON.parse(rawBody.toString()) as Record<string, unknown>;
      const eventName = headers["x-event-name"];

      const metaData = event["meta"] as Record<string, unknown> | undefined;
      const eventData = event["data"] as Record<string, unknown> | undefined;
      const attributes = (eventData?.["attributes"] as Record<string, unknown>) ?? {};

      // 3. Handle events
      switch (eventName) {
        case "order_created": {
          await db.insert(orders).values({
            userId: String(metaData?.["custom_data"] ?? ""),
            productId: String(attributes["product_id"] ?? ""),
            paymentType: "digital_goods",
            externalOrderId: String(eventData?.["id"] ?? ""),
            status: "paid",
            amountCents: Math.round(Number(attributes["total"] ?? 0)),
            currency: String(attributes["currency"] ?? "EUR").toUpperCase(),
          });
          break;
        }

        case "license_key_created": {
          const licenseKey = String(attributes["key"] ?? "");
          const lsId = String(eventData?.["id"] ?? "");
          const orderId = String(attributes["order_id"] ?? "");

          // Find the matching order
          const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.externalOrderId, orderId))
            .limit(1);

          if (order) {
            await db.insert(licenses).values({
              orderId: order.id,
              userId: order.userId,
              productId: order.productId,
              licenseKey,
              hardwareId: null,
              status: "active",
              lsLicenseKeyId: lsId,
            });

            // Seed Redis cache — no hardware binding yet
            await redis.set(
              redisLicenseKey(licenseKey),
              JSON.stringify({ status: "active", hardwareId: null, lsId }),
              "EX",
              60 * 60 * 24 * 7 // 7 days TTL, refreshed on WS connect
            );
          }
          break;
        }

        default:
          // Silently accept unhandled events (LS retries on non-2xx)
          break;
      }

      set.status = 200;
      return { received: true };
    }
  );
