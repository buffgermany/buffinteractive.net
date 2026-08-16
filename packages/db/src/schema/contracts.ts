import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users";

export const contractTarifEnum = pgEnum("contract_tarif", ["essential", "growth", "enterprise"]);
export const contractPaymentCycleEnum = pgEnum("contract_payment_cycle", ["monatlich", "jaehrlich"]);

export const contracts = pgTable("contracts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  
  tarif: contractTarifEnum("tarif").notNull(),
  zahlungsrhythmus: contractPaymentCycleEnum("zahlungsrhythmus").notNull(),
  
  // Using string for decimals to avoid precision loss, but decimal type works too
  setupPreisBrutto: decimal("setup_preis_brutto", { precision: 10, scale: 2 }).notNull(),
  laufendPreisBrutto: decimal("laufend_preis_brutto", { precision: 10, scale: 2 }).notNull(),

  // Kundendaten
  firma: text("firma").notNull(),
  rechtsform: text("rechtsform").notNull().default(""),
  ansprechpartner: text("ansprechpartner").notNull(),
  strasse: text("strasse").notNull(),
  plz: text("plz").notNull(),
  ort: text("ort").notNull(),
  email: text("email").notNull(),
  telefon: text("telefon"),
  ustId: text("ust_id"),

  // SEPA
  iban: text("iban").notNull(),
  bic: text("bic"),
  bank: text("bank"),
  kontoinhaber: text("kontoinhaber"), // falls abweichend

  // Einwilligungen
  consentB2b: boolean("consent_b2b").notNull(),
  consentAgb: boolean("consent_agb").notNull(),
  consentAvv: boolean("consent_avv").notNull(),
  consentMarketing: boolean("consent_marketing").notNull().default(false),

  // Signaturen (Base64 PNG strings can be quite large, text is fine)
  signatureSepaB64: text("signature_sepa_b64").notNull(),
  signatureContractB64: text("signature_contract_b64").notNull(),

  // Audit-Trail
  salesUserId: text("sales_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  signedAt: timestamp("signed_at", { withTimezone: true }).notNull().defaultNow(),
  clientIp: text("client_ip"),
  userAgent: text("user_agent"),

  // Archivierung
  pdfPath: text("pdf_path").notNull(),
  pdfFilename: text("pdf_filename").notNull(),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),

});


export const contractSigningRequestStatusEnum = pgEnum("contract_signing_request_status", [
  "pending",
  "signed",
  "expired",
  "cancelled"
]);

export const contractSigningRequests = pgTable("contract_signing_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  token: text("token").notNull().unique(),

  salesUserId: text("sales_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  tarif: contractTarifEnum("tarif").notNull(),
  zahlungsrhythmus: contractPaymentCycleEnum("zahlungsrhythmus").notNull(),

  setupPreisBrutto: decimal("setup_preis_brutto", { precision: 10, scale: 2 }).notNull(),
  laufendPreisBrutto: decimal("laufend_preis_brutto", { precision: 10, scale: 2 }).notNull(),

  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  companyName: text("company_name"),

  status: contractSigningRequestStatusEnum("status").notNull().default("pending"),

  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

  contractId: text("contract_id").references(() => contracts.id, { onDelete: "set null" }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type ContractSigningRequest = typeof contractSigningRequests.$inferSelect;
export type NewContractSigningRequest = typeof contractSigningRequests.$inferInsert;

