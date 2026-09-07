import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq, sql, desc, or, ilike } from "@platform/db";
import { z } from "zod";

const queryInput = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(200).default(""),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in first." } }, { status: 401 });
  const [actor] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, session.user.id)).limit(1);
  if (actor?.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required." } }, { status: 403 });
  const parsed = queryInput.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "VALIDATION_FAILED", message: "Invalid search or page." } }, { status: 400 });
  const { page, limit, search } = parsed.data;
  const condition = search ? or(ilike(schema.users.name, `%${search}%`), ilike(schema.users.email, `%${search}%`), ilike(schema.users.company, `%${search}%`)) : undefined;
  try {
    const [users, [count]] = await Promise.all([
      db.select().from(schema.users).where(condition).orderBy(desc(schema.users.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ value: sql<number>`count(*)::int` }).from(schema.users).where(condition),
    ]);
    return NextResponse.json({ success: true, data: { users, total: count?.value ?? 0, page, limit } });
  } catch (error) {
    console.error("[admin/users] Search failed", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Could not load customers. Try again." } }, { status: 500 });
  }
}
