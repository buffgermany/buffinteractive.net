import type { MetadataRoute } from "next";
import { db, schema } from "@platform/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://buffinteractive.net";

  // Base static routes
  const staticRoutes = [
    "",
    "/build",
    "/growth",
    "/audit",
    "/products/waas",
    "/imprint",
    "/privacy",
    "/terms",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : route === "/products/waas" ? 0.9 : 0.8,
  }));

  // Add dynamic products if DB is accessible
  try {
    const products = await db.select().from(schema.products);
    const productEntries = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    sitemapEntries.push(...productEntries);
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return sitemapEntries;
}
