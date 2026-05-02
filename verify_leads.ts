import { db, sql } from "./packages/db/src/index";

async function main() {
    try {
        const res = await db.execute(sql`SELECT count(*) FROM "leads"`);
        console.log("Table 'leads' verified. Count:", res[0].count);
    } catch (err) {
        console.error("Verification failed:", err.message);
    }
    process.exit(0);
}

main();
