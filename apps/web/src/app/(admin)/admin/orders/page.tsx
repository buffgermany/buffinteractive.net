import { db, schema, sql, desc, eq } from "@platform/db";
import { AdminOrdersClient } from "@/components/admin/orders-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  let total = 0;
  
  try {
    orders = await db.select({
      order: schema.orders,
      user: schema.users
    })
    .from(schema.orders)
    .innerJoin(schema.users, eq(schema.orders.userId, schema.users.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(50);
    
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(schema.orders);
    total = Number(countResult?.count || 0);
  } catch {
    // DB not connected in dev
  }

  const serialized = orders.map(({ order, user }) => ({
    ...order,
    userEmail: user.email,
    userName: user.name,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));

  return <AdminOrdersClient initialOrders={serialized} total={total} />;
}
