import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq } from "@platform/db";
import { z } from "zod";

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
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
    
    // Prevent self-demotion
    if (session.user.id === id) {
        return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Cannot modify your own role" } }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: { code: "VALIDATION_FAILED", message: "Invalid user data", details: parsed.error.issues } 
      }, { status: 400 });
    }

    const [updated] = await db
      .update(schema.users)
      .set({
        ...parsed.data,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[PATCH /api/admin/users/:id] Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
