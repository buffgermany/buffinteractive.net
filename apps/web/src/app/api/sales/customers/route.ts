import { NextResponse } from "next/server";
import { db, schema, or, ilike } from "@platform/db";
import { requireAdmin, AdminRequiredError } from "@/lib/account";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ customers: [] });

  const needle = `%${q}%`;
  const customers = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      company: schema.users.company,
    })
    .from(schema.users)
    .where(
      or(
        ilike(schema.users.email, needle),
        ilike(schema.users.name, needle),
        ilike(schema.users.company, needle)
      )
    )
    .limit(10);

  return NextResponse.json({ customers });
}
