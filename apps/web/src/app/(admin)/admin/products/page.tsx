import { db, schema, desc } from "@platform/db";
import { AdminProductsClient } from "@/components/admin/products-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  let products: typeof schema.products.$inferSelect[] = [];
  try {
    products = await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
  } catch {
    // DB not connected in dev
  }

  return <AdminProductsClient initial={products} />;
}
