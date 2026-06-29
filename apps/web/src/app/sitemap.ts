import type { MetadataRoute } from "next";
import { db, schema } from "@platform/db";

const baseUrl = "https://buffinteractive.net";
const locales = ["de", "en", "es"] as const;

// Storefront routes that exist in all 3 locales
const multiLocaleRoutes = [
  "",
  "/build",
  "/growth",
  "/audit",
  "/products/waas",
  "/imprint",
  "/privacy",
  "/terms",
];

// German-only local SEO pages (no hreflang alternates)
const germanOnlyRoutes = [
  "/webdesign-chemnitz",
  "/webdesign-dresden",
  "/webdesign-leipzig",
];

function buildAlternates(route: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${baseUrl}/${locale}${route}`;
  }
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // --- Multi-locale storefront routes ---
  const multiLocaleEntries: MetadataRoute.Sitemap = multiLocaleRoutes.flatMap(
    (route) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority:
          route === ""
            ? 1.0
            : route === "/products/waas"
            ? 0.9
            : route === "/build" || route === "/growth" || route === "/audit"
            ? 0.8
            : 0.6,
        alternates: {
          languages: buildAlternates(route),
        },
      }))
  );

  // --- German-only local SEO pages ---
  const germanOnlyEntries: MetadataRoute.Sitemap = germanOnlyRoutes.map(
    (route) => ({
      url: `${baseUrl}/de${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })
  );

  // --- Dynamic product pages (all locales) ---
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await db.select().from(schema.products);
    productEntries = products.flatMap((product) =>
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.updatedAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: buildAlternates(`/products/${product.slug}`),
        },
      }))
    );
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error);
  }

  return [...multiLocaleEntries, ...germanOnlyEntries, ...productEntries];
}
