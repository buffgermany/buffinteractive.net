# Account-Backed Offers & Auth Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link every contract and offer to a real customer account, delivered by magic link, so a customer can log in and a dashboard has something to query.

**Architecture:** Sales sends an offer from `/sales/order`. A new Next route handler in `apps/web` resolves-or-creates the customer account, mints a Better Auth magic link, and hands the resulting login URL to the existing `apps/api` invite endpoint, which stores `customerUserId` and sends its existing branded offer email with the magic link as the button. The customer clicks, is logged in, is forced through a set-password screen, then signs. The signed contract inherits `customerUserId`.

**Tech Stack:** Bun workspaces + Turborepo · Next.js 15 (App Router, `apps/web`) · ElysiaJS on Bun (`apps/api`) · Drizzle ORM + PostgreSQL (`packages/db`) · Better Auth 1.2 (`magicLink` plugin, already in `node_modules`) · Resend · Tailwind v4 · framer-motion · `bun test`

**Spec:** `docs/superpowers/specs/2026-09-07-account-backed-offers-design.md` — read it before starting. This plan does not re-argue its decisions.

---

## Global Constraints

Every task's requirements implicitly include this section.

- **`customerUserId` is nullable on both contract tables.** Rows predating this change have no account and must keep working.
- **`salesUserId` is the seller. `customerUserId` is the buyer.** Never conflate them. `salesUserId` is not modified by any task in this plan.
- **One email.** The offer email and the login link are the same message. Do not add a second "your account is ready" email.
- **Admin-only means `session.user.role === "admin"`.** The `users.role` enum is `'user' | 'admin'`; there is no `sales` role. Do not add one.
- **Accounts are per-person.** No organizations, no membership tables. Company data lives in flat columns on `users` and on the contract.
- **German user-facing copy.** All customer- and sales-facing strings in this codebase are German (informal "Du"). Error messages returned from API routes are German. Code, comments, and commit messages are English.
- **Design tokens:** background `#0A0A0A`, primary `#CCFF00`, muted text `#A0A0B0`, surface `#2C2C2C`. Prefer the semantic Tailwind tokens (`bg-background`, `text-primary`) where surrounding code already uses them; match the literal hex where surrounding code uses literals.
- **No new runtime dependencies** except `resend` in `apps/web`. `better-auth` already ships the `magicLink` plugin.
- **Run commands from the repo root** unless a step says otherwise. Scripts need `--env-file=.env` to see `DATABASE_URL`.

---

## File Structure

**Created:**

| Path | Responsibility |
|------|----------------|
| `apps/web/src/lib/magic-link-capture.ts` | `AsyncLocalStorage` channel that lets a caller intercept a magic link URL instead of emailing it |
| `apps/web/src/lib/mail.ts` | Resend sender + branded HTML shell for *auth* email only |
| `apps/web/src/lib/account.ts` | `needsPassword()`, `resolveOrCreateCustomer()`, `requireAdmin()` |
| `apps/web/src/lib/account.test.ts` | The one test file for this plan |
| `apps/web/src/app/api/sales/customers/route.ts` | `GET ?q=` account search for the picker |
| `apps/web/src/app/api/sales/invite/route.ts` | `POST` orchestrator: account → magic link → `apps/api` |
| `apps/web/src/app/(auth)/auth/set-password/page.tsx` | Mandatory first-landing password screen |
| `apps/web/src/app/(auth)/auth/set-password/SetPasswordForm.tsx` | Its client form |
| `apps/web/src/app/api/auth/set-password/route.ts` | `POST` — sets the password for the current session |
| `apps/web/src/components/sales/CustomerPicker.tsx` | Search-existing-or-create-new combobox for step 0 |
| `apps/web/src/app/(auth)/auth/_components/AuthFields.tsx` | Shared email/password/name/company inputs for the three auth modes |
| `packages/db/backfill_customer_user_id.ts` | One-time email→account backfill |

**Modified:**

| Path | Change |
|------|--------|
| `packages/db/src/schema/users.ts` | `+ company`, `+ phone` |
| `packages/db/src/schema/contracts.ts` | `+ customerUserId` + index on both tables |
| `apps/web/src/lib/auth.ts` | `magicLink` plugin |
| `apps/web/src/lib/auth-client.ts` | `magicLinkClient` plugin |
| `apps/web/package.json` | `+ resend`, `+ test` script |
| `apps/api/src/routes/contracts.ts` | `create-invite` accepts `customerUserId`/`loginUrl`; `sign-remote` propagates |
| `apps/web/src/app/(dashboard)/layout.tsx` | Password gate |
| `apps/web/src/app/sales/order/page.tsx` | Admin gate |
| `apps/web/src/app/sales/order/sign/[token]/page.tsx` | Session ownership check |
| `apps/web/src/app/sales/order/OrderFormFlow.tsx` | Picker in step 0; post to `/api/sales/invite` |
| `apps/web/src/app/(auth)/auth/page.tsx` | Three modes; signup enabled |

`auth/page.tsx` is 359 lines whose login and signup branches duplicate every input. Task 10 extracts the shared fields into `AuthFields.tsx` rather than adding a third copy. This is scoped to the file being changed.

---

## Task 1: Schema — customer identity columns

**Files:**
- Modify: `packages/db/src/schema/users.ts:8-22`
- Modify: `packages/db/src/schema/contracts.ts:16-73` and `:82-129`
- Create: `packages/db/migrations/0004_*.sql` (generated)

**Interfaces:**
- Produces: `schema.users.company`, `schema.users.phone` (both `text | null`); `schema.contracts.customerUserId`, `schema.contractSigningRequests.customerUserId` (both `text | null`, FK → `users.id`, `onDelete: "set null"`).

- [ ] **Step 1: Add company and phone to users**

In `packages/db/src/schema/users.ts`, inside the `users` table definition, after the `image` column:

```ts
  image: text("image"),
  company: text("company"),
  phone: text("phone"),
```

- [ ] **Step 2: Add customerUserId to contracts**

In `packages/db/src/schema/contracts.ts`, in the `contracts` table, immediately after the `salesUserId` block inside the `// Audit-Trail` section:

```ts
  salesUserId: text("sales_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  // The customer who signed. Nullable: rows predating account-backed offers
  // have no linked account and stay invisible to dashboard queries.
  customerUserId: text("customer_user_id")
    .references(() => users.id, { onDelete: "set null" }),
```

- [ ] **Step 3: Add customerUserId to contract_signing_requests**

Same file, in `contractSigningRequests`, immediately after its `salesUserId` block:

```ts
  salesUserId: text("sales_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  customerUserId: text("customer_user_id")
    .references(() => users.id, { onDelete: "set null" }),
```

- [ ] **Step 4: Add the indexes**

Neither table currently has an index config array. Add one to each by giving the `pgTable` call a third argument. For `contracts`, change the closing `});` of the table to:

```ts
}, (table) => [
  index("contracts_customer_user_id_idx").on(table.customerUserId),
]);
```

For `contractSigningRequests`, change its closing `});` to:

```ts
}, (table) => [
  index("csr_customer_user_id_idx").on(table.customerUserId),
  index("csr_token_idx").on(table.token),
]);
```

Add `index` to the import at the top of the file:

```ts
import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  decimal,
  integer,
  index
} from "drizzle-orm/pg-core";
```

- [ ] **Step 5: Generate the migration**

Run: `bun run db:generate`

Expected: drizzle-kit prints the new columns and writes `packages/db/migrations/0004_<name>.sql`. Open that file and confirm it contains `ADD COLUMN "customer_user_id"` for both tables, `ADD COLUMN "company"` and `ADD COLUMN "phone"` for users, and no `DROP` statements. If it proposes dropping anything, stop and report — the schema drifted from the migrations.

- [ ] **Step 6: Apply the migration**

Run: `bun run db:migrate`

Expected: exits 0. Verify:

```bash
bun run --env-file=.env -e "import postgres from 'postgres'; const sql = postgres(process.env.DATABASE_URL); console.log(await sql\`select column_name from information_schema.columns where table_name='contracts' and column_name='customer_user_id'\`); await sql.end();"
```

Expected: one row, `customer_user_id`.

- [ ] **Step 7: Typecheck and commit**

Run: `bun run typecheck`
Expected: PASS

```bash
git add packages/db/src/schema/users.ts packages/db/src/schema/contracts.ts packages/db/migrations
git commit -m "feat(db): link contracts and signing requests to customer accounts"
```

---

## Task 2: Account helpers + the test

**Files:**
- Create: `apps/web/src/lib/account.ts`
- Create: `apps/web/src/lib/account.test.ts`
- Modify: `apps/web/package.json` (add `test` script)

**Interfaces:**
- Consumes: `schema.users`, `schema.accounts` (Task 1).
- Produces:
  - `needsPassword(userId: string): Promise<boolean>`
  - `resolveOrCreateCustomer(input: { email: string; name?: string | null; company?: string | null; phone?: string | null }): Promise<{ user: User; created: boolean }>`
  - `requireAdmin(): Promise<Session["user"]>` — throws `AdminRequiredError` when there is no session or the role is not admin.
  - `class AdminRequiredError extends Error`

- [ ] **Step 1: Add the test script**

In `apps/web/package.json`, add to `scripts`:

```json
    "test": "bun run --env-file=../../.env test",
```

- [ ] **Step 2: Write the failing test**

Create `apps/web/src/lib/account.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test and verify it fails**

Run: `cd apps/web && bun test src/lib/account.test.ts`

Expected: FAIL — `Cannot find module './account'`. If instead it fails on `DATABASE_URL is not configured`, the env file is not loading; run `bun run --env-file=../../.env test src/lib/account.test.ts` from `apps/web`.

- [ ] **Step 4: Export `like` from the db package**

`packages/db/src/index.ts:60` re-exports Drizzle operators but not `like`. Add it:

```ts
export { eq, and, or, not, desc, asc, sql, inArray, isNull, isNotNull, like, ilike } from "drizzle-orm";
```

- [ ] **Step 5: Write the implementation**

Create `apps/web/src/lib/account.ts`:

```ts
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
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `cd apps/web && bun test src/lib/account.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/account.ts apps/web/src/lib/account.test.ts apps/web/package.json packages/db/src/index.ts
git commit -m "feat(auth): add account resolution and password-gate helpers"
```

---

## Task 3: Magic link plugin and auth mail

**Files:**
- Create: `apps/web/src/lib/magic-link-capture.ts`
- Create: `apps/web/src/lib/mail.ts`
- Modify: `apps/web/src/lib/auth.ts:11-52`
- Modify: `apps/web/src/lib/auth-client.ts:14-20`
- Modify: `apps/web/package.json`

**Interfaces:**
- Produces:
  - `magicLinkCapture: AsyncLocalStorage<{ url?: string }>`
  - `sendAuthEmail(opts: { to: string; subject: string; heading: string; bodyHtml: string; ctaLabel: string; ctaUrl: string }): Promise<void>`
  - Server: `auth.api.signInMagicLink({ body: { email, callbackURL }, headers })`
  - Client: `authClient.signIn.magicLink({ email, callbackURL })`

**Why the capture channel:** the spec requires ONE email — the offer mail *is* the login mail, and it is composed and sent by `apps/api`. Better Auth only hands the magic link URL to its `sendMagicLink` callback. `AsyncLocalStorage` (Node stdlib) lets the invite route run the mint inside a scope that captures the URL and suppresses the send, with no module-level mutable state and no cross-request races.

- [ ] **Step 1: Add resend to the web app**

Run: `cd apps/web && bun add resend`
Expected: `resend` appears in `apps/web/package.json` dependencies.

- [ ] **Step 2: Create the capture channel**

Create `apps/web/src/lib/magic-link-capture.ts`:

```ts
import { AsyncLocalStorage } from "node:async_hooks";

/**
 * When a magic link is minted inside `magicLinkCapture.run({}, ...)`,
 * `sendMagicLink` writes the URL into the store and sends no email —
 * the caller embeds the URL in its own message instead.
 *
 * Outside such a scope the store is undefined and mail is sent normally.
 */
export const magicLinkCapture = new AsyncLocalStorage<{ url?: string }>();

/** Mints inside a capture scope and returns the URL that would have been mailed. */
export async function captureMagicLink(
  mint: () => Promise<unknown>
): Promise<string> {
  const store: { url?: string } = {};
  await magicLinkCapture.run(store, mint);
  if (!store.url) throw new Error("Magic-Link konnte nicht erzeugt werden.");
  return store.url;
}
```

- [ ] **Step 3: Create the auth mailer**

Create `apps/web/src/lib/mail.ts`:

```ts
import { Resend } from "resend";

// Web sends AUTH mail (magic link, password). apps/api sends CONTRACT mail.
// Two senders, two concerns — deliberately not a shared abstraction.

const FROM = "Buff <login@no-reply.buffinteractive.net>";

let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env["RESEND_API_KEY"];
  cached = key ? new Resend(key) : null;
  if (!cached) {
    console.warn("[mail] RESEND_API_KEY not set — auth email will be logged, not sent.");
  }
  return cached;
}

export type AuthEmail = {
  to: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
};

function shell(e: AuthEmail): string {
  return `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 40px 24px; text-align: left; border-radius: 20px;">
      <h2 style="color: #CCFF00; margin: 0 0 40px 0; font-size: 20px;">Buff Interactive</h2>
      <h1 style="font-size: 26px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">${e.heading}</h1>
      <div style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">${e.bodyHtml}</div>
      <div style="text-align: center; margin: 36px 0;">
        <a href="${e.ctaUrl}" style="display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 12px; text-decoration: none;">${e.ctaLabel}</a>
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: #86868B; margin: 32px 0 0 0; text-align: center;">
        Falls der Button nicht funktioniert, kopiere diesen Link in Deinen Browser:<br>
        <a href="${e.ctaUrl}" style="color: #CCFF00; word-break: break-all;">${e.ctaUrl}</a>
      </p>
    </div>
  </div>`;
}

export async function sendAuthEmail(e: AuthEmail): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[mail] would send "${e.subject}" to ${e.to}: ${e.ctaUrl}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: e.to,
      subject: e.subject,
      html: shell(e),
    });
  } catch (err) {
    // Matches the existing contract-mail behaviour: a send failure must not
    // roll back the action that triggered it.
    console.error("[mail] send failed:", err);
  }
}
```

- [ ] **Step 4: Register the plugin on the server**

In `apps/web/src/lib/auth.ts`, add the imports:

```ts
import { magicLink } from "better-auth/plugins";
import { magicLinkCapture } from "./magic-link-capture";
import { sendAuthEmail } from "./mail";
```

Then add a `plugins` array to the `betterAuth({...})` config, after the `user` block and before `trustedOrigins`:

```ts
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
```

- [ ] **Step 5: Register the plugin on the client**

In `apps/web/src/lib/auth-client.ts`, add to the imports and the `plugins` array:

```ts
import { inferAdditionalFields, magicLinkClient } from "better-auth/client/plugins";
```

```ts
  plugins: [
    inferAdditionalFields<Auth>(),
    magicLinkClient(),
  ],
```

- [ ] **Step 6: Typecheck**

Run: `bun run typecheck`
Expected: PASS. If `signInMagicLink` is reported as missing later, it is because the plugin was not added to the *server* instance — the server `auth.api` surface is what types it.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/magic-link-capture.ts apps/web/src/lib/mail.ts apps/web/src/lib/auth.ts apps/web/src/lib/auth-client.ts apps/web/package.json bun.lockb
git commit -m "feat(auth): add magic link plugin and auth mailer"
```

---

## Task 4: API accepts and propagates customerUserId

**Files:**
- Modify: `apps/api/src/routes/contracts.ts` — `create-invite` handler (~line 550), its `body` schema (~line 745), and `sign-remote` (~line 828)

**Interfaces:**
- Consumes: `contractSigningRequests.customerUserId`, `contracts.customerUserId` (Task 1).
- Produces: `POST /v1/contracts/create-invite` additionally accepts `customerUserId?: string` and `loginUrl?: string`; `POST /v1/contracts/sign-remote` writes `invite.customerUserId` onto the created contract.

- [ ] **Step 1: Accept the two new fields**

In the `create-invite` handler, add both names to the destructuring of `body` (alongside `salesUserId` and `clientOrigin`):

```ts
          salesUserId,
          clientOrigin,
          customerUserId,
          loginUrl
```

And to its `body: t.Object({ ... })` validator, next to `clientOrigin`:

```ts
        clientOrigin: t.Optional(t.String()),
        customerUserId: t.Optional(t.String()),
        loginUrl: t.Optional(t.String())
```

- [ ] **Step 2: Store customerUserId on the invite**

In the same handler, in the `db.insert(contractSigningRequests).values({...})` call, add after `salesUserId: finalSalesUserId,`:

```ts
            customerUserId: customerUserId ?? null,
```

- [ ] **Step 3: Point the email button at the login URL**

Still in `create-invite`, immediately after the existing `signingUrl` assignment:

```ts
        const webUrl = getWebBaseUrl(headers as Record<string, string | undefined>, clientOrigin);
        const signingUrl = `${webUrl}/sales/order/sign/${token}`;

        // When the caller minted a magic link, the email button logs the
        // customer in and lands them on the signing page — one email, not two.
        const emailCtaUrl = loginUrl || signingUrl;
```

Then in the email HTML, replace **all three** occurrences of `${signingUrl}` with `${emailCtaUrl}`: the button `href`, the fallback `<a href=...>`, and the visible link text. Leave the returned `signingUrl` in the JSON response as-is — sales still copies the raw signing link from the UI.

- [ ] **Step 4: Propagate to the signed contract**

In `sign-remote`, in the `db.insert(contracts).values({...})` call, add next to `salesUserId: finalSalesUserId,`:

```ts
            customerUserId: invite.customerUserId ?? null,
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 6: Verify the endpoint still accepts an old-shaped request**

Start the API (`bun run dev` at the root, or `cd apps/api && bun run dev`), then:

```bash
curl -s -X POST http://localhost:3001/v1/contracts/create-invite \
  -H 'Content-Type: application/json' \
  -d '{"tarif":"essential","zahlungsrhythmus":"monatlich","setupPreisBrutto":100,"laufendPreisBrutto":50,"customerEmail":"planttest-api@example.test","salesUserId":"nonexistent"}'
```

Expected: `{"success":true,"token":"...","signingUrl":"...","inviteId":"..."}`. Both new fields are optional, so the pre-existing request shape still works. Clean up: `delete from contract_signing_requests where customer_email like 'planttest-%';`

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/routes/contracts.ts
git commit -m "feat(api): carry customerUserId from invite to signed contract"
```

---

## Task 5: Sales routes — customer search and invite orchestration

**Files:**
- Create: `apps/web/src/app/api/sales/customers/route.ts`
- Create: `apps/web/src/app/api/sales/invite/route.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `resolveOrCreateCustomer`, `AdminRequiredError` (Task 2); `captureMagicLink` (Task 3); `POST /v1/contracts/create-invite` (Task 4).
- Produces:
  - `GET /api/sales/customers?q=<string>` → `{ customers: Array<{ id, email, name, company }> }`
  - `POST /api/sales/invite` → `{ success: true, token, signingUrl, customerUserId, accountCreated }` or `{ success: false, error }`

- [ ] **Step 1: Write the customer search route**

Create `apps/web/src/app/api/sales/customers/route.ts`:

```ts
import { NextResponse } from "next/server";
import { db, schema, or, ilike } from "@platform/db";
import { requireAdmin, AdminRequiredError } from "@/lib/account";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ customers: [] });

  const needle = `%${q}%`;
  const customers = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      company: schema.users.company,
    })
    .from(schema.users)
    .where(
      or(
        ilike(schema.users.email, needle),
        ilike(schema.users.name, needle),
        ilike(schema.users.company, needle)
      )
    )
    .limit(10);

  return NextResponse.json({ customers });
}
```

- [ ] **Step 2: Write the invite orchestration route**

Create `apps/web/src/app/api/sales/invite/route.ts`:

```ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureMagicLink } from "@/lib/magic-link-capture";
import {
  requireAdmin,
  resolveOrCreateCustomer,
  AdminRequiredError,
} from "@/lib/account";

export const dynamic = "force-dynamic";

/**
 * Orchestrates an offer send:
 *   1. resolve or create the customer account
 *   2. mint a magic link that lands on the signing page
 *   3. hand both to apps/api, which stores the invite and sends ONE email
 */
export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    throw err;
  }

  const body = await request.json();
  const customerEmail: string = (body.customerEmail ?? "").trim();

  if (!customerEmail.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Bitte gib eine gültige Kunden-E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  let customer;
  let accountCreated = false;
  try {
    const resolved = await resolveOrCreateCustomer({
      email: customerEmail,
      name: body.ansprechpartner || body.customerName || null,
      company: body.firma || body.companyName || null,
      phone: body.telefon || null,
    });
    customer = resolved.user;
    accountCreated = resolved.created;
  } catch (err) {
    console.error("[sales/invite] account resolution failed:", err);
    return NextResponse.json(
      { success: false, error: "Kundenkonto konnte nicht angelegt werden." },
      { status: 500 }
    );
  }

  const apiUrl = process.env["API_URL"] ?? process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

  // apps/api owns the token, so ask it for the invite first, then mint a
  // magic link pointing at that token's signing page.
  const inviteRes = await fetch(`${apiUrl}/v1/contracts/create-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      customerEmail,
      customerUserId: customer.id,
      salesUserId: admin.id,
      // No loginUrl yet: the first call only reserves the token. It sends the
      // plain signing link, which is why sendEmail is suppressed below.
      suppressEmail: true,
    }),
  });

  const invite = await inviteRes.json();
  if (!inviteRes.ok || !invite.success) {
    return NextResponse.json(
      { success: false, error: invite.error ?? "Fehler beim Erstellen des Signatur-Links." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    token: invite.token,
    signingUrl: invite.signingUrl,
    customerUserId: customer.id,
    accountCreated,
  });
}
```

**Note for Step 3:** the above has a deliberate ordering problem — the magic link needs the token, but the token only exists after `apps/api` has already sent its email. Step 3 fixes it.

- [ ] **Step 3: Fix the ordering with a two-phase send**

The token must exist before the magic link can point at it, but the email must contain the magic link. Resolve it by making `apps/api` skip sending when asked, and having the web route send nothing itself — instead it calls `create-invite` once with a `loginUrl` it can compute up front, because **the magic link's `callbackURL` is what carries the token, and the token is generated by `apps/api`.**

The simplest correct order: generate the token in the **web** route, pass it to `apps/api`, and let `apps/api` use the given token instead of inventing one.

In `apps/api/src/routes/contracts.ts` `create-invite`, change the token line:

```ts
        const token = body.token ?? crypto.randomBytes(32).toString("hex");
```

and add to the body validator:

```ts
        token: t.Optional(t.String()),
```

Then in `apps/web/src/app/api/sales/invite/route.ts`, replace the `const apiUrl ...` block through the end of the function with:

```ts
  const apiUrl = process.env["API_URL"] ?? process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  const origin = process.env["NEXT_PUBLIC_WEB_URL"] ?? new URL(request.url).origin;

  // Generate the token here so the magic link can point at the signing page
  // before the invite row exists.
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const signingUrl = `${origin}/sales/order/sign/${token}`;

  let loginUrl: string;
  try {
    loginUrl = await captureMagicLink(() =>
      auth.api.signInMagicLink({
        body: { email: customer.email, callbackURL: signingUrl },
        headers: await headers(),
      })
    );
  } catch (err) {
    console.error("[sales/invite] magic link mint failed:", err);
    return NextResponse.json(
      { success: false, error: "Login-Link konnte nicht erzeugt werden." },
      { status: 500 }
    );
  }

  const inviteRes = await fetch(`${apiUrl}/v1/contracts/create-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      token,
      customerEmail,
      customerUserId: customer.id,
      salesUserId: admin.id,
      loginUrl,
      clientOrigin: origin,
    }),
  });

  const invite = await inviteRes.json();
  if (!inviteRes.ok || !invite.success) {
    return NextResponse.json(
      { success: false, error: invite.error ?? "Fehler beim Erstellen des Signatur-Links." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    token: invite.token,
    signingUrl: invite.signingUrl ?? signingUrl,
    customerUserId: customer.id,
    accountCreated,
  });
}
```

Add `import crypto from "node:crypto";` at the top of the file, and delete the `suppressEmail: true` line and the stale comment from Step 2.

- [ ] **Step 4: Typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Verify admin gating**

With the web app running and **logged out**:

```bash
curl -s -o /dev/null -w '%{http_code}\n' 'http://localhost:3000/api/sales/customers?q=test'
```

Expected: `403`

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/api/sales apps/api/src/routes/contracts.ts
git commit -m "feat(sales): resolve customer accounts and mint magic links on invite"
```

---

## Task 6: Set-password gate

**Files:**
- Create: `apps/web/src/app/(auth)/auth/set-password/page.tsx`
- Create: `apps/web/src/app/(auth)/auth/set-password/SetPasswordForm.tsx`
- Create: `apps/web/src/app/api/auth/set-password/route.ts`
- Modify: `apps/web/src/app/(dashboard)/layout.tsx:14-20`

**Interfaces:**
- Consumes: `needsPassword` (Task 2).
- Produces: route `/auth/set-password?next=<path>`; `POST /api/auth/set-password` with `{ password: string }`.

- [ ] **Step 1: Write the set-password API route**

Create `apps/web/src/app/api/auth/set-password/route.ts`:

```ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders }).catch(() => null);

  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { password } = await request.json();

  if (typeof password !== "string" || password.length < 10) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 10 Zeichen lang sein." },
      { status: 400 }
    );
  }

  try {
    await auth.api.setPassword({
      body: { newPassword: password },
      headers: requestHeaders,
    });
  } catch (err) {
    console.error("[set-password] failed:", err);
    return NextResponse.json(
      { error: "Passwort konnte nicht gesetzt werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Write the form**

Create `apps/web/src/app/(auth)/auth/set-password/SetPasswordForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const INPUT =
  "w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300";

export function SetPasswordForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 10 && password === confirm && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error ?? "Passwort konnte nicht gesetzt werden.");
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
          Passwort
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Mindestens 10 Zeichen"
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
            title={show ? "Passwort verbergen" : "Passwort anzeigen"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {tooShort && (
          <span className="text-red-500 text-[10px] ml-1">
            Mindestens 10 Zeichen.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
          Passwort bestätigen
        </label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          placeholder="Passwort wiederholen"
          className={INPUT}
        />
        {mismatch && (
          <span className="text-red-500 text-[10px] ml-1">
            Die Passwörter stimmen nicht überein.
          </span>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Passwort speichern"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Write the page**

Create `apps/web/src/app/(auth)/auth/set-password/page.tsx`:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { needsPassword } from "@/lib/account";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Passwort festlegen" };

/** Only relative paths are honoured, so `next` cannot become an open redirect. */
function safeNext(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(rawNext);

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect(`/auth?from=${encodeURIComponent(next)}`);

  // Already has a password — nothing to do here.
  if (!(await needsPassword(session.user.id))) redirect(next);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A] px-4 py-24">
      <div
        className="absolute inset-0 z-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(26, 16, 37, 0.8) 0%, rgba(10, 10, 10, 1) 50%)",
        }}
      />
      <div className="relative z-10 max-w-md w-full bg-[#2C2C2C]/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-3xl font-heading font-bold text-white mb-3 tracking-tight">
          Leg Dein Passwort fest
        </h1>
        <p className="text-sm text-[#A0A0B0] leading-relaxed mb-8">
          Du bist angemeldet als <span className="text-white">{session.user.email}</span>.
          Bevor es weitergeht, vergib bitte ein Passwort für Dein Konto.
        </p>
        <SetPasswordForm next={next} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add the gate to the dashboard layout**

In `apps/web/src/app/(dashboard)/layout.tsx`, add the import:

```ts
import { needsPassword } from "@/lib/account";
```

and extend the existing session check:

```ts
  if (!session) {
    redirect("/auth?from=/dashboard");
  }

  if (await needsPassword(session.user.id)) {
    redirect("/auth/set-password?next=/dashboard");
  }
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 6: Verify the gate by hand**

Create a passwordless user, then visit `/dashboard` logged in as them:

```bash
bun run --env-file=.env -e "
import { resolveOrCreateCustomer } from './apps/web/src/lib/account';
const r = await resolveOrCreateCustomer({ email: 'planttest-gate@example.test', name: 'Gate Test' });
console.log(r.user.id, r.created);
process.exit(0);
"
```

Expected: a user id and `true`. Sign in as that user via a magic link from `/auth`, then hit `/dashboard`. Expected: redirect to `/auth/set-password?next=/dashboard`. Set a password. Expected: land on `/dashboard`, and revisiting `/auth/set-password` redirects straight through.

Clean up: `delete from users where email like 'planttest-%';`

- [ ] **Step 7: Commit**

```bash
git add "apps/web/src/app/(auth)/auth/set-password" apps/web/src/app/api/auth/set-password "apps/web/src/app/(dashboard)/layout.tsx"
git commit -m "feat(auth): mandatory set-password screen on first landing"
```

---

## Task 7: Lock down the signing page and the sales page

**Files:**
- Modify: `apps/web/src/app/sales/order/page.tsx:9-18`
- Modify: `apps/web/src/app/sales/order/sign/[token]/page.tsx:32-52`
- Modify: `apps/api/src/routes/contracts.ts` — `GET /contracts/invite/:token` response

**Interfaces:**
- Consumes: `needsPassword` (Task 2), `invite.customerUserId` (Task 1).
- Produces: `GET /v1/contracts/invite/:token` additionally returns `customerUserId: string | null`.

- [ ] **Step 1: Expose customerUserId on the invite lookup**

In `apps/api/src/routes/contracts.ts`, in the `GET /contracts/invite/:token` handler, add to the returned `invite` object next to `salesUserId`:

```ts
          salesUserId: invite.salesUserId,
          customerUserId: invite.customerUserId,
```

- [ ] **Step 2: Add the field to the client type**

In `apps/web/src/components/sales/RemoteOrderFormFlow.tsx`, add to the `RemoteInviteData` interface:

```ts
  customerUserId?: string | null;
```

- [ ] **Step 3: Gate the sales page on admin**

In `apps/web/src/app/sales/order/page.tsx`, replace the existing session check:

```ts
  if (!session?.user) {
    redirect("/auth");
  }
```

with:

```ts
  // Public signup is open, so a session alone is not authorisation — anyone
  // who registers would otherwise reach the contract sender.
  if (!session?.user) {
    redirect("/auth?from=/sales/order");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }
```

- [ ] **Step 4: Require the matching session on the signing page**

In `apps/web/src/app/sales/order/sign/[token]/page.tsx`, add the imports:

```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { needsPassword } from "@/lib/account";
```

Then, after `inviteData` has been fetched and the `if (!inviteData)` error branch, insert:

```tsx
  // Invites minted before account-backed offers have no customerUserId and
  // keep the old anonymous token behaviour so nothing in flight breaks.
  if (inviteData.customerUserId) {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);

    const signingPath = `/sales/order/sign/${token}`;

    if (!session?.user) {
      redirect(`/auth?from=${encodeURIComponent(signingPath)}`);
    }

    if (session.user.id !== inviteData.customerUserId) {
      return (
        <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
          <div className="w-full max-w-2xl mx-auto py-12 px-4 relative z-10">
            <Card className="border-2 border-destructive/40 shadow-xl text-center py-8">
              <CardHeader className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold">Dieses Angebot gehört zu einem anderen Konto</CardTitle>
                <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                  Du bist als <span className="text-foreground font-medium">{session.user.email}</span> angemeldet.
                  Melde Dich mit dem Konto an, an das dieses Angebot geschickt wurde.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <a
                  href={`/auth?from=${encodeURIComponent(signingPath)}`}
                  className="inline-block bg-primary text-primary-foreground font-bold uppercase tracking-wider px-6 py-3 rounded-xl"
                >
                  Konto wechseln
                </a>
              </CardContent>
            </Card>
          </div>
        </main>
      );
    }

    if (await needsPassword(session.user.id)) {
      redirect(`/auth/set-password?next=${encodeURIComponent(signingPath)}`);
    }
  }
```

- [ ] **Step 5: Typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 6: Verify both gates**

1. Logged out, open a signing link for an invite that has a `customerUserId`. Expected: redirect to `/auth?from=...`.
2. Logged in as a *different* user, open the same link. Expected: the "gehört zu einem anderen Konto" card.
3. Open a legacy invite (`update contract_signing_requests set customer_user_id = null where token = '<t>';`) while logged out. Expected: the signing form renders as before.
4. Logged in as a non-admin, visit `/sales/order`. Expected: redirect to `/dashboard`.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/sales/order apps/web/src/components/sales/RemoteOrderFormFlow.tsx apps/api/src/routes/contracts.ts
git commit -m "feat(sales): bind signing links to their customer account"
```

---

## Task 8: Customer picker in the order form

**Files:**
- Create: `apps/web/src/components/sales/CustomerPicker.tsx`
- Modify: `apps/web/src/app/sales/order/OrderFormFlow.tsx:298-358` and step 0's email field

**Interfaces:**
- Consumes: `GET /api/sales/customers` (Task 5), `POST /api/sales/invite` (Task 5).
- Produces: `<CustomerPicker value={string} onChange={(email: string) => void} onSelect={(c: CustomerHit) => void} />` where `CustomerHit = { id, email, name, company }`.

- [ ] **Step 1: Write the picker**

Create `apps/web/src/components/sales/CustomerPicker.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/primitives";

export type CustomerHit = {
  id: string;
  email: string;
  name: string;
  company: string | null;
};

/**
 * Type an email to search existing accounts. Picking one reuses it;
 * typing an unknown address falls through to creating an account
 * when the invite is sent.
 */
export function CustomerPicker({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (email: string) => void;
  onSelect?: (customer: CustomerHit | null) => void;
}) {
  const [hits, setHits] = useState<CustomerHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<CustomerHit | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (picked && picked.email === value) return;
    if (value.trim().length < 2) {
      setHits([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/sales/customers?q=${encodeURIComponent(value.trim())}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setHits(res.ok ? (data.customers ?? []) : []);
        setOpen(true);
      } catch {
        // aborted or offline — leave the last result set alone
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, picked]);

  function choose(hit: CustomerHit) {
    setPicked(hit);
    setOpen(false);
    onChange(hit.email);
    onSelect?.(hit);
  }

  const isNew = value.trim().length > 2 && value.includes("@") && !picked;

  return (
    <div className="relative">
      <Input
        type="email"
        value={value}
        placeholder="kunde@firma.de"
        onChange={(e) => {
          setPicked(null);
          onSelect?.(null);
          onChange(e.target.value);
        }}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {loading && (
        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      )}

      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-border bg-[#141414] shadow-2xl">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(hit)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="text-sm text-white">{hit.email}</div>
                <div className="text-xs text-[#A0A0B0]">
                  {[hit.name, hit.company].filter(Boolean).join(" · ") || "Kein Name hinterlegt"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked && (
        <p className="mt-2 text-xs text-primary flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          Bestehendes Konto: {picked.name || picked.email}
        </p>
      )}

      {isNew && (
        <p className="mt-2 text-xs text-[#A0A0B0] flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          Neues Konto wird beim Versand angelegt.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Swap the email field in step 0**

In `apps/web/src/app/sales/order/OrderFormFlow.tsx`, import the picker:

```ts
import { CustomerPicker } from "@/components/sales/CustomerPicker";
```

Find step 0's customer email `<Input ... {...register("email")} />` and replace that single input with:

```tsx
                      <CustomerPicker
                        value={watch("email") ?? ""}
                        onChange={(email) => setValue("email", email, { shouldValidate: true })}
                        onSelect={(customer) => {
                          if (!customer) return;
                          if (!watch("ansprechpartner") && customer.name) {
                            setValue("ansprechpartner", customer.name);
                          }
                          if (!watch("firma") && customer.company) {
                            setValue("firma", customer.company);
                          }
                        }}
                      />
```

- [ ] **Step 3: Point the invite send at the new route**

In `handleCreateInvite` (line ~306), replace the `apiUrl` and `fetch` lines:

```ts
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      const res = await fetch(`${apiUrl}/v1/contracts/create-invite`, {
```

with:

```ts
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      // Same-origin: the web route resolves the account and mints the magic
      // link before delegating to apps/api.
      const res = await fetch(`/api/sales/invite`, {
```

Leave the request body untouched — `/api/sales/invite` forwards it verbatim and overrides `salesUserId` with the authenticated admin.

- [ ] **Step 4: Typecheck**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Verify end to end**

As an admin at `/sales/order`: type two characters of a known customer email. Expected: dropdown of matches; picking one shows "Bestehendes Konto" and fills the contact/company fields if blank. Type an unknown address. Expected: "Neues Konto wird beim Versand angelegt." Send the invite. Expected: success panel with the signing URL; a new row in `users`; the invite row carries `customer_user_id`; the delivered email's button URL contains `/api/auth/magic-link/verify`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/sales/CustomerPicker.tsx apps/web/src/app/sales/order/OrderFormFlow.tsx
git commit -m "feat(sales): pick an existing customer account when sending an offer"
```

---

## Task 9: Auth page — three modes, signup enabled

**Files:**
- Create: `apps/web/src/app/(auth)/auth/_components/AuthFields.tsx`
- Modify: `apps/web/src/app/(auth)/auth/page.tsx`

**Interfaces:**
- Consumes: `authClient.signIn.magicLink` (Task 3).
- Produces: `<TextField label name register error type placeholder />`, `<PasswordField label register error show onToggle />`.

- [ ] **Step 1: Extract the shared fields**

Create `apps/web/src/app/(auth)/auth/_components/AuthFields.tsx`:

```tsx
"use client";

import { Eye, EyeOff, AlertCircle } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

const BASE =
  "w-full bg-[#0A0A0A]/50 border rounded-xl py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
      {children}
    </label>
  );
}

export function TextField({
  label,
  type = "text",
  placeholder,
  register,
  error,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        className={`${BASE} px-4 sm:px-5 ${error ? "border-red-500" : "border-white/10"}`}
      />
      {error && <span className="text-red-500 text-[10px] ml-1">{error}</span>}
    </div>
  );
}

export function PasswordField({
  label,
  placeholder,
  register,
  error,
  show,
  onToggle,
}: {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          {...register}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`${BASE} pl-4 sm:pl-5 pr-12 ${error ? "border-red-500" : "border-white/10"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="text-red-500 text-[10px] ml-1">{error}</span>}
    </div>
  );
}

export function ServerError({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SubmitButton({
  children,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
```

- [ ] **Step 2: Enable signup and add the third mode**

In `apps/web/src/app/(auth)/auth/page.tsx`:

Change the mode state and delete the kill switch:

```ts
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'link'>('login');
```

Delete the line `const signupEnabled = false; // Toggle for later switch usage` and the entire `signupEnabled ? (...) : (...)` conditional, keeping the signup form branch and discarding the "coming soon" panel.

- [ ] **Step 3: Replace the two-way toggle with a three-way one**

Replace the toggle block (the two `<button>`s plus the sliding `motion.div`) with:

```tsx
            <div className="flex bg-[#0A0A0A]/50 p-1.5 rounded-full mb-8 relative border border-white/5">
              {(['login', 'signup', 'link'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold z-10 transition-colors duration-300 ${
                    authMode === mode ? 'text-black' : 'text-[#A0A0B0] hover:text-white'
                  }`}
                >
                  {mode === 'login' ? t('toggle_login') : mode === 'signup' ? t('toggle_signup') : 'Login-Link'}
                </button>
              ))}

              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#CCFF00] rounded-full z-0 shadow-lg"
                initial={false}
                animate={{
                  x: authMode === 'login' ? '4px' : authMode === 'signup' ? 'calc(100% + 4px)' : 'calc(200% + 4px)',
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            </div>
```

- [ ] **Step 4: Add the magic-link branch**

Add this state next to the existing hooks:

```ts
  const [linkSent, setLinkSent] = useState(false);
```

Add a `link` branch to the `AnimatePresence` block, as a sibling of the login and signup branches:

```tsx
              ) : authMode === 'link' ? (
                <motion.div
                  key="link-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {linkSent ? (
                    <div className="py-8 px-6 bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl text-center text-[#CCFF00]">
                      <p className="text-lg font-bold tracking-tight mb-2">Link ist unterwegs</p>
                      <p className="text-sm opacity-80 leading-relaxed">
                        Falls ein Konto mit dieser Adresse existiert, findest Du gleich einen Login-Link in Deinem Postfach.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(async (data) => {
                        setIsSubmitting(true);
                        setServerError(null);
                        await signIn.magicLink({ email: data.email, callbackURL: redirectTo });
                        // Always report success: revealing whether an account
                        // exists would turn this form into an email oracle.
                        setLinkSent(true);
                        setIsSubmitting(false);
                      })}
                      noValidate
                      className="flex flex-col gap-5"
                    >
                      {serverError && <ServerError message={serverError} />}
                      <p className="text-sm text-[#A0A0B0] leading-relaxed">
                        Wir schicken Dir einen Link, mit dem Du Dich ohne Passwort anmeldest.
                      </p>
                      <TextField
                        label={t('email_label')}
                        type="email"
                        placeholder={t('email_placeholder')}
                        register={register("email")}
                        error={errors.email?.message as string | undefined}
                      />
                      <div className="pt-4">
                        <SubmitButton disabled={isSubmitting} loading={isSubmitting}>
                          Login-Link senden
                        </SubmitButton>
                      </div>
                    </form>
                  )}
                </motion.div>
```

Import what the branch uses:

```ts
import { TextField, PasswordField, ServerError, SubmitButton } from "./_components/AuthFields";
import { signIn, signUp } from "@/lib/auth-client";
```

Add `link` to the resolver switch so the magic-link mode only validates the email:

```ts
  const linkSchema = z.object({
    email: z.string().email({ message: t('error_invalid_email') }),
  });
```

```ts
    resolver: zodResolver(
      authMode === 'login' ? loginSchema : authMode === 'signup' ? signupSchema : linkSchema
    ) as any,
```

Reset `linkSent` alongside the existing mode-change reset:

```ts
  useEffect(() => {
    reset();
    setServerError(null);
    setLinkSent(false);
  }, [authMode, reset]);
```

- [ ] **Step 5: Persist company on signup**

In `onFormSubmit`'s signup branch, the `company` field is collected but discarded. Send it through so `users.company` is populated:

```ts
            const { error } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                company: data.company || undefined,
                callbackURL: redirectTo
            });
```

For Better Auth to accept it, add `company` to the `user.additionalFields` block in `apps/web/src/lib/auth.ts`:

```ts
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Users cannot set their own role
      },
      company: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
```

- [ ] **Step 6: Add the toggle string to all three locales**

The toggle labels come from `next-intl`. There are three locale files, each with an `Auth` namespace at line ~52. Add `toggle_link` beside `toggle_signup` in every one:

`apps/web/messages/de.json`:

```json
    "toggle_login": "Sign In",
    "toggle_signup": "Sign Up",
    "toggle_link": "Login-Link",
```

`apps/web/messages/en.json`:

```json
    "toggle_link": "Login link",
```

`apps/web/messages/es.json`:

```json
    "toggle_link": "Enlace de acceso",
```

Then replace the hardcoded `'Login-Link'` in the toggle map from Step 3 with `t('toggle_link')`.

Also delete the now-dead `signup_disabled_title` and `signup_disabled_description` keys from all three files — Step 2 removed their only consumer.

- [ ] **Step 7: Typecheck and verify**

Run: `bun run typecheck`
Expected: PASS

By hand at `/auth`: all three tabs switch with the pill animating to the right third. Signup creates an account and lands on `/dashboard` with no password gate (signup writes a credential row). "Login-Link" reports success for both a known and an unknown address, and delivers mail only for the known one.

- [ ] **Step 8: Commit**

```bash
git add "apps/web/src/app/(auth)/auth" apps/web/src/lib/auth.ts
git commit -m "feat(auth): open signup and add magic-link sign-in mode"
```

---

## Task 10: Backfill existing contracts

**Files:**
- Create: `packages/db/backfill_customer_user_id.ts`

**Interfaces:**
- Consumes: `contracts.customer_user_id`, `users.email` (Task 1).
- Produces: nothing importable — a one-shot script.

- [ ] **Step 1: Write the script**

Create `packages/db/backfill_customer_user_id.ts`, following the existing `apply_marketing_migration.ts` pattern:

```ts
import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL fehlt (erwartet in ../../.env). Backfill abgebrochen.");
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });
const dryRun = !process.argv.includes("--apply");

async function run() {
  console.log(dryRun ? "DRY RUN — pass --apply to write." : "Applying backfill...");

  const contractMatches = await sql`
    select c.id, c.email, u.id as user_id
    from contracts c
    join users u on lower(u.email) = lower(c.email)
    where c.customer_user_id is null
  `;

  const inviteMatches = await sql`
    select r.id, r.customer_email, u.id as user_id
    from contract_signing_requests r
    join users u on lower(u.email) = lower(r.customer_email)
    where r.customer_user_id is null
  `;

  console.log(`contracts to link:         ${contractMatches.length}`);
  console.log(`signing requests to link:  ${inviteMatches.length}`);

  const [{ count: orphanContracts }] = await sql`
    select count(*)::int as count from contracts c
    where c.customer_user_id is null
      and not exists (select 1 from users u where lower(u.email) = lower(c.email))
  `;
  console.log(`contracts with no matching account (left null): ${orphanContracts}`);

  if (dryRun) {
    process.exit(0);
  }

  await sql`
    update contracts c
    set customer_user_id = u.id
    from users u
    where lower(u.email) = lower(c.email)
      and c.customer_user_id is null
  `;

  await sql`
    update contract_signing_requests r
    set customer_user_id = u.id
    from users u
    where lower(u.email) = lower(r.customer_email)
      and r.customer_user_id is null
  `;

  console.log("Backfill complete.");
  process.exit(0);
}

run();
```

- [ ] **Step 2: Add the script entry**

In `packages/db/package.json`, add to `scripts`:

```json
    "db:backfill:customers": "bun backfill_customer_user_id.ts",
```

- [ ] **Step 3: Dry run**

Run: `cd packages/db && bun backfill_customer_user_id.ts`

Expected: three counts, no writes. Sanity-check the numbers against `select count(*) from contracts;` before continuing.

- [ ] **Step 4: Apply**

Run: `cd packages/db && bun backfill_customer_user_id.ts --apply`

Expected: "Backfill complete." Verify:

```sql
select count(*) filter (where customer_user_id is not null) as linked,
       count(*) filter (where customer_user_id is null)     as unlinked
from contracts;
```

- [ ] **Step 5: Commit**

```bash
git add packages/db/backfill_customer_user_id.ts packages/db/package.json
git commit -m "chore(db): backfill customer_user_id from contract email"
```

---

## Task 11: Full-plan verification

**Files:** none — verification only.

- [ ] **Step 1: Typecheck and lint the whole monorepo**

Run: `bun run typecheck && bun run lint`
Expected: PASS

- [ ] **Step 2: Run the test suite**

Run: `cd apps/web && bun test`
Expected: PASS, 5 tests

- [ ] **Step 3: Walk the whole flow once**

With `bun run dev` up, as an admin:

1. `/sales/order` → configure a tarif → enter a **new** customer email → send invite.
2. Confirm: a `users` row exists with that email and no `accounts` row; the `contract_signing_requests` row carries `customer_user_id`; one email arrived whose button points at `/api/auth/magic-link/verify`.
3. In a private window, click that button. Expected: logged in, redirected to `/auth/set-password?next=/sales/order/sign/<token>`.
4. Set a password. Expected: land on the signing page, already authenticated.
5. Complete the signature. Expected: the new `contracts` row has `customer_user_id` set to that user.
6. Visit `/dashboard` as that customer. Expected: the old licenses view renders without error — **it will be empty, and that is correct.** Making it show the contract is Spec 2.
7. Visit `/sales/order` as that customer. Expected: redirect to `/dashboard`.

- [ ] **Step 4: Clean up test data**

```sql
delete from contracts where email like 'planttest-%';
delete from contract_signing_requests where customer_email like 'planttest-%';
delete from accounts where user_id in (select id from users where email like 'planttest-%');
delete from users where email like 'planttest-%';
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: account-backed offers verification pass"
```

---

## Notes for the executor

- **Task 5 Step 3 rewrites Step 2.** Step 2 deliberately writes the route with an ordering bug, and Step 3 explains and fixes it. Do not skip Step 2 — Step 3's diff is written against it. If you prefer, read both before typing either.
- **Two of the spec's five test items are verified by hand, not by `bun test`.** The spec lists "`customerUserId` survives invite → sign-remote" and "a non-admin session is rejected by the invite route" as tests. Both need a running API and a real session, which would mean a test harness this repo does not have and this plan does not add. They are covered instead by Task 5 Step 5 (the 403 curl) and Task 11 Step 3 (the end-to-end walk). If you want them automated, that is a separate task and a Bun test server — do not silently skip them.
- **`suppressEmail` is not a real field.** It appears once in Task 5 Step 2 and is deleted in Step 3. Do not implement it in `apps/api`.
- **The dashboard stays useless after this plan.** That is the spec's stated boundary, not an oversight. Spec 2 rebuilds `/dashboard` and `/admin` against `contracts`.
- **Magic links are single-use and expire in 14 days**, matching the signing-request expiry. A customer who lets an offer sit for a month needs a fresh link from `/auth` → "Login-Link".
- **Branch:** work continues on `feat/account-backed-offers`, which already holds the spec commit.
