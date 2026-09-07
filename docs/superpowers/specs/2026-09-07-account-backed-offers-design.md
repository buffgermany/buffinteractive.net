# Account-Backed Offers & Auth Rework

**Date:** 2026-09-07
**Status:** Approved, ready for implementation plan
**Scope:** Spec 1 of 3. Covers customer identity in the order flow and the auth
pages. Does not cover dashboards.

---

## Problem

`contracts` and `contract_signing_requests` record a customer as a loose
`customer_email` string. Neither table references a user account. The customer
who signs a contract has no way to log in and see it, and the business has no
join between "who signed" and "who has an account".

The existing `/dashboard` reads `orders` and `licenses` — the Lemon Squeezy
software-licensing model. The actual product sold through `/sales/order` is a
tarif contract (Essential / Growth / Enterprise / Marketing) with a SEPA
mandate, stored in `contracts`. The dashboard never reads that table, which is
why it shows nothing useful.

This spec closes the identity gap. It ends when a customer has an account with a
signed contract attached. What they *see* is Spec 2.

## Decisions

Settled during brainstorming; recorded here so the plan does not relitigate them.

| # | Decision | Chosen | Rejected alternative |
|---|----------|--------|---------------------|
| 1 | When is the account created? | At invite time, when sales sends the offer | At signing time (would need two separate link systems) |
| 2 | How does the customer authenticate? | Magic link, then a **mandatory** set-password screen before anything else | Magic-link-only; mailed plaintext password |
| 3 | Is public self-signup open? | Yes, open to anyone | Invite-only |
| 4 | Account granularity | Per-person; company as flat fields on `users` | Real organizations with membership |

Decision 2 was chosen over magic-link-only despite the added friction of a
password wall between the customer and the offer they were just sent. Decision 3
was chosen knowing a self-registered account currently lands on an empty
dashboard until Spec 2 gives it content.

### Consequence of decision 3: `/sales/order` must be role-gated

`apps/web/src/app/sales/order/page.tsx:16` currently redirects only when there
is **no session** — any authenticated user reaches the contract sender. That is
survivable while signup is closed and every account is hand-made. Once signup is
open, anyone who registers can send contracts under the company's name and
trigger mail from its domain.

`/sales/order` and both new `/api/sales/*` routes therefore require
`role === 'admin'`. The `users.role` enum is `'user' | 'admin'` with no `sales`
value; admin is the only privileged role that exists, so it is the gate. If
sales staff who are not admins need access later, that is a third enum value and
a one-line change to the check — not part of this spec.

## Architecture

### Where the code lives

Better Auth is instantiated in `apps/web/src/lib/auth.ts`. Resend and the
contract email templates live in `apps/api`. Account creation needs Better Auth;
the invite record and its branded email need `apps/api`.

The web app orchestrates: a new Next route handler resolves or creates the
account, mints the magic link, then calls the existing `apps/api` endpoint with
the resulting `customerUserId` and login URL. `apps/api` keeps ownership of the
invite row and the offer email.

**Mail ownership:** web sends authentication mail (magic link, set-password),
api sends contract mail (offer, signed confirmation). `resend` is added to
`apps/web` for this. No shared mail package — two senders with two distinct
concerns is not duplication worth abstracting.

### Data model

```
users                        + company        text  nullable
                             + phone          text  nullable

contract_signing_requests    + customerUserId text  nullable → users.id
                                                     onDelete: set null

contracts                    + customerUserId text  nullable → users.id
                                                     onDelete: set null
```

`customerUserId` is nullable because existing rows have no account. A one-time
backfill matches `contracts.email → users.email`; unmatched rows stay null and
are invisible to any dashboard query.

`salesUserId` is unchanged and keeps its current meaning: the seller. The two
must not be conflated — `customerUserId` is the buyer.

Index `customerUserId` on both tables. Every dashboard query in Spec 2 filters
on it.

### Password gate

A user needs a password when they have **no `accounts` row with
`providerId = 'credential'`**. This is derived state, not a stored flag, so it
cannot drift out of sync with reality.

```ts
needsPassword(userId): Promise<boolean>
```

One helper, called from the `(dashboard)` layout and the signing page. Users who
signed up through the normal form always have a credential row and never see the
gate.

### Flow

```
1. Sales fills /sales/order, picks an existing account or types a new email
2. POST /api/sales/invite                       (web, admin only)
     - find user by email, or create one (name, company, phone from the form)
     - mint magic link, callbackURL = /sales/order/sign/<token>
3. POST /v1/contracts/create-invite             (api)
     - now also accepts customerUserId and loginUrl
     - stores customerUserId on the invite row
     - existing branded email, button href = loginUrl   ← still ONE email
4. Customer clicks the link
     - Better Auth verifies, session created, emailVerified = true
5. Gate redirects to /auth/set-password?next=/sales/order/sign/<token>
6. Customer sets a password, is forwarded to `next`
7. Signs the contract
8. POST /v1/contracts/sign-remote copies invite.customerUserId onto the contract
```

Step 3 keeps the offer and the login in a single email. The magic link *is* the
offer button.

### Signing page access control

`/sales/order/sign/[token]` currently authenticates nobody — the token is the
only gate, on a page that collects an IBAN and a handwritten signature.

New rule:

- Invite **has** `customerUserId` → require a session whose user id matches it.
  No session → redirect to `/auth` with the signing URL as `from`. Wrong user →
  403. Forwarded emails stop working, which is the intent.
- Invite has **null** `customerUserId` (predates this change) → current
  anonymous token behaviour, unchanged, so nothing in flight breaks.

In-person signing is unaffected: it posts to `/v1/contracts/generate` directly
and never touches a token.

## Components

### New

| Path | Purpose |
|------|---------|
| `apps/web/src/app/api/sales/customers/route.ts` | `GET ?q=` — search users by email/name/company. Admin only. Backs the picker. |
| `apps/web/src/app/api/sales/invite/route.ts` | `POST` — resolve-or-create account, mint magic link, delegate to `apps/api`. Admin only. |
| `apps/web/src/app/(auth)/auth/set-password/page.tsx` | Mandatory first-landing screen. Carries `next` through. |
| `apps/web/src/lib/account.ts` | `needsPassword()`, `resolveOrCreateCustomer()`. |

### Changed

| Path | Change |
|------|--------|
| `packages/db/src/schema/users.ts` | `+ company`, `+ phone` |
| `packages/db/src/schema/contracts.ts` | `+ customerUserId` on both tables, indexed |
| `apps/web/src/lib/auth.ts` | `magicLink` plugin, `sendMagicLink` via Resend |
| `apps/web/src/lib/auth-client.ts` | `magicLink` client plugin |
| `apps/web/src/app/(auth)/auth/page.tsx` | Enable signup (`signupEnabled = true`), add "email me a link" mode |
| `apps/web/src/app/(dashboard)/layout.tsx` | Password gate |
| `apps/web/src/app/sales/order/sign/[token]/page.tsx` | Session check, password gate |
| `apps/web/src/app/sales/order/page.tsx` | Gate on `role === 'admin'`, not merely on having a session |
| `apps/web/src/app/sales/order/OrderFormFlow.tsx` | Customer combobox in step 0; `handleCreateInvite` posts to `/api/sales/invite` |
| `apps/api/src/routes/contracts.ts` | `create-invite` accepts `customerUserId` + `loginUrl`; `sign-remote` copies `customerUserId` to the contract |

The auth page is 359 lines with the login and signup forms duplicating every
field. Adding a third mode makes that untenable, so the three modes get extracted
into sibling components sharing one field set. This is scoped to the file being
changed, not general refactoring.

## Error handling

| Case | Behaviour |
|------|-----------|
| Email already has an account | Reuse it. Never create a duplicate. Sales sees "existing account" in the picker. |
| Magic link expired (14 days, matching invite expiry) | `/auth` with a "request a new link" prompt, prefilled email |
| Magic link already used | Better Auth default: single use. Same prompt. |
| Signing page, wrong logged-in user | 403 with a "signed in as X, this offer is for Y" message and a sign-out link |
| Resend not configured / send fails | Invite row still commits; endpoint returns `signingUrl` so sales can copy the link manually. This matches the current behaviour, which already swallows send failures. |
| Set-password abandoned midway | Session persists; the gate catches them again on next visit |

## Testing

One file, `apps/web/src/lib/account.test.ts`, assert-based, no framework, run
directly with `bun`:

1. Two invites to the same email produce exactly one user row.
2. An invite to a new email creates a user with `company` and `phone` populated.
3. `needsPassword` is true for a magic-link-only user, false once a credential
   account row exists.
4. `customerUserId` survives invite → sign-remote onto the `contracts` row.
5. A non-admin session is rejected by the invite route.

Trivial changes (schema columns, the `signupEnabled` flag) get no test.

## Out of scope

- **Everything a customer sees.** `/dashboard` keeps rendering the old licenses
  view until Spec 2.
- **Self-serve checkout account creation.** `/api/checkout` is untouched; it is
  wired the same way in Spec 2 once a self-serve buyer has something to land on.
- **Conversations, tips, admin stats.** Specs 2 and 3.
- **Organizations.** Per decision 4. If two people at one firm ever need shared
  access, that is a migration of one foreign key, not a redesign.
