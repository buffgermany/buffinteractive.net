import { db, schema, sql, desc, asc, or, ilike, and, eq } from "@platform/db";
import { getAdminPortalUser } from "@/lib/portal";
import { CustomerForm } from "@/components/portal/customer-form";
import { PageHeading, PortalLink, Empty, date } from "@/components/portal/ui";
import { ArrowLeft } from "lucide-react";
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
  return <><PageHeading title="Kunden" description="Verwalte Personen, ihre Kontaktdaten und ihren Zugang zu Buff."><PortalLink href="/admin/organizations">Organisationen verwalten</PortalLink></PageHeading>
    <form className="mb-6 flex max-w-xl gap-2">{organization && <input type="hidden" name="organization" value={organization} />}<label className="sr-only" htmlFor="customer-search">Kunden suchen</label><Input id="customer-search" name="q" defaultValue={q} placeholder="Name, E-Mail oder Firma suchen" /><Button type="submit" variant="outline">Suchen</Button></form>
    <p className="mb-4 text-xs text-muted-foreground">{count?.value ?? 0} passende Konten</p>
    {!users.length && <Empty title="Keine Kunden gefunden.">Versuch eine andere Suche oder lege unten einen Kunden an.</Empty>}
    <div className="divide-y divide-border">{users.map(user => <article key={user.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div className="min-w-0"><h2 className="font-medium">{user.name} {user.role === "admin" && <span className="ml-2 text-xs text-primary">Admin</span>}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p><p className="mt-1 text-xs text-muted-foreground">{user.company || "Keine Firma"} · Dabei seit {date(user.createdAt)}</p></div><div className="flex flex-wrap gap-x-5"><PortalLink href={`/admin/conversations?customer=${user.id}#new`}>Nachricht</PortalLink><PortalLink href={`/admin/users/${user.id}`}>Kunde bearbeiten</PortalLink></div></article>)}</div>
    <nav aria-label="Kundenseiten" className="my-6 flex justify-between">{page > 1 && <PortalLink href={`/admin/users?q=${encodeURIComponent(q)}&organization=${encodeURIComponent(organization ?? "")}&page=${page - 1}`} icon={ArrowLeft}>Zurück</PortalLink>}{page * 30 < (count?.value ?? 0) && <PortalLink href={`/admin/users?q=${encodeURIComponent(q)}&organization=${encodeURIComponent(organization ?? "")}&page=${page + 1}`}>Weiter</PortalLink>}</nav>
    <details className="mt-10 rounded-xl border border-border p-6"><summary className="cursor-pointer rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring">Kunde anlegen</summary><div className="mt-6 max-w-2xl"><CustomerForm organizations={organizations} actorId={actor.id} /></div></details>
  </>;
}
