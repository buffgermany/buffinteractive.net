import Elysia from "elysia";
import Redis from "ioredis";

// ============================================================
// Redis Plugin
//
// Injects a singleton ioredis client into Elysia's context.
// All routes that need Redis access should use `.use(redisPlugin)`.
// ============================================================

const REDIS_URL = process.env["REDIS_URL"];

if (!REDIS_URL) {
  console.warn(
    "[api] WARNING: REDIS_URL is not set. Redis-dependent features (caching, WS sessions) will fail. " +
    "Falling back to localhost:6379 for development."
  );
}

// Singleton — created once at module load, shared across all requests
const redis = new Redis(REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // Don't block startup if redis isn't ready
});

redis.on("connect", () => console.log("[Redis] Connected"));
redis.on("error", (err) => console.error("[Redis] Error:", err));

export const redisPlugin = new Elysia({ name: "redis" }).decorate(
  "redis",
  redis
);

export type { Redis };
export { redis };
