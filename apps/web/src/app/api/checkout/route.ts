import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq } from "@platform/db";
import { createLsCheckoutUrl } from "@/lib/lemon-squeezy";
import { createHumanServiceInvoice } from "@/lib/stripe";

// ============================================================
// POST /api/checkout
// Creates the checkout session and returns the redirect URL.
// ============================================================

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = (await req.json()) as { productId: string };
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  try {
    if (product.paymentType === "digital_goods") {
      if (!product.lemonSqueezyVariantId) {
        return NextResponse.json(
          { error: "Product not configured for checkout" },
          { status: 500 }
        );
      }
      const url = await createLsCheckoutUrl({
        variantId: product.lemonSqueezyVariantId,
        userId: session.user.id,
        userEmail: session.user.email,
        successUrl: `${origin}/dashboard?checkout=success`,
      });
      return NextResponse.json({ url });
    } else {
      // human service → Stripe Invoice
      const { url } = await createHumanServiceInvoice({
        customerEmail: session.user.email,
        customerName: session.user.name,
        productName: product.name,
        amountCents: product.priceCents,
        currency: product.currency,
        userId: session.user.id,
        productId: product.id,
        successUrl: `${origin}/dashboard?checkout=success`,
        cancelUrl: `${origin}/products/${product.slug}`,
      });
      return NextResponse.json({ url });
    }
  } catch (err) {
    console.error("[checkout] Error:", err);
    return NextResponse.json(
      { error: "Checkout creation failed. Please try again." },
      { status: 500 }
    );
  }
}
