import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import { lemonSqueezyWebhook } from "./routes/webhooks/lemon-squeezy.js";
import { stripeWebhook } from "./routes/webhooks/stripe.js";
import { licenseConnect } from "./routes/license/connect.js";
import { adminLicenseRoutes } from "./routes/admin/licenses.js";

// ============================================================
// API Engine — ElysiaJS on Bun
// ============================================================

console.log("[api] 🔧 Starting engine... Found env keys:", Object.keys(process.env).filter(k => k.includes("LEMON") || k.includes("STRIPE") || k.includes("DATABASE")));

const PORT = Number(process.env["API_PORT"] ?? 3001);

const app = new Elysia()
  // ---- Global middleware ----
  .use(
    cors({
      origin: process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000",
      credentials: true,
    })
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "Platform License API",
          version: "1.0.0",
          description: "E-commerce & licensing API engine. WebSocket at /v1/license/connect",
        },
        tags: [
          { name: "Health", description: "Service health" },
          { name: "Webhooks", description: "Payment provider webhooks" },
          { name: "Admin", description: "Admin management endpoints" },
        ],
      },
      path: "/docs",
    })
  )

  // ---- Health ----
  .get(
    "/v1/health",
    () => ({
      status: "ok",
      service: "platform-api",
      timestamp: new Date().toISOString(),
    }),
    { tags: ["Health"] }
  )

  // ---- Webhooks ----
  .use(lemonSqueezyWebhook)
  .use(stripeWebhook)

  // ---- License WebSocket ----
  .use(licenseConnect)

  // ---- Admin Routes ----
  .use(adminLicenseRoutes)

  // ---- Global error handler ----
  .onError(({ code, error, set }) => {
    console.error(`[API Error] ${code}:`, error);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return { error: "Validation error", details: error.message };
    }

    set.status = 500;
    return { error: "Internal server error" };
  })

  .listen(PORT);

console.log(
  `[API] 🚀 ElysiaJS running at http://0.0.0.0:${PORT}\n` +
  `[API] 📖 Swagger docs at http://0.0.0.0:${PORT}/docs\n` +
  `[API] 🔌 WS license endpoint at ws://0.0.0.0:${PORT}/v1/license/connect`
);

// Export type for Eden Treaty (type-safe client in Next.js)
export type App = typeof app;
