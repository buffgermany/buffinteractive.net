import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq } from "@platform/db";

export async function POST(
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
    const { reason = "TOS_VIOLATION" } = await req.json();

    const apiUrl = process.env["API_URL"] || "http://localhost:3001";
    
    try {
      const elyReq = await fetch(`${apiUrl}/v1/admin/licenses/${id}/revoke`, {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
              "Cookie": req.headers.get("cookie") || ""
          },
          body: JSON.stringify({ reason })
      });
      
      if (elyReq.ok) {
          const elyData = await elyReq.json();
          return NextResponse.json({ success: true, data: elyData });
      }
    } catch {
       // Elysia API unreachable, fallback to direct DB modification
    }

    // Fallback: update DB directly if Elysia API fails/unreachable
    const [revoked] = await db
        .update(schema.licenses)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          revokeReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(schema.licenses.id, id))
        .returning();
        
    return NextResponse.json({ success: true, data: revoked });
  } catch (error: any) {
    console.error("[POST /api/admin/licenses/:id/revoke] Error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message } }, { status: 500 });
  }
}
