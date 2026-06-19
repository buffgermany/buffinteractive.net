import { pgTable, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";
import { products } from "./products";
import { orders } from "./orders";

// ============================================================
// Enums
// ============================================================

export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "suspended",
  "expired",
  "revoked",
]);

// ============================================================
// Licenses Table
//
// One license is created per order for digital_goods products.
// For self_hosted products, the license requires a hardware_id
// binding before it becomes fully active.
// ============================================================

export const licenses = pgTable("licenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "restrict" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),

  // The license key displayed and used by the customer
  licenseKey: text("license_key").notNull().unique(),

  // Hardware fingerprint (MAC address + CPU ID hash). Null until first connection.
  // Once set, it cannot be changed without admin intervention.
  hardwareId: text("hardware_id"),

  status: licenseStatusEnum("status").notNull().default("active"),

  // Timestamps
  activatedAt: timestamp("activated_at"), // Set on first successful WS handshake
  expiresAt: timestamp("expires_at"),     // Null = lifetime license
  revokedAt: timestamp("revoked_at"),
  revokeReason: text("revoke_reason"),

  // Reference to the Lemon Squeezy license key record (for LS-managed licenses)
  lsLicenseKeyId: text("ls_license_key_id"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("licenses_order_id_idx").on(table.orderId),
  index("licenses_user_id_idx").on(table.userId),
  index("licenses_product_id_idx").on(table.productId),
  index("licenses_status_idx").on(table.status),
  index("licenses_created_at_idx").on(table.createdAt),
]);

// ============================================================
// Inferred Types
// ============================================================

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
