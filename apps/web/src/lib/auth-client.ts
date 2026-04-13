import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./auth";

// ============================================================
// Better Auth — Browser/Client Instance
// Uses inferAdditionalFields so custom user fields (like `role`)
// are typed correctly in useSession() and getSession() hooks.
// ============================================================

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env["BETTER_AUTH_URL"] ?? "http://localhost:3000"),
  plugins: [
    inferAdditionalFields<Auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Convenience type for the authenticated user (includes `role`)
export type AuthUser = typeof authClient.$Infer.Session.user;
