import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL fehlt (erwartet in ../../.env). Backfill abgebrochen.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const dryRun = !process.argv.includes("--apply");

async function run() {
  console.log(dryRun ? "DRY RUN — pass --apply to write." : "Applying backfill...");

  const contractMatches = await sql`
    select c.id, c.email, u.id as user_id
    from contracts c
    join users u on lower(u.email) = lower(c.email)
    where c.customer_user_id is null
  `;

  const inviteMatches = await sql`
    select r.id, r.customer_email, u.id as user_id
    from contract_signing_requests r
    join users u on lower(u.email) = lower(r.customer_email)
    where r.customer_user_id is null
  `;

  console.log(`contracts to link:         ${contractMatches.length}`);
  console.log(`signing requests to link:  ${inviteMatches.length}`);

  const [{ count: orphanContracts }] = await sql`
    select count(*)::int as count from contracts c
    where c.customer_user_id is null
      and not exists (select 1 from users u where lower(u.email) = lower(c.email))
  `;
  console.log(`contracts with no matching account (left null): ${orphanContracts}`);

  if (dryRun) {
    process.exit(0);
  }

  await sql`
    update contracts c
    set customer_user_id = u.id
    from users u
    where lower(u.email) = lower(c.email)
      and c.customer_user_id is null
  `;

  await sql`
    update contract_signing_requests r
    set customer_user_id = u.id
    from users u
    where lower(u.email) = lower(r.customer_email)
      and r.customer_user_id is null
  `;

  console.log("Backfill complete.");
  process.exit(0);
}

run();
