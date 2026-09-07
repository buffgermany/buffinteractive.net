import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db, schema } from "@platform/db";
import { magicLinkCapture } from "./magic-link-capture";
import { sendAuthEmail } from "./mail";

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

  plugins: [
    magicLink({
      // Matches the 14-day signing-request expiry in apps/api.
      expiresIn: 60 * 60 * 24 * 14,
      disableSignUp: true, // accounts are created explicitly, never by clicking a link
      sendMagicLink: async ({ email, url }) => {
        const capture = magicLinkCapture.getStore();
        if (capture) {
          // The caller is embedding this link in its own email.
          capture.url = url;
          return;
        }
        await sendAuthEmail({
          to: email,
          subject: "Dein Login-Link für Buff",
          heading: "Dein Login-Link",
          bodyHtml: "<p>Klicke auf den Button, um Dich anzumelden. Der Link ist 14 Tage gültig und kann einmal verwendet werden.</p>",
          ctaLabel: "Jetzt anmelden",
          ctaUrl: url,
        });
      },
    }),
  ],

  trustedOrigins: [
    process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
