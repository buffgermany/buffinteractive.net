import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, sql, desc, or } from "@platform/db";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    
    const offset = (page - 1) * limit;

    const condition = search ? or(
        sql`${schema.users.name} ILIKE ${`%${search}%`}`,
        sql`${schema.users.email} ILIKE ${`%${search}%`}`
    ) : undefined;
    
    const rows = await db
        .select()
        .from(schema.users)
        .where(condition)
        .orderBy(desc(schema.users.createdAt))
        .limit(limit)
        .offset(offset);

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(condition);
      
    return NextResponse.json({ 
      success: true, 
      data: {
        users: rows,
        total: Number(countResult?.count || 0),
        page,
        limit
      } 
    });
  } catch (error: any) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
