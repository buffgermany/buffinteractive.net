import { expect, test, afterAll } from "bun:test";
import { db, schema, eq, like } from "@platform/db";
import { needsPassword, resolveOrCreateCustomer } from "./account";

// Integration test: runs against the DATABASE_URL in the repo-root .env.
// Every row it creates uses this prefix so cleanup cannot touch real data.
const PREFIX = "planttest-";
const email = (n: string) => `${PREFIX}${n}@example.test`;

afterAll(async () => {
  await db.delete(schema.accounts).where(like(schema.accounts.accountId, `${PREFIX}%`));
  await db.delete(schema.users).where(like(schema.users.email, `${PREFIX}%`));
});

test("creates an account with company and phone populated", async () => {
  const { user, created } = await resolveOrCreateCustomer({
    email: email("new"),
    name: "Erika Musterfrau",
    company: "Muster GmbH",
    phone: "+49 341 1234567",
  });

  expect(created).toBe(true);
  expect(user.email).toBe(email("new"));
  expect(user.name).toBe("Erika Musterfrau");
  expect(user.company).toBe("Muster GmbH");
  expect(user.phone).toBe("+49 341 1234567");
});

test("a second invite to the same email reuses the account", async () => {
  const first = await resolveOrCreateCustomer({ email: email("dup"), name: "Erste" });
  const second = await resolveOrCreateCustomer({ email: email("dup"), name: "Zweite" });

  expect(first.created).toBe(true);
  expect(second.created).toBe(false);
  expect(second.user.id).toBe(first.user.id);

  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email("dup")));
  expect(rows.length).toBe(1);
});

test("email lookup is case-insensitive", async () => {
  const lower = await resolveOrCreateCustomer({ email: email("case") });
  const upper = await resolveOrCreateCustomer({ email: email("case").toUpperCase() });

  expect(upper.created).toBe(false);
  expect(upper.user.id).toBe(lower.user.id);
});

test("needsPassword flips once a credential account row exists", async () => {
  const { user } = await resolveOrCreateCustomer({ email: email("pw") });

  expect(await needsPassword(user.id)).toBe(true);

  await db.insert(schema.accounts).values({
    id: `${PREFIX}acct-${user.id}`,
    accountId: `${PREFIX}${user.id}`,
    providerId: "credential",
    userId: user.id,
    password: "hashed-placeholder",
  });

  expect(await needsPassword(user.id)).toBe(false);
});

test("a non-credential provider row does not satisfy needsPassword", async () => {
  const { user } = await resolveOrCreateCustomer({ email: email("oauth") });

  await db.insert(schema.accounts).values({
    id: `${PREFIX}acct-oauth-${user.id}`,
    accountId: `${PREFIX}oauth-${user.id}`,
    providerId: "github",
    userId: user.id,
  });

  expect(await needsPassword(user.id)).toBe(true);
});
