import { treaty } from "@elysiajs/eden";
import type { App } from "@platform/api";

// ============================================================
// Eden Treaty — Type-Safe API Client
//
// Provides full autocomplete and type inference for all
// ElysiaJS API routes. Import this in Server Components,
// Server Actions, and API Route Handlers.
// ============================================================

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

export const api: ReturnType<typeof treaty<App>> = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
});

export type { App };
