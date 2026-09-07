import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL fehlt (erwartet in ../../.env). Abbruch.");
  process.exit(1);
}
const sql = postgres(connectionString, { max: 1 });

// Removes rows left behind by the plan's tests. Every statement is filtered on
// the planttest- prefix, so it cannot touch real customer data.
async function run() {
  const requests = await sql`
    delete from contract_signing_requests
    where customer_email like 'planttest-%'
    returning id, customer_email`;
  console.log(`contract_signing_requests deleted: ${requests.length}`);
  for (const r of requests) console.log("  ", r.id, r.customer_email);

  const contracts = await sql`
    delete from contracts where email like 'planttest-%' returning id, email`;
  console.log(`contracts deleted: ${contracts.length}`);

  const accounts = await sql`
    delete from accounts
    where user_id in (select id from users where email like 'planttest-%')
    returning id`;
  console.log(`accounts deleted: ${accounts.length}`);

  const users = await sql`
    delete from users where email like 'planttest-%' returning id, email`;
  console.log(`users deleted: ${users.length}`);

  console.log("Cleanup complete.");
  process.exit(0);
}

run();
