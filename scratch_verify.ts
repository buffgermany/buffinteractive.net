import { db, sql } from "./packages/db/src/index";

const INDEX_QUERIES = [
    `CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts" USING btree ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" USING btree ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "orders_product_id_idx" ON "orders" USING btree ("product_id");`,
    `CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");`,
    `CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "licenses_order_id_idx" ON "licenses" USING btree ("order_id");`,
    `CREATE INDEX IF NOT EXISTS "licenses_user_id_idx" ON "licenses" USING btree ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "licenses_product_id_idx" ON "licenses" USING btree ("product_id");`,
    `CREATE INDEX IF NOT EXISTS "licenses_status_idx" ON "licenses" USING btree ("status");`,
    `CREATE INDEX IF NOT EXISTS "licenses_created_at_idx" ON "licenses" USING btree ("created_at");`,
    `CREATE INDEX IF NOT EXISTS "assets_product_id_idx" ON "assets" USING btree ("product_id");`
];

async function main() {
    console.log("Applying SQL migrations for performance indexes...");
    for (const q of INDEX_QUERIES) {
        try {
            await db.execute(sql.raw(q));
            console.log(`Success: ${q}`);
        } catch (err) {
            console.error(`Failed: ${q}`, err.message);
        }
    }

    try {
        const res = await db.execute(sql`
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
              AND tablename IN ('users', 'sessions', 'accounts', 'products', 'orders', 'licenses', 'assets')
            ORDER BY tablename, indexname;
        `);
        console.log("\nIndexes currently in DB:");
        console.table(res);
    } catch (err) {
        console.error("Verification failed:", err.message);
    }
    process.exit(0);
}

main();
