import { notFound } from "next/navigation";
import { db, schema, eq } from "@platform/db";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, slug))
    .limit(1);

  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — Platform`,
    description: product.shortDescription ?? product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  let product = null;
  try {
    const [row] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, slug))
      .limit(1);
    product = row;
  } catch {
    // DB not connected in dev
  }

  if (!product) notFound();

  return (
      <main className="min-h-screen pt-48">
        <ProductDetailClient product={product} />
      </main>
  );
}
