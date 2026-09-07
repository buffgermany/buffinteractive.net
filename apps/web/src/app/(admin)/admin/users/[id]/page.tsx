import { db, schema, eq, asc } from "@platform/db";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminPortalUser } from "@/lib/portal";
import { CustomerForm } from "@/components/portal/customer-form";
import { PageHeading, PortalLink } from "@/components/portal/ui";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminPortalUser();
  const { id } = await params;
  const [[user], organizations] = await Promise.all([db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1), db.select({ id: schema.organizations.id, name: schema.organizations.name }).from(schema.organizations).orderBy(asc(schema.organizations.name))]);
  if (!user) notFound();
  return <div className="max-w-3xl"><PortalLink href="/admin/users" icon={ArrowLeft}>Zurück zu den Kunden</PortalLink><div className="mt-6"><PageHeading title={user.name} description="Aktualisiere Profil, Organisation und Zugriff dieses Kunden."><PortalLink href={`/admin/conversations?customer=${id}#new`}>Kunde anschreiben</PortalLink><PortalLink href={`/admin/offers?customer=${id}`}>Angebote ansehen</PortalLink><PortalLink href={`/admin/plans?customer=${id}`}>Tarife ansehen</PortalLink></PageHeading></div><CustomerForm user={user} organizations={organizations} actorId={actor.id} /></div>;
}
