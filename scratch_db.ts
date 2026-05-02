import { db, sql } from "./packages/db/src/index";

async function main() {
    console.log("Creating 'leads' table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "leads" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
                "name" text NOT NULL,
                "company" text NOT NULL,
                "problem_area" text NOT NULL,
                "action" text NOT NULL,
                "email" text NOT NULL,
                "created_at" timestamp DEFAULT now() NOT NULL
            );
        `);
        console.log("Success! 'leads' table created.");
    } catch (err) {
        console.error("Failed to create table:", err);
    }
    process.exit(0);
}

main();
