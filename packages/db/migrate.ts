import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';

const connectionString = "postgres://postgres:fgDC3PwzwRegQStMe7RG0BHZC6x0yQ027o6469GRu0m2A3DW6tY7WvSBhozcZ0bL@178.104.100.186:7002/postgres";
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function run() {
  const query = fs.readFileSync('migrations/0003_past_yellow_claw.sql', 'utf8');
  // split statements by statement-breakpoint
  const statements = query.split('--> statement-breakpoint');
  for (const statement of statements) {
    if (statement.trim() !== '') {
      console.log('Running:', statement.trim());
      try {
        await sql.unsafe(statement);
      } catch (e) {
        console.error('Error running statement:', e.message);
      }
    }
  }
  console.log("Done");
  process.exit(0);
}

run();
