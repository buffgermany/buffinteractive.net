import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@platform/db";

// ============================================================
// Better Auth — Server Instance
// Backed by PostgreSQL via Drizzle ORM.
// Role-based access: 'user' | 'admin' (field on users table)
// ============================================================

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  secret: process.env["BETTER_AUTH_SECRET"]!,
  baseURL: process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production after configuring email
    minPasswordLength: 10,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh session if 1+ day old
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min client-side session cache
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Users cannot set their own role
      },
    },
  },

  trustedOrigins: [
    process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
