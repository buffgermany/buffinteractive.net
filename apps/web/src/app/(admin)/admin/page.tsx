import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq, desc, sql } from "@platform/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { ShoppingBag, Key, Users, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Platform" };

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  let totalUsers = [{ count: 0 }];
  let totalOrders = [{ count: 0, revenue: 0 }];
  let totalLicenses = [{ count: 0 }];
  let activeLicenses = [{ count: 0 }];
  let recentOrders: any[] = [];

  try {
    const [
      u,
      o,
      l,
      a,
      r,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(schema.users),
      db.select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(amount_cents), 0)` }).from(schema.orders).where(eq(schema.orders.status, "paid")),
      db.select({ count: sql<number>`count(*)` }).from(schema.licenses),
      db.select({ count: sql<number>`count(*)` }).from(schema.licenses).where(eq(schema.licenses.status, "active")),
      db.select({ order: schema.orders, user: schema.users })
        .from(schema.orders)
        .innerJoin(schema.users, eq(schema.orders.userId, schema.users.id))
        .orderBy(desc(schema.orders.createdAt))
        .limit(8),
    ]);
    totalUsers = u;
    totalOrders = o;
    totalLicenses = l;
    activeLicenses = a;
    recentOrders = r;
  } catch (error) {
    console.error("Failed to load admin overview metrics:", error);
  }

  const stats = [
    {
      label: "Total users",
      value: Number(totalUsers[0]?.count ?? 0).toLocaleString(),
      icon: Users,
      color: "text-sky-400 bg-sky-500/10",
    },
    {
      label: "Revenue (paid)",
      value: formatCurrency(Number(totalOrders[0]?.revenue ?? 0)),
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Total licenses",
      value: Number(totalLicenses[0]?.count ?? 0).toLocaleString(),
      icon: Key,
      color: "text-violet-400 bg-violet-500/10",
    },
    {
      label: "Active licenses",
      value: Number(activeLicenses[0]?.count ?? 0).toLocaleString(),
      icon: Activity,
      color: "text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform health & business metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Recent orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Order ID</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map(({ order, user }) => (
                  <tr key={order.id} className="py-3">
                    <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                      {order.externalOrderId.slice(0, 12)}…
                    </td>
                    <td className="py-3 pr-4 truncate max-w-32">{user.email}</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(order.amountCents, order.currency)}</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        order.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-secondary-foreground"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
