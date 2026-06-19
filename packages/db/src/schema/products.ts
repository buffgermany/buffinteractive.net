import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// ============================================================
// Enums
// ============================================================

export const productTypeEnum = pgEnum("product_type", [
  "saas",
  "self_hosted",
  "human_service",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "digital_goods",
  "human",
]);

// ============================================================
// Products Table
// ============================================================

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  type: productTypeEnum("type").notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),

  // Pricing
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),

  // External payment provider references
  lemonSqueezyVariantId: text("lemon_squeezy_variant_id"),
  stripePriceId: text("stripe_price_id"),

  // Flags
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),

  // Metadata
  localImageKey: text("local_image_key"), // Internal disk path for product image
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("products_created_at_idx").on(table.createdAt),
]);

// ============================================================
// Inferred Types
// ============================================================

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
