import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema } from "@platform/db";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  shortDescription: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  type: z.enum(["self_hosted", "saas", "human_service"]),
  paymentType: z.enum(["digital_goods", "human"]),
  lemonSqueezyVariantId: z.string().optional().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  localImageKey: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  // 1. Auth Guard
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: "VALIDATION_FAILED", message: "Invalid product data", details: parsed.error.issues } 
      }, { status: 400 });
    }
    
    // Check global idempotency (slug uniqueness)
    const existing = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.slug, parsed.data.slug)
    });
    
    if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: { code: "CONFLICT", message: "Product with this slug already exists" } 
        }, { status: 409 });
    }

    const [product] = await db.insert(schema.products).values({
      ...parsed.data,
      shortDescription: parsed.data.shortDescription ?? null,
      lemonSqueezyVariantId: parsed.data.lemonSqueezyVariantId ?? null,
      localImageKey: parsed.data.localImageKey ?? null,
    }).returning();

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/products] Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
