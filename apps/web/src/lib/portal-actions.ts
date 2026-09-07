"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema, eq, and, sql } from "@platform/db";
import { ZodError } from "zod";
import { getPortalUser, updateManagedUser } from "./portal";
import { createId } from "@paralleldrive/cuid2";
import { canAccessConversation, conversationStatusInput, messageInput, organizationInput, planStatusInput, subjectInput, userInput } from "./portal-validation";

export type ActionState = { error?: string; success?: string };
function actionError(error: unknown): ActionState {
  if (error instanceof ZodError) return { error: error.issues[0]?.message ?? "Check the form fields." };
  console.error("[portal] Mutation failed", error);
  return { error: "Could not save your changes. Check your access and form fields, then try again." };
}
function refreshPortal() {
  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
}
async function getAdmin() {
  const user = await getPortalUser();
  if (user.role !== "admin") throw new Error("Admin access required.");
  return user;
}

export async function saveUser(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const actor = await getAdmin();
  try {
    const data = userInput.parse(Object.fromEntries(form));
    if (id) await updateManagedUser(actor.id, id, data);
    else {
      await db.transaction(async tx => {
        if (data.organizationId) {
          const [organization] = await tx.select().from(schema.organizations).where(eq(schema.organizations.id, data.organizationId)).limit(1);
          if (!organization) throw new Error("Organization not found.");
          data.company = organization.name;
        }
        const [existing] = await tx.select({ id: schema.users.id }).from(schema.users).where(sql`lower(${schema.users.email}) = ${data.email}`).limit(1);
        if (existing) throw new Error("This email already has an account.");
        await tx.insert(schema.users).values({ ...data, id: createId(), emailVerified: false });
      });
    }
    refreshPortal();
    return { success: "Customer saved." };
  } catch (error) { return actionError(error); }
}

export async function saveOrganization(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  await getAdmin();
  try {
    const data = organizationInput.parse(Object.fromEntries(form));
    await db.transaction(async tx => {
      if (!id) { await tx.insert(schema.organizations).values(data); return; }
      const [updated] = await tx.update(schema.organizations).set({ ...data, updatedAt: new Date() }).where(eq(schema.organizations.id, id)).returning();
      if (!updated) throw new Error("Organization not found.");
      await tx.update(schema.users).set({ company: data.name, updatedAt: new Date() }).where(eq(schema.users.organizationId, id));
    });
    refreshPortal();
    return { success: "Organization saved." };
  } catch (error) { return actionError(error); }
}

export async function setPlanStatus(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  await getAdmin();
  try {
    const status = planStatusInput.parse(form.get("status"));
    const [updated] = await db.update(schema.contracts).set({ status }).where(eq(schema.contracts.id, id)).returning({ id: schema.contracts.id });
    if (!updated) return { error: "Plan not found." };
    refreshPortal();
    return { success: "Plan status saved. Billing changes must be handled separately." };
  } catch (error) { return actionError(error); }
}

export async function startConversation(_state: ActionState, form: FormData): Promise<ActionState> {
  const user = await getPortalUser();
  let id: string;
  try {
    const subject = subjectInput.parse(form.get("subject"));
    const body = messageInput.parse(form.get("body"));
    const customerUserId = user.role === "admin" ? String(form.get("customerUserId") || user.id) : user.id;
    const [customer] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, customerUserId)).limit(1);
    if (!customer) return { error: "Choose an existing customer." };
    id = await db.transaction(async tx => {
      const [conversation] = await tx.insert(schema.conversations).values({ subject, customerUserId }).returning();
      if (!conversation) throw new Error("Conversation could not be created.");
      await tx.insert(schema.conversationMessages).values({ conversationId: conversation.id, authorId: user.id, body });
      return conversation.id;
    });
  } catch (error) { return actionError(error); }
  refreshPortal();
  redirect(`${user.role === "admin" ? "/admin" : "/dashboard"}/conversations/${id}`);
}

export async function replyToConversation(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const user = await getPortalUser();
  try {
    const body = messageInput.parse(form.get("body"));
    await db.transaction(async tx => {
      const [conversation] = await tx.select().from(schema.conversations).where(eq(schema.conversations.id, id)).for("update");
      if (!conversation || !canAccessConversation(user, conversation.customerUserId)) throw new Error("Conversation not found.");
      if (conversation.status !== "open") throw new Error("Reopen this conversation before replying.");
      await tx.insert(schema.conversationMessages).values({ conversationId: id, authorId: user.id, body });
      await tx.update(schema.conversations).set({ updatedAt: new Date() }).where(eq(schema.conversations.id, id));
    });
    refreshPortal();
    return { success: "Message sent." };
  } catch (error) { return actionError(error); }
}

export async function setConversationStatus(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const user = await getPortalUser();
  try {
    const status = conversationStatusInput.parse(form.get("status"));
    const [updated] = await db.update(schema.conversations).set({ status, updatedAt: new Date() }).where(and(
      eq(schema.conversations.id, id),
      user.role === "admin" ? undefined : eq(schema.conversations.customerUserId, user.id),
    )).returning({ id: schema.conversations.id });
    if (!updated) return { error: "Conversation not found." };
    refreshPortal();
    return { success: status === "closed" ? "Conversation closed." : "Conversation reopened." };
  } catch (error) { return actionError(error); }
}
