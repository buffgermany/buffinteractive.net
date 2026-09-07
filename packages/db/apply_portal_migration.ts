import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const client = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await client.begin(async (sql) => {
    await sql`CREATE TABLE IF NOT EXISTS organizations (
      id text PRIMARY KEY, name text NOT NULL, email text, phone text, address text, notes text,
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id text REFERENCES organizations(id) ON DELETE SET NULL`;
    await sql`CREATE INDEX IF NOT EXISTS users_organization_id_idx ON users(organization_id)`;
    await sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended'))`;
    await sql`CREATE TABLE IF NOT EXISTS conversations (
      id text PRIMARY KEY, customer_user_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      subject text NOT NULL, status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS conversations_customer_idx ON conversations(customer_user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS conversations_updated_idx ON conversations(updated_at)`;
    await sql`CREATE TABLE IF NOT EXISTS conversation_messages (
      id text PRIMARY KEY, conversation_id text NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      author_id text NOT NULL REFERENCES users(id) ON DELETE RESTRICT, body text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS conversation_messages_thread_idx ON conversation_messages(conversation_id)`;
  });
  console.info("Customer portal migration complete.");
} finally {
  await client.end();
}
