import { getAdminPortalUser } from "@/lib/portal";
import { db, schema, eq, desc } from "@platform/db";
import { setPlanStatus } from "@/lib/portal-actions";
import { ActionForm } from "@/components/portal/action-form";
import { PageHeading, PortalLink, Empty, money, date, fieldClass, Status } from "@/components/portal/ui";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ customer?: string; page?: string }> }) {
  await getAdminPortalUser();
  const { customer, page: rawPage } = await searchParams;
  const page = Math.max(1, Math.min(100000, Math.floor(Number(rawPage) || 1)));
  const plans = await db.select({ id: schema.contracts.id, tarif: schema.contracts.tarif, firma: schema.contracts.firma, email: schema.contracts.email, customerUserId: schema.contracts.customerUserId, status: schema.contracts.status, recurring: schema.contracts.laufendPreisBrutto, cycle: schema.contracts.zahlungsrhythmus, signedAt: schema.contracts.signedAt }).from(schema.contracts).where(customer ? eq(schema.contracts.customerUserId, customer) : undefined).orderBy(desc(schema.contracts.signedAt)).limit(31).offset((page - 1) * 30);
  const query = customer ? `customer=${encodeURIComponent(customer)}&` : "";
  return <><PageHeading title="Plans" description="Signed agreements and their service status. Updating a status here does not change billing or the signed agreement."><PortalLink href="/sales/order">Create offer</PortalLink>{customer && <PortalLink href="/admin/plans">All plans</PortalLink>}</PageHeading>
    {!plans.length && <Empty title="No plans yet.">Signed customer agreements will appear here.</Empty>}
    <div className="divide-y divide-border">{plans.slice(0, 30).map(plan => <article key={plan.id} className="py-6 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-medium capitalize">{plan.tarif} · {plan.firma}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{plan.email}</p><p className="mt-2 text-sm">{money(plan.recurring)} / {plan.cycle === "monatlich" ? "month" : "year"} · <span className="text-muted-foreground">Signed {date(plan.signedAt)}</span></p></div><Status value={plan.status} /></div><details className="mt-4"><summary className="cursor-pointer rounded text-sm text-primary focus-visible:ring-2 focus-visible:ring-ring">Manage plan</summary><div className="mt-4 max-w-sm"><ActionForm action={setPlanStatus.bind(null, plan.id)}><label className="block space-y-2 text-sm"><span>Service status</span><select name="status" defaultValue={plan.status} className={fieldClass}><option value="active">Active</option><option value="paused">Paused</option><option value="ended">Ended</option></select></label></ActionForm>{plan.customerUserId && <PortalLink href={`/admin/users/${plan.customerUserId}`}>Edit customer</PortalLink>}</div></details></article>)}</div>
    <nav aria-label="Plan pages" className="mt-6 flex justify-between">{page > 1 && <PortalLink href={`/admin/plans?${query}page=${page - 1}`}>Previous</PortalLink>}{plans.length > 30 && <PortalLink href={`/admin/plans?${query}page=${page + 1}`}>Next</PortalLink>}</nav>
  </>;
}
