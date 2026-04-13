import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

// ============================================================
// Database Client
// ============================================================

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;
  const url = process.env["DATABASE_URL"];
  if (!url) {
    console.warn(
      "[db] WARNING: DATABASE_URL is not set. DB queries will fail at runtime. " +
      "Copy .env.example to .env and fill in your PostgreSQL connection string."
    );
    // Return a dummy that will throw on any query — allows import without crashing
    return null as unknown as ReturnType<typeof drizzle>;
  }
  const client = postgres(url, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: false,
  });
  _db = drizzle(client, {
    schema,
    logger: process.env["NODE_ENV"] === "development",
  });
  return _db;
}

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) throw new Error("[db] DATABASE_URL is not configured.");
    return (instance as unknown as Record<string | symbol, unknown>)[prop];
  },
}) as DbInstance;

// ============================================================
// Public API Surface
// ============================================================

export { schema };
export * from "./schema/index";

// Re-export Drizzle utilities for use in consuming packages
export { eq, and, or, not, desc, asc, sql, inArray, isNull, isNotNull } from "drizzle-orm";
