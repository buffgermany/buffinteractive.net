// ============================================================
// Product & Billing Type Enums
// ============================================================

export type ProductType = "saas" | "self_hosted" | "human_service";

export type PaymentType = "digital_goods" | "human";

export type LicenseStatus = "active" | "suspended" | "expired" | "revoked";

export type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type UserRole = "user" | "admin";

// ============================================================
// Product
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  type: ProductType;
  paymentType: PaymentType;
  priceCents: number;
  currency: string;
  lemonSqueezyVariantId: string | null;
  stripePriceId: string | null;
  isActive: boolean;
  localImageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Order
// ============================================================

export interface Order {
  id: string;
  userId: string;
  productId: string;
  paymentType: PaymentType;
  externalOrderId: string;
  status: OrderStatus;
  amountCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// License
// ============================================================

export interface License {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  licenseKey: string;
  hardwareId: string | null;
  status: LicenseStatus;
  activatedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokeReason: string | null;
  lsLicenseKeyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// Asset
// ============================================================

export interface Asset {
  id: string;
  productId: string;
  localKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  label: string | null;
  uploadedAt: Date;
}

