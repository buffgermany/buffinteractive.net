import { test, expect } from "bun:test";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { db, schema, eq, inArray } from "@platform/db";
import { auth } from "./auth";

const baseUrl = process.env["PORTAL_TEST_URL"];
const decode = (text: string) => text.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// Opt-in: uses disposable records in the configured database and a running production build.
test.skipIf(!baseUrl)("portal: customer isolation, messages, organizations and admin profile updates", async () => {
  const prefix = `portal-test-${randomUUID()}`;
  const adminId = `${prefix}-admin`;
  const aliceId = `${prefix}-alice`;
  const bobId = `${prefix}-bob`;
  const ids = [adminId, aliceId, bobId];
  const password = `${randomUUID()}-test`;
  const request = (path: string, cookie: string, init: RequestInit = {}) => fetch(`${baseUrl}${path}`, { ...init, headers: { cookie, ...init.headers }, redirect: "manual" });
  async function signIn(id: string) {
    const response = await auth.api.signInEmail({ body: { email: `${id}@example.test`, password }, asResponse: true });
    expect(response.ok).toBe(true);
    return response.headers.getSetCookie().map(cookie => cookie.split(";")[0]).join("; ");
  }
  async function submit(path: string, cookie: string, label: string, fields: Record<string, string>, formCookie = cookie) {
    const page = await request(path, formCookie);
    expect(page.status).toBe(200);
    const html = await page.text();
    const form = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].map(match => match[1]!).find(content => content.includes(`>${label}</button>`));
    if (!form) throw new Error(`Form not found: ${label}`);
    const body = new FormData();
    for (const input of form.matchAll(/<input\b[^>]*type="hidden"[^>]*>/g)) {
      const name = input[0].match(/name="([^"]*)"/)?.[1];
      const value = input[0].match(/value="([^"]*)"/)?.[1];
      if (name) body.set(decode(name), decode(value ?? ""));
    }
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    return request(path, cookie, { method: "POST", headers: { origin: baseUrl! }, body });
  }
  try {
    const hashed = await hashPassword(password);
    await db.insert(schema.organizations).values({ id: prefix, name: `${prefix} Studio`, notes: `${prefix} internal-only` });
    await db.insert(schema.users).values(ids.map(id => ({ id, name: id, email: `${id}@example.test`, role: id === adminId ? "admin" as const : "user" as const, emailVerified: true })));
    await db.insert(schema.accounts).values(ids.map(id => ({ id, userId: id, accountId: id, providerId: "credential", password: hashed })));
    await db.insert(schema.contractSigningRequests).values({ id: prefix, token: prefix, customerUserId: aliceId, salesUserId: adminId, customerEmail: `${aliceId}@example.test`, tarif: "growth", zahlungsrhythmus: "monatlich", setupPreisBrutto: "100.00", laufendPreisBrutto: "50.00", expiresAt: new Date(Date.now() + 86400000) });
    const [admin, alice, bob] = await Promise.all(ids.map(signIn));
    const aliceHome = await (await request("/dashboard", alice!)).text();
    const bobHome = await (await request("/dashboard", bob!)).text();
    expect(aliceHome).toContain(`/sales/order/sign/${prefix}`);
    expect(bobHome).not.toContain(`/sales/order/sign/${prefix}`);
    expect((await request("/admin/users", alice!)).status).toBe(307);
    const opened = await submit("/dashboard/conversations", alice!, "Send message", { subject: prefix, body: "Please review the homepage.", customerUserId: bobId });
    expect(opened.status).toBe(303);
    const threadUrl = opened.headers.get("location")!;
    expect(threadUrl).toContain("/dashboard/conversations/");
    const threadId = threadUrl.split("/").pop()!;
    const [thread] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, threadId));
    expect(thread?.customerUserId).toBe(aliceId);
    // Next can stream the loading boundary with HTTP 200 before rendering notFound().
    const denied = await (await request(threadUrl, bob!)).text();
    expect(denied).toContain("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(denied).not.toContain("Please review the homepage.");
    expect(denied).not.toContain("Send reply");
    const reply = await submit(`/admin/conversations/${threadId}`, admin!, "Send reply", { body: "We can help with that." });
    expect(reply.status).toBe(200);
    expect(await (await request(threadUrl, alice!)).text()).toContain("We can help with that.");
    await submit(threadUrl, bob!, "Send reply", { body: "Unauthorized reply" }, alice!);
    const storedMessages = await db.select().from(schema.conversationMessages).where(eq(schema.conversationMessages.conversationId, threadId));
    expect(storedMessages).toHaveLength(2);
    expect(storedMessages.some(message => message.body === "Unauthorized reply")).toBe(false);
    await submit(threadUrl, alice!, "Close conversation", { status: "closed" });
    const closed = await (await request(threadUrl, alice!)).text();
    expect(closed).toContain("This conversation is closed.");
    await submit(threadUrl, alice!, "Reopen conversation", { status: "open" });
    expect(await (await request(threadUrl, alice!)).text()).toContain("Send reply");
    const patch = (cookie: string, id: string, body: object) => request(`/api/admin/users/${id}`, cookie, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    expect((await patch(bob!, aliceId, { role: "admin" })).status).toBe(403);
    expect((await patch(admin!, adminId, { role: "user" })).status).toBe(403);
    const updated = await patch(admin!, aliceId, { name: "Alice Updated", organizationId: prefix });
    expect(updated.status).toBe(200);
    const [aliceRecord] = await db.select().from(schema.users).where(eq(schema.users.id, aliceId));
    expect(aliceRecord?.name).toBe("Alice Updated");
    expect(aliceRecord?.organizationId).toBe(prefix);
    expect(aliceRecord?.company).toBe(`${prefix} Studio`);
    const updatedHome = await (await request("/dashboard", alice!)).text();
    expect(updatedHome).toContain(`${prefix} Studio`);
    expect(updatedHome).not.toContain(`${prefix} internal-only`);
    expect((await request("/api/admin/users?limit=9999", admin!)).status).toBe(400);
    expect((await request("/api/admin/users", alice!)).status).toBe(403);
  } finally {
    await db.delete(schema.conversations).where(inArray(schema.conversations.customerUserId, ids));
    await db.delete(schema.contractSigningRequests).where(eq(schema.contractSigningRequests.id, prefix));
    await db.delete(schema.users).where(inArray(schema.users.id, ids));
    await db.delete(schema.organizations).where(eq(schema.organizations.id, prefix));
  }
}, 60000);
