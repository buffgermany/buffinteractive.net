import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq } from "@platform/db";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  type: z.enum(["self_hosted", "saas", "human_service"]).optional(),
  paymentType: z.enum(["digital_goods", "human"]).optional(),
  lemonSqueezyVariantId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  localImageKey: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: "VALIDATION_FAILED", message: "Invalid product data", details: parsed.error.issues } 
      }, { status: 400 });
    }

    if (parsed.data.slug) {
        // Check idempotency for slug update
        const existing = await db.query.products.findFirst({
            where: (products, { eq, and, ne }) => and(eq(products.slug, parsed.data.slug!), ne(products.id, id))
        });
        if (existing) {
            return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "Slug already in use" } }, { status: 409 });
        }
    }

    const [updated] = await db
      .update(schema.products)
      .set({
        ...parsed.data,
        updatedAt: new Date()
      })
      .where(eq(schema.products.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[PATCH /api/admin/products/:id] Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 401 });
  }

  try {
    const { id } = await params;

    // We can just try to delete. If there are constraints (orders), it will throw.
    const [deleted] = await db
      .delete(schema.products)
      .where(eq(schema.products.id, id))
      .returning({ id: schema.products.id });

    if (!deleted) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Product not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    console.error("[DELETE /api/admin/products/:id] Error:", error);
    // 23503 is postgres error code for foreign_key_violation
    if (error.code === '23503') {
        return NextResponse.json({ 
            success: false, 
            error: { code: "CONSTRAINT_VIOLATION", message: "Cannot delete product because it has associated orders or licenses." } 
        }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
