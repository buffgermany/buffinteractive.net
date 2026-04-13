import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { products, paymentTypeEnum } from "./products";

// ============================================================
// Enums
// ============================================================

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled",
]);

// Re-export paymentTypeEnum for orders (DRY — defined in products.ts)
export { paymentTypeEnum };

// ============================================================
// Orders Table
// ============================================================

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),

  paymentType: paymentTypeEnum("payment_type").notNull(),

  // ID from the external payment provider (LS order ID or Stripe invoice ID)
  externalOrderId: text("external_order_id").notNull().unique(),

  status: orderStatusEnum("status").notNull().default("pending"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Inferred Types
// ============================================================

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
