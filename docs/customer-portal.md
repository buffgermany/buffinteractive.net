# Customer portal

The customer dashboard uses account-linked offers and signed contracts. License and download links are removed; old customer URLs redirect to the dashboard. The existing magic-link and signing flow stays in place.

- Customers see their offers, plans, practical tips, and private conversations with Buff.
- Admins see counts, search and create customers, edit profiles and roles, manage organizations and membership, update plan status, and start/reply/close/reopen conversations.
- Organization membership groups contacts for admins. It does not grant access to another customer's offers or conversations. Existing company names are not automatically merged into organizations.
- Tips are static. Conversations refresh on navigation, after a message is sent, or with Refresh; there are no email notifications or background polling.
- Plan status tracks service delivery. Changing it does not change billing or rewrite a signed agreement.

## Database rollout

Apply the additive migration before serving the new app:

```sh
cd packages/db
bun run db:migrate:portal
```

The script uses the configured `DATABASE_URL`, creates organizations and conversation/message tables, and adds `users.organization_id` and `contracts.status`. It runs in a transaction and can be rerun. Existing signed contracts start as active. No customer data is deleted or reassigned. Review historical plans and update their status in Admin if needed.

The project uses standalone idempotent migrations because the older Drizzle migration history has drifted. Do not substitute `db:push --force`.

## Verification

```sh
bun test apps/web/src/lib/portal-validation.test.ts apps/web/src/lib/safe-next.test.ts
cd apps/web
bun run build
```

The focused tests cover conversation ownership, expiry boundaries, input limits, and profile round-tripping. The normal repo typecheck currently includes unrelated errors in the pre-existing `apps/web/scratch/reset-password.ts`; a temporary TypeScript config excluding only that file passes.

The database migration and the opt-in HTTP integration check passed during implementation. To rerun against a running local production build:

```sh
PORTAL_TEST_URL=http://localhost:3100 bun --env-file=.env test apps/web/src/lib/portal.integration.test.ts
```

The check creates disposable accounts, an organization, an offer, and a conversation, then removes them in `finally`. It sends no emails. It verifies ownership, forged-reply rejection, admin replies, close/reopen, profile updates, organization assignment, and admin API restrictions.

Visual browser review remains unverified. For the manual acceptance pass, use two customer accounts and an admin: review an offer, start and reply to a conversation, reject cross-customer access, close/reopen the conversation, edit a profile, assign an organization, and change a plan status. Email/role edits invalidate the customer's sessions; admins cannot demote themselves.
