import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL || "postgres://postgres:fgDC3PwzwRegQStMe7RG0BHZC6x0yQ027o6469GRu0m2A3DW6tY7WvSBhozcZ0bL@178.104.100.186:7002/postgres";
const sql = postgres(connectionString, { max: 1 });

async function run() {
  console.log("Applying prefill columns migration to contract_signing_requests...");
  const queries = [
    `CREATE TABLE IF NOT EXISTS contract_signing_requests (
      id text PRIMARY KEY NOT NULL,
      token text NOT NULL UNIQUE,
      sales_user_id text NOT NULL REFERENCES users(id) ON DELETE restrict,
      tarif "contract_tarif" NOT NULL,
      zahlungsrhythmus "contract_payment_cycle" NOT NULL,
      setup_preis_brutto numeric(10, 2) NOT NULL,
      laufend_preis_brutto numeric(10, 2) NOT NULL,
      customer_email text NOT NULL,
      customer_name text,
      company_name text,
      status "contract_signing_request_status" NOT NULL DEFAULT 'pending',
      expires_at timestamp with time zone NOT NULL,
      contract_id text REFERENCES contracts(id) ON DELETE SET NULL,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS rechtsform text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS strasse text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS plz text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS ort text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS telefon text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS ust_id text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS iban text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS bic text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS bank text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS kontoinhaber text;`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS rechtsform text NOT NULL DEFAULT '';`
  ];

  for (const q of queries) {
    try {
      await sql.unsafe(q);
      console.log("Success:", q.substring(0, 60));
    } catch (e: any) {
      console.log("Notice / Error:", e?.message);
    }
  }

  console.log("Migration complete!");
  process.exit(0);
}

run();
