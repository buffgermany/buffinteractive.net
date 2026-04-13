import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// ============================================================
// Better Auth catch-all route
// Handles all /api/auth/* requests (sign-in, sign-up, sessions)
// ============================================================

export const { GET, POST } = toNextJsHandler(auth.handler);
