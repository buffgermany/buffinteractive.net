import { db, schema, eq, desc } from "@platform/db";
import { MessageSquare } from "lucide-react";
import { getPortalUser } from "@/lib/portal";
import { getOfferStatus } from "@/lib/portal-validation";
import { PageHeading, PortalLink, Status, Empty, money, date, cycleLabel } from "@/components/portal/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getPortalUser();
  const [offers, plans, conversations] = await Promise.all([
    db.select({ id: schema.contractSigningRequests.id, token: schema.contractSigningRequests.token, tarif: schema.contractSigningRequests.tarif, status: schema.contractSigningRequests.status, expiresAt: schema.contractSigningRequests.expiresAt, setup: schema.contractSigningRequests.setupPreisBrutto, recurring: schema.contractSigningRequests.laufendPreisBrutto, cycle: schema.contractSigningRequests.zahlungsrhythmus }).from(schema.contractSigningRequests).where(eq(schema.contractSigningRequests.customerUserId, user.id)).orderBy(desc(schema.contractSigningRequests.createdAt)),
    db.select({ id: schema.contracts.id, tarif: schema.contracts.tarif, status: schema.contracts.status, recurring: schema.contracts.laufendPreisBrutto, cycle: schema.contracts.zahlungsrhythmus, signedAt: schema.contracts.signedAt, description: schema.contracts.leistungsbeschreibung, company: schema.contracts.firma }).from(schema.contracts).where(eq(schema.contracts.customerUserId, user.id)).orderBy(desc(schema.contracts.signedAt)),
    db.select().from(schema.conversations).where(eq(schema.conversations.customerUserId, user.id)).orderBy(desc(schema.conversations.updatedAt)).limit(3),
  ]);
  const pendingOffers = offers.filter(offer => getOfferStatus(offer) === "pending");
  const activePlans = plans.filter(plan => plan.status === "active");
  return <>
    <PageHeading title={`Hallo, ${user.name.split(" ")[0] || "willkommen zurück"}.`} description="Deine Zusammenarbeit mit Buff an einem Ort. Prüfe ein Angebot, sieh Dir Deine Tarife an oder führe ein Gespräch weiter."><PortalLink href="/dashboard/conversations#new"><MessageSquare size={16} />Buff schreiben</PortalLink></PageHeading>
    <div className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-5 text-sm"><span><strong className="mr-2 text-lg tabular-nums">{pendingOffers.length}</strong><span className="text-muted-foreground">Angebote zu prüfen</span></span><span><strong className="mr-2 text-lg tabular-nums">{activePlans.length}</strong><span className="text-muted-foreground">aktive Tarife</span></span>{user.company && <span className="ml-auto text-muted-foreground">{user.company}</span>}</div>
    <div className="grid gap-12 xl:grid-cols-3">
      <div className="space-y-12 xl:col-span-2">
        <section id="offers" className="scroll-mt-6"><h2 className="mb-5 text-xl font-semibold">Deine Angebote</h2>
          {!offers.length && <Empty title="Hier startet Dein nächstes Projekt.">Sobald Buff ein Angebot für Dich vorbereitet, kannst Du es hier prüfen und unterschreiben. <PortalLink href="/dashboard/conversations#new">Erzähl uns, was Du vorhast</PortalLink></Empty>}
          <div className="divide-y divide-border">{offers.map(offer => {
            const status = getOfferStatus(offer);
            return <article key={offer.id} className="py-5 first:pt-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-medium capitalize">{offer.tarif}</h3><p className="mt-1 text-sm text-muted-foreground">{money(offer.recurring)} / {cycleLabel(offer.cycle)} · {money(offer.setup)} Onboarding-Gebühr</p></div><Status value={status} /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{status === "pending" ? "Gültig bis" : "Angebot gültig bis"} {date(offer.expiresAt)} · inkl. MwSt.</p>{status === "pending" ? <PortalLink href={`/sales/order/sign/${offer.token}`}>Prüfen & unterschreiben</PortalLink> : <PortalLink href="/dashboard/conversations#new">Frage zu diesem Angebot stellen</PortalLink>}</div></article>;
          })}</div>
        </section>
        <section id="plans" className="scroll-mt-6"><h2 className="mb-5 text-xl font-semibold">Deine Tarife</h2>
          {!plans.length && <Empty title="Noch keine aktiven Tarife.">Sobald Du ein Angebot unterschreibst, erscheinen hier Dein Tarif und die vereinbarten Leistungen.</Empty>}
          <div className="divide-y divide-border">{plans.map(plan => <article key={plan.id} className="py-5 first:pt-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-medium capitalize">{plan.tarif}</h3><p className="mt-1 text-sm text-muted-foreground">{plan.company} · Unterschrieben am {date(plan.signedAt)}</p></div><Status value={plan.status} /></div>{plan.description && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{plan.description}</p>}<p className="mt-4 text-sm font-medium">{money(plan.recurring)} <span className="font-normal text-muted-foreground">/ {cycleLabel(plan.cycle)}, inkl. MwSt.</span></p></article>)}</div>
        </section>
      </div>
      <div className="space-y-10 xl:border-l xl:border-border xl:pl-8">
        <section><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Nachrichten</h2><PortalLink href="/dashboard/conversations">Alle ansehen</PortalLink></div>
          {!conversations.length && <p className="text-sm leading-6 text-muted-foreground">Eine Frage, eine Idee oder eine kleine Änderung? Starte ein Gespräch – alle Antworten bleiben an einem Ort.</p>}
          <div className="divide-y divide-border">{conversations.map(conversation => <div key={conversation.id} className="py-3"><PortalLink href={`/dashboard/conversations/${conversation.id}`} icon={null}>{conversation.subject}</PortalLink><div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{date(conversation.updatedAt)}</span><Status value={conversation.status} /></div></div>)}</div>
          <PortalLink href="/dashboard/conversations#new">Gespräch starten</PortalLink>
        </section>
        <section id="tips" className="scroll-mt-6 border-t border-border pt-8"><h2 className="mb-5 text-lg font-semibold">Ein paar hilfreiche Tipps</h2><div className="space-y-6">
          <div><h3 className="text-sm font-medium">Gib jeder Anfrage etwas Kontext.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Nenn uns die Seite, was Du ändern möchtest und Deinen Wunschtermin. So legen wir sofort los.</p></div>
          <div><h3 className="text-sm font-medium">Halte Deine Projektdateien beisammen.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Schick uns im Gespräch einen Link zu Logo, Texten und Fotos – dann findet das Team alles wieder.</p></div>
          <div><h3 className="text-sm font-medium">Prüfe die Details vor der Unterschrift.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Sieh Dir Leistungsumfang, Onboarding-Gebühr und Zahlungsrhythmus im Angebot an. Melde Dich, wenn etwas angepasst werden soll.</p></div>
        </div></section>
      </div>
    </div>
  </>;
}
