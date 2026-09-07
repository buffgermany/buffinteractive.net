import { db, schema, sql, desc, asc, or, ilike, and, eq } from "@platform/db";
import { getAdminPortalUser } from "@/lib/portal";
import { CustomerForm } from "@/components/portal/customer-form";
import { PageHeading, PortalLink, Empty, date } from "@/components/portal/ui";
import { Button, Input } from "@/components/ui/primitives";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; organization?: string }> }) {
  const actor = await getAdminPortalUser();
  const { q = "", page: pageParam, organization } = await searchParams;
  const page = Math.max(1, Math.min(100000, Math.floor(Number(pageParam) || 1)));
  const filter = and(organization ? eq(schema.users.organizationId, organization) : undefined, q ? or(ilike(schema.users.name, `%${q}%`), ilike(schema.users.email, `%${q}%`), ilike(schema.users.company, `%${q}%`)) : undefined);
  const [users, [count], organizations] = await Promise.all([
    db.select().from(schema.users).where(filter).orderBy(desc(schema.users.createdAt)).limit(30).offset((page - 1) * 30),
    db.select({ value: sql<number>`count(*)::int` }).from(schema.users).where(filter),
    db.select({ id: schema.organizations.id, name: schema.organizations.name }).from(schema.organizations).orderBy(asc(schema.organizations.name)),
  ]);
  return <><PageHeading title="Customers" description="Manage people, their contact details, and their access to Buff."><PortalLink href="/admin/organizations">Manage organizations</PortalLink></PageHeading>
    <form className="mb-6 flex max-w-xl gap-2">{organization && <input type="hidden" name="organization" value={organization} />}<label className="sr-only" htmlFor="customer-search">Search customers</label><Input id="customer-search" name="q" defaultValue={q} placeholder="Search name, email, or company" /><Button type="submit" variant="outline">Search</Button></form>
    <p className="mb-4 text-xs text-muted-foreground">{count?.value ?? 0} matching accounts</p>
    {!users.length && <Empty title="No customers found.">Try a different search or create a customer below.</Empty>}
    <div className="divide-y divide-border">{users.map(user => <article key={user.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0"><h2 className="font-medium">{user.name} {user.role === "admin" && <span className="ml-2 text-xs text-primary">Admin</span>}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p><p className="mt-1 text-xs text-muted-foreground">{user.company || "No company"} · Joined {date(user.createdAt)}</p></div><div className="flex gap-1"><PortalLink href={`/admin/conversations?customer=${user.id}#new`}>Message</PortalLink><PortalLink href={`/admin/users/${user.id}`}>Edit customer</PortalLink></div></article>)}</div>
    <nav aria-label="Customer pages" className="my-6 flex justify-between">{page > 1 && <PortalLink href={`/admin/users?q=${encodeURIComponent(q)}&organization=${encodeURIComponent(organization ?? "")}&page=${page - 1}`}>Previous</PortalLink>}{page * 30 < (count?.value ?? 0) && <PortalLink href={`/admin/users?q=${encodeURIComponent(q)}&organization=${encodeURIComponent(organization ?? "")}&page=${page + 1}`}>Next</PortalLink>}</nav>
    <details className="mt-10 rounded-xl border border-border p-6"><summary className="cursor-pointer rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring">Create customer</summary><div className="mt-6 max-w-2xl"><CustomerForm organizations={organizations} actorId={actor.id} /></div></details>
  </>;
}
