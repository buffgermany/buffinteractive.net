import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL fehlt (erwartet in ../../.env). Migration abgebrochen.");
  process.exit(1);
}
const sql = postgres(connectionString, { max: 1 });

async function run() {
  console.log("Applying marketing tarif migration...");
  // ALTER TYPE ... ADD VALUE darf nicht in einer Transaktion laufen -> einzeln, ohne sql.begin()
  const queries = [
    `ALTER TYPE "contract_tarif" ADD VALUE IF NOT EXISTS 'marketing';`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS leistungsbeschreibung text;`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS mindestlaufzeit_monate integer;`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS stundensatz numeric(10, 2);`,
    `ALTER TABLE contracts ADD COLUMN IF NOT EXISTS werbebudget_richtwert numeric(10, 2);`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS leistungsbeschreibung text;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS mindestlaufzeit_monate integer;`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS stundensatz numeric(10, 2);`,
    `ALTER TABLE contract_signing_requests ADD COLUMN IF NOT EXISTS werbebudget_richtwert numeric(10, 2);`
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
