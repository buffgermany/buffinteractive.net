import { getAdminPortalUser } from "@/lib/portal";
import { db, schema, asc, eq, sql, ilike } from "@platform/db";
import { saveOrganization } from "@/lib/portal-actions";
import { ActionForm } from "@/components/portal/action-form";
import { PageHeading, PortalLink, Field, Empty, fieldClass } from "@/components/portal/ui";
import { ArrowLeft } from "lucide-react";
import { Input, Button } from "@/components/ui/primitives";
export const dynamic = "force-dynamic";
function OrganizationForm({ organization }: { organization?: typeof schema.organizations.$inferSelect }) {
  return <ActionForm action={saveOrganization.bind(null, organization?.id ?? "")} submitLabel={organization ? "Organisation speichern" : "Organisation anlegen"} resetOnSuccess={!organization}><div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Name der Organisation" required value={organization?.name} /><Field name="email" label="Kontakt-E-Mail" type="email" value={organization?.email} maxLength={254} /><Field name="phone" label="Telefon" type="tel" value={organization?.phone} maxLength={80} /><Field name="address" label="Adresse" value={organization?.address} maxLength={1000} /></div><label className="block space-y-2 text-sm"><span>Interne Notizen · nur für Admins sichtbar</span><textarea className={fieldClass} name="notes" defaultValue={organization?.notes ?? ""} maxLength={5000} rows={3} /></label></ActionForm>;
}
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await getAdminPortalUser();
  const { q = "", page: rawPage } = await searchParams;
  const page = Math.max(1, Math.min(100000, Math.floor(Number(rawPage) || 1)));
  const organizations = await db.select({ organization: schema.organizations, members: sql<number>`count(${schema.users.id})::int` }).from(schema.organizations).leftJoin(schema.users, eq(schema.users.organizationId, schema.organizations.id)).where(q ? ilike(schema.organizations.name, `%${q}%`) : undefined).groupBy(schema.organizations.id).orderBy(asc(schema.organizations.name)).limit(31).offset((page - 1) * 30);
  return <><PageHeading title="Organisationen" description="Firmendaten und interne Notizen – mit Kunden unter der richtigen Organisation gebündelt." />
    <form className="mb-6 flex max-w-xl gap-2"><label className="sr-only" htmlFor="organization-search">Organisationen suchen</label><Input id="organization-search" name="q" defaultValue={q} placeholder="Organisationen suchen" /><Button variant="outline" type="submit">Suchen</Button></form>
    {!organizations.length && <Empty title="Keine Organisationen gefunden.">Lege eine Organisation an und ordne Personen dann aus ihrem Kundenprofil zu. Bestehende Firmennamen bleiben erhalten, bis Du sie zuordnest.</Empty>}
    <div className="divide-y divide-border">{organizations.slice(0, 30).map(({ organization, members }) => <details key={organization.id} className="py-5"><summary className="cursor-pointer rounded font-medium focus-visible:ring-2 focus-visible:ring-ring">{organization.name}<span className="ml-3 text-xs text-muted-foreground">{members} Mitglieder · Bearbeiten</span></summary><div className="mt-6 max-w-3xl"><OrganizationForm organization={organization} /><PortalLink href={`/admin/users?organization=${organization.id}`}>Mitglieder ansehen</PortalLink></div></details>)}</div>
    <nav aria-label="Organisationsseiten" className="my-6 flex justify-between">{page > 1 && <PortalLink href={`/admin/organizations?q=${encodeURIComponent(q)}&page=${page - 1}`} icon={ArrowLeft}>Zurück</PortalLink>}{organizations.length > 30 && <PortalLink href={`/admin/organizations?q=${encodeURIComponent(q)}&page=${page + 1}`}>Weiter</PortalLink>}</nav>
    <details className="mt-10 rounded-xl border border-border p-6"><summary className="cursor-pointer rounded font-semibold focus-visible:ring-2 focus-visible:ring-ring">Organisation anlegen</summary><div className="mt-6 max-w-3xl"><OrganizationForm /></div></details>
  </>;
}
