import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db, schema, eq } from "@platform/db";
import { auth } from "@/lib/auth";
import { updateManagedUser } from "@/lib/portal";
import { userInput } from "@/lib/portal-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in first." } }, { status: 401 });
  const [actor] = await db.select().from(schema.users).where(eq(schema.users.id, session.user.id)).limit(1);
  if (actor?.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
  const { id } = await params;
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!existing) return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Customer not found." } }, { status: 404 });
  const body: unknown = await request.json().catch(() => null);
  const patch = userInput.partial().strict().safeParse(body);
  if (!patch.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_FAILED", message: "Invalid customer details." } }, { status: 400 });
  if (actor.id === id && patch.data.role && patch.data.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You cannot remove your own admin access." } }, { status: 403 });
  try {
    const updated = await updateManagedUser(actor.id, id, { ...existing, ...patch.data });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[admin/users] Update failed", error);
    return NextResponse.json({ success: false, error: { code: "UPDATE_FAILED", message: "Could not update this customer. Check the email and organization." } }, { status: 400 });
  }
}
