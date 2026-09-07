import { headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { db, schema, eq, and, sql } from "@platform/db";
import { auth } from "./auth";

export class AdminRequiredError extends Error {
  constructor() {
    super("Admin-Berechtigung erforderlich.");
    this.name = "AdminRequiredError";
  }
}

/**
 * A user needs a password when they hold no credential account row.
 * Derived from `accounts` rather than a flag on `users` so it cannot
 * drift out of sync with what Better Auth actually stored.
 */
export async function needsPassword(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.userId, userId),
        eq(schema.accounts.providerId, "credential")
      )
    )
    .limit(1);

  return rows.length === 0;
}

export type ResolveCustomerInput = {
  email: string;
  name?: string | null;
  company?: string | null;
  phone?: string | null;
};

/**
 * Finds the account for `email`, or creates a passwordless one.
 * Never creates a duplicate: email match is case-insensitive.
 * A created user has no `accounts` row, so `needsPassword` is true
 * and the set-password gate will catch them on first landing.
 */
export async function resolveOrCreateCustomer(
  input: ResolveCustomerInput
): Promise<{ user: typeof schema.users.$inferSelect; created: boolean }> {
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("Ungültige E-Mail-Adresse.");
  }

  const existing = await db
    .select()
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = ${email}`)
    .limit(1);

  if (existing[0]) {
    // Fill blanks from the offer form, but never overwrite what the
    // customer has already set about themselves.
    const patch: Partial<typeof schema.users.$inferInsert> = {};
    if (!existing[0].company && input.company) patch.company = input.company;
    if (!existing[0].phone && input.phone) patch.phone = input.phone;

    if (Object.keys(patch).length > 0) {
      const [updated] = await db
        .update(schema.users)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(schema.users.id, existing[0].id))
        .returning();
      return { user: updated ?? existing[0], created: false };
    }

    return { user: existing[0], created: false };
  }

  const [created] = await db
    .insert(schema.users)
    .values({
      id: createId(),
      email,
      name: input.name?.trim() || email.split("@")[0]!,
      company: input.company?.trim() || null,
      phone: input.phone?.trim() || null,
      role: "user",
      emailVerified: false,
    })
    .returning();

  if (!created) throw new Error("Konto konnte nicht angelegt werden.");
  return { user: created, created: true };
}

/** Throws AdminRequiredError unless the caller is a logged-in admin. */
export async function requireAdmin() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  if (!session?.user || session.user.role !== "admin") {
    throw new AdminRequiredError();
  }
  return session.user;
}
