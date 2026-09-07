import { getAdminPortalUser } from "@/lib/portal";
import { db, schema, eq, or, and, desc, sql } from "@platform/db";
import { ArrowLeft } from "lucide-react";
import { getOfferStatus } from "@/lib/portal-validation";
import { PageHeading, PortalLink, Empty, Status, money, date, cycleLabel } from "@/components/portal/ui";
export const dynamic = "force-dynamic";

const offers = schema.contractSigningRequests;
// Status is derived, not stored: a pending offer past its expiry reads as
// expired everywhere. Keep these filters in sync with getOfferStatus().
const filters: Record<string, ReturnType<typeof and>> = {
  pending: and(eq(offers.status, "pending"), sql`${offers.expiresAt} > now()`),
  signed: eq(offers.status, "signed"),
  expired: or(eq(offers.status, "expired"), and(eq(offers.status, "pending"), sql`${offers.expiresAt} <= now()`)),
  cancelled: eq(offers.status, "cancelled"),
};
const tabs = [["", "Alle"], ["pending", "Offen"], ["signed", "Unterschrieben"], ["expired", "Abgelaufen"], ["cancelled", "Storniert"]] as const;

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; customer?: string; page?: string }> }) {
  await getAdminPortalUser();
  const { status = "", customer, page: rawPage } = await searchParams;
  const page = Math.max(1, Math.min(100000, Math.floor(Number(rawPage) || 1)));
  const where = and(filters[status], customer ? eq(offers.customerUserId, customer) : undefined);
  const rows = await db.select({ offer: offers, salesName: schema.users.name })
    .from(offers).leftJoin(schema.users, eq(schema.users.id, offers.salesUserId))
    .where(where).orderBy(desc(offers.createdAt)).limit(31).offset((page - 1) * 30);
  const query = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ status, customer, page, ...overrides })) if (value) params.set(key, String(value));
    return `/admin/offers?${params}`;
  };
  return <><PageHeading title="Angebote" description="Alle versendeten Angebote und ihr Status. Offene Angebote warten auf eine Unterschrift, abgelaufene kannst Du jederzeit neu verschicken."><PortalLink href="/sales/order">Angebot erstellen</PortalLink>{customer && <PortalLink href="/admin/offers">Alle Kunden</PortalLink>}</PageHeading>
    <nav aria-label="Nach Status filtern" className="mb-6 flex flex-wrap gap-1 border-b border-border pb-3">{tabs.map(([value, label]) => <a key={value} href={query({ status: value, page: undefined })} className={`rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${status === value ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"}`} aria-current={status === value ? "page" : undefined}>{label}</a>)}</nav>
    {!rows.length && <Empty title="Keine Angebote gefunden.">Sobald Du ein Angebot verschickst, erscheint es hier mit seinem aktuellen Status.</Empty>}
    <div className="divide-y divide-border">{rows.slice(0, 30).map(({ offer, salesName }) => {
      const state = getOfferStatus(offer);
      return <article key={offer.id} className="py-6 first:pt-0"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0">
        <h2 className="text-lg font-medium capitalize">{offer.tarif} · {offer.companyName || offer.customerName || "Ohne Firma"}</h2>
        <p className="mt-1 break-all text-sm text-muted-foreground">{offer.customerEmail}</p>
        <p className="mt-2 text-sm">{money(offer.laufendPreisBrutto)} / {cycleLabel(offer.zahlungsrhythmus)} · {money(offer.setupPreisBrutto)} Onboarding-Gebühr <span className="text-muted-foreground">· inkl. MwSt.</span></p>
        <p className="mt-2 text-xs text-muted-foreground">Verschickt am {date(offer.createdAt)} von {salesName ?? "Buff"} · {state === "signed" ? `Unterschrieben am ${date(offer.updatedAt)}` : `Gültig bis ${date(offer.expiresAt)}`}</p>
      </div><Status value={state} /></div>
      <div className="mt-3 flex flex-wrap gap-x-5">{state === "pending" && <PortalLink href={`/sales/order/sign/${offer.token}`}>Signaturseite öffnen</PortalLink>}{offer.customerUserId && <><PortalLink href={`/admin/users/${offer.customerUserId}`}>Kunde bearbeiten</PortalLink><PortalLink href={`/admin/conversations?customer=${offer.customerUserId}#new`}>Kunde anschreiben</PortalLink></>}{!offer.customerUserId && <p className="py-2 text-xs text-muted-foreground">Kein Konto verknüpft — dieses Angebot erscheint nicht im Kundenbereich.</p>}</div></article>;
    })}</div>
    <nav aria-label="Angebotsseiten" className="mt-6 flex justify-between">{page > 1 && <PortalLink href={query({ page: page - 1 })} icon={ArrowLeft}>Zurück</PortalLink>}{rows.length > 30 && <PortalLink href={query({ page: page + 1 })}>Weiter</PortalLink>}</nav>
  </>;
}
