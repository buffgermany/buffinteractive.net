import { getAdminPortalUser } from "@/lib/portal";
import { db, schema, sql, eq, desc, and } from "@platform/db";
import { PageHeading, PortalLink, Status, Empty, date } from "@/components/portal/ui";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  await getAdminPortalUser();
  const [[customers], [organizations], [plans], [offers], [conversations], recent] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(schema.users).where(eq(schema.users.role, "user")),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.organizations),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.contracts).where(eq(schema.contracts.status, "active")),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.contractSigningRequests).where(and(eq(schema.contractSigningRequests.status, "pending"), sql`${schema.contractSigningRequests.expiresAt} > now()`)),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.conversations).where(eq(schema.conversations.status, "open")),
    db.select({ conversation: schema.conversations, name: schema.users.name }).from(schema.conversations).innerJoin(schema.users, eq(schema.users.id, schema.conversations.customerUserId)).orderBy(desc(schema.conversations.updatedAt)).limit(6),
  ]);
  const metrics = [{ label: "Customers", value: customers?.count ?? 0, href: "/admin/users" }, { label: "Organizations", value: organizations?.count ?? 0, href: "/admin/organizations" }, { label: "Active plans", value: plans?.count ?? 0, href: "/admin/plans" }, { label: "Open conversations", value: conversations?.count ?? 0, href: "/admin/conversations" }];
  return <><PageHeading title="Workspace overview" description="See where things stand and keep your customers moving forward."><PortalLink href="/sales/order">Create an offer</PortalLink></PageHeading>
    <dl className="mb-12 grid grid-cols-2 gap-y-6 border-y border-border py-6 md:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="px-3 first:pl-0"><dt className="text-sm text-muted-foreground">{metric.label}</dt><dd className="mt-2 text-3xl font-semibold tabular-nums"><PortalLink href={metric.href}><span className="text-3xl text-foreground">{metric.value}</span></PortalLink></dd></div>)}</dl>
    <div className="grid gap-10 xl:grid-cols-3"><section className="xl:col-span-2"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Latest conversations</h2><PortalLink href="/admin/conversations">View inbox</PortalLink></div>
      {!recent.length && <Empty title="The inbox is clear.">Start a conversation from a customer’s profile. Their replies will appear here.</Empty>}
      <div className="divide-y divide-border">{recent.map(({ conversation, name }) => <article key={conversation.id} className="py-4"><div className="flex items-start justify-between gap-3"><PortalLink href={`/admin/conversations/${conversation.id}`}>{conversation.subject}</PortalLink><Status value={conversation.status} /></div><p className="mt-2 px-3 text-xs text-muted-foreground">{name} · {date(conversation.updatedAt)}</p></article>)}</div>
    </section><aside className="space-y-8 xl:border-l xl:border-border xl:pl-8"><section><h2 className="text-lg font-semibold">Offers in progress</h2><p className="mt-3 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">{offers?.count ?? 0}</strong> offers are awaiting a signature and have not expired.</p><PortalLink href="/sales/order">Prepare an offer</PortalLink></section><section className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Customer management</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Update contact details, assign an organization, or give a colleague admin access.</p><PortalLink href="/admin/users">Open customer directory</PortalLink><PortalLink href="/admin/organizations">Manage organizations</PortalLink></section></aside></div>
  </>;
}
