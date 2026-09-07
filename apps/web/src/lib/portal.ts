import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema, eq, sql, and } from "@platform/db";
import { userInput } from "./portal-validation";

export async function getPortalUser() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) redirect("/auth?from=/dashboard");
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.user.id)).limit(1);
  if (!user) redirect("/auth?from=/dashboard");
  return user;
}

export async function getAdminPortalUser() {
  const user = await getPortalUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function updateManagedUser(actorId: string, id: string, input: unknown) {
  const data = userInput.parse(input);
  return db.transaction(async tx => {
    const [actor] = await tx.select().from(schema.users).where(eq(schema.users.id, actorId)).limit(1);
    if (actor?.role !== "admin") throw new Error("Admin access required.");
    if (actorId === id && data.role !== "admin") throw new Error("You cannot remove your own admin access.");
    const [existing] = await tx.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    if (!existing) throw new Error("Customer not found.");
    if (data.organizationId) {
      const [organization] = await tx.select().from(schema.organizations).where(eq(schema.organizations.id, data.organizationId)).limit(1);
      if (!organization) throw new Error("Organization not found.");
      data.company = organization.name;
    }
    const [duplicate] = await tx.select({ id: schema.users.id }).from(schema.users).where(and(sql`lower(${schema.users.email}) = ${data.email}`, sql`${schema.users.id} <> ${id}`)).limit(1);
    if (duplicate) throw new Error("This email already has an account.");
    const hasEmailChanged = existing.email.toLowerCase() !== data.email;
    const [updated] = await tx.update(schema.users).set({ ...data, ...(hasEmailChanged ? { emailVerified: false } : {}), updatedAt: new Date() }).where(eq(schema.users.id, id)).returning();
    if (hasEmailChanged || existing.role !== data.role) {
      await tx.delete(schema.sessions).where(eq(schema.sessions.userId, id));
    }
    return updated;
  });
}
