CREATE TYPE "public"."contract_payment_cycle" AS ENUM('monatlich', 'jaehrlich');--> statement-breakpoint
CREATE TYPE "public"."contract_tarif" AS ENUM('essential', 'growth', 'enterprise');--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif" "contract_tarif" NOT NULL,
	"zahlungsrhythmus" "contract_payment_cycle" NOT NULL,
	"setup_preis_netto" numeric(10, 2) NOT NULL,
	"laufend_preis_netto" numeric(10, 2) NOT NULL,
	"firma" text NOT NULL,
	"ansprechpartner" text NOT NULL,
	"strasse" text NOT NULL,
	"plz" text NOT NULL,
	"ort" text NOT NULL,
	"email" text NOT NULL,
	"telefon" text,
	"ust_id" text,
	"iban" text NOT NULL,
	"bic" text,
	"bank" text,
	"kontoinhaber" text,
	"consent_b2b" boolean NOT NULL,
	"consent_agb" boolean NOT NULL,
	"consent_avv" boolean NOT NULL,
	"consent_marketing" boolean DEFAULT false NOT NULL,
	"signature_sepa_b64" text NOT NULL,
	"signature_contract_b64" text NOT NULL,
	"sales_user_id" text NOT NULL,
	"signed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"client_ip" text,
	"user_agent" text,
	"pdf_path" text NOT NULL,
	"pdf_filename" text NOT NULL,
	"email_sent_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_sales_user_id_users_id_fk" FOREIGN KEY ("sales_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;