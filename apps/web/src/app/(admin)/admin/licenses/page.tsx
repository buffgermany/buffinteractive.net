import { db, schema, sql, desc } from "@platform/db";
import { AdminLicensesClient } from "@/components/admin/licenses-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Licenses — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminLicensesPage() {
  let licenses: typeof schema.licenses.$inferSelect[] = [];
  let total = 0;
  
  try {
    const [rows, countResult] = await Promise.all([
      db.select().from(schema.licenses).orderBy(desc(schema.licenses.createdAt)).limit(50),
      db.select({ count: sql<number>`count(*)` }).from(schema.licenses),
    ]);
    licenses = rows;
    total = Number(countResult[0]?.count || 0);
  } catch {
    // DB not connected
  }

  const serialized = licenses.map(l => ({
    id: l.id,
    orderId: l.orderId,
    userId: l.userId,
    productId: l.productId,
    licenseKey: l.licenseKey,
    hardwareId: l.hardwareId,
    status: l.status,
    activatedAt: l.activatedAt?.toISOString() || null,
    expiresAt: l.expiresAt?.toISOString() || null,
    revokedAt: l.revokedAt?.toISOString() || null,
    revokeReason: l.revokeReason,
    createdAt: l.createdAt.toISOString()
  }));

  return <AdminLicensesClient initialLicenses={serialized} total={total} />;
}
