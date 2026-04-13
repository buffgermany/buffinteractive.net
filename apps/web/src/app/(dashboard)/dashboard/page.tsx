import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq, desc } from "@platform/db";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient, DashboardSkeleton } from "./_components/DashboardClient";

export const metadata: Metadata = {
  title: "Command Center — Buff",
  description: "Your licenses, orders and assets in one place.",
};

async function DashboardData({ userId }: { userId: string }) {
  const [userOrders, userLicenses] = await Promise.all([
    db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt))
      .limit(8),
    db.select({
      license: schema.licenses,
      product: schema.products,
    })
      .from(schema.licenses)
      .innerJoin(schema.products, eq(schema.licenses.productId, schema.products.id))
      .where(eq(schema.licenses.userId, userId))
      .orderBy(desc(schema.licenses.createdAt))
      .limit(12),
  ]);

  const session = await auth.api.getSession({ headers: await headers() });

  const licenses = userLicenses.map(({ license, product }) => ({
    id: license.id,
    licenseKey: license.licenseKey,
    status: license.status,
    hardwareId: license.hardwareId,
    createdAt: license.createdAt,
    productId: license.productId,
    product: {
      name: product.name,
      type: product.type,
    },
  }));

  return (
    <DashboardClient
      userName={session?.user.name ?? ""}
      licenses={licenses}
      orders={userOrders}
    />
  );
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData userId={session!.user.id} />
    </Suspense>
  );
}
