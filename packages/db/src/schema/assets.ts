import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { products } from "./products";

// ============================================================
// Assets Table
//
// Stores downloadable files (software installers, deliverables,
// etc.) associated with a product.
// Files are stored on the internal application disk; this table holds metadata.
// ============================================================

export const assets = pgTable("assets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  // Internal file path relative to STORAGE_PATH (e.g. "products/cuid123/installer-v2.0.exe")
  // NOTE: column is named "local_key" in DB.
  localKey: text("local_key").notNull(),
  filename: text("filename").notNull(),     // Original filename shown to user
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),

  // Display label (e.g. "Windows Installer v2.0", "Project Files")
  label: text("label"),

  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => [
  index("assets_product_id_idx").on(table.productId),
]);

// ============================================================
// Inferred Types
// ============================================================

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
