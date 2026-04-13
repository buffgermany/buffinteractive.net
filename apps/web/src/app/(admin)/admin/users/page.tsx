import { db, schema, sql, desc } from "@platform/db";
import { AdminUsersClient } from "@/components/admin/users-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  let users: typeof schema.users.$inferSelect[] = [];
  let total = 0;
  
  try {
    users = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt)).limit(50);
    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
    total = Number(countResult?.count || 0);
  } catch {
    // DB not connected in dev
  }

  // Serialize dates for client
  const serialized = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString()
  }));

  return <AdminUsersClient initialUsers={serialized} total={total} />;
}
