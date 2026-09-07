import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL fehlt (erwartet in ../../.env). Migration abgebrochen.");
  process.exit(1);
}
const sql = postgres(connectionString, { max: 1 });

// Additive only. The drizzle migrations directory has drifted from production,
// so schema changes are applied with idempotent scripts (see
// apply_marketing_migration.ts). Every statement here is safe to re-run.
const queries = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS company text;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;`,

  `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS customer_user_id text;`,
  `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS customer_user_id text;`,

  // ADD CONSTRAINT has no IF NOT EXISTS in Postgres, so guard on pg_constraint.
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contracts_customer_user_id_users_id_fk') THEN
       ALTER TABLE contracts ADD CONSTRAINT contracts_customer_user_id_users_id_fk
         FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE SET NULL;
     END IF;
   END $$;`,
  `DO $$ BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contract_signing_requests_customer_user_id_users_id_fk') THEN
       ALTER TABLE contract_signing_requests ADD CONSTRAINT contract_signing_requests_customer_user_id_users_id_fk
         FOREIGN KEY (customer_user_id) REFERENCES users(id) ON DELETE SET NULL;
     END IF;
   END $$;`,

  `CREATE INDEX IF NOT EXISTS contracts_customer_user_id_idx ON contracts (customer_user_id);`,
  `CREATE INDEX IF NOT EXISTS csr_customer_user_id_idx ON contract_signing_requests (customer_user_id);`,
  `CREATE INDEX IF NOT EXISTS csr_token_idx ON contract_signing_requests (token);`
];

async function run() {
  console.log("Applying customer account link migration...");
  for (const q of queries) {
    await sql.unsafe(q);
    console.log("Success:", q.replace(/\s+/g, " ").substring(0, 70));
  }
  console.log("Migration complete!");
  process.exit(0);
}

run();
