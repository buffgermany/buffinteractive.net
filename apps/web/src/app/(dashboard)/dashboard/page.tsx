import { db, schema, eq, desc } from "@platform/db";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { getPortalUser } from "@/lib/portal";
import { getOfferStatus } from "@/lib/portal-validation";
import { PageHeading, PortalLink, Status, Empty, money, date } from "@/components/portal/ui";

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
    <PageHeading title={`Hello, ${user.name.split(" ")[0] || "there"}.`} description="Your work with Buff, all in one place. Review an offer, check your plans, or pick up a conversation."><PortalLink href="/dashboard/conversations#new"><MessageSquare size={16} />Message Buff</PortalLink></PageHeading>
    <div className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-5 text-sm"><span><strong className="mr-2 text-lg tabular-nums">{pendingOffers.length}</strong><span className="text-muted-foreground">offers to review</span></span><span><strong className="mr-2 text-lg tabular-nums">{activePlans.length}</strong><span className="text-muted-foreground">active plans</span></span>{user.company && <span className="ml-auto text-muted-foreground">{user.company}</span>}</div>
    <div className="grid gap-12 xl:grid-cols-3">
      <div className="space-y-12 xl:col-span-2">
        <section id="offers" className="scroll-mt-6"><h2 className="mb-5 text-xl font-semibold">Your offers</h2>
          {!offers.length && <Empty title="Your next project starts here.">When Buff prepares an offer for you, you can review and sign it here. <PortalLink href="/dashboard/conversations#new">Tell us what you have in mind<ArrowUpRight size={14} /></PortalLink></Empty>}
          <div className="divide-y divide-border">{offers.map(offer => {
            const status = getOfferStatus(offer);
            return <article key={offer.id} className="py-5 first:pt-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-medium capitalize">{offer.tarif}</h3><p className="mt-1 text-sm text-muted-foreground">{money(offer.recurring)} / {offer.cycle === "monatlich" ? "month" : "year"} · {money(offer.setup)} setup</p></div><Status value={status} /></div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{status === "pending" ? "Available until" : "Offer expiry"} {date(offer.expiresAt)} · incl. VAT</p>{status === "pending" ? <PortalLink href={`/sales/order/sign/${offer.token}`}>Review & sign<ArrowUpRight size={14} /></PortalLink> : <PortalLink href="/dashboard/conversations#new">Ask about this offer</PortalLink>}</div></article>;
          })}</div>
        </section>
        <section id="plans" className="scroll-mt-6"><h2 className="mb-5 text-xl font-semibold">Your plans</h2>
          {!plans.length && <Empty title="No active plans yet.">Once you sign an offer, your plan and agreed services will appear here.</Empty>}
          <div className="divide-y divide-border">{plans.map(plan => <article key={plan.id} className="py-5 first:pt-0"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-medium capitalize">{plan.tarif}</h3><p className="mt-1 text-sm text-muted-foreground">{plan.company} · Signed {date(plan.signedAt)}</p></div><Status value={plan.status} /></div>{plan.description && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{plan.description}</p>}<p className="mt-4 text-sm font-medium">{money(plan.recurring)} <span className="font-normal text-muted-foreground">/ {plan.cycle === "monatlich" ? "month" : "year"}, incl. VAT</span></p></article>)}</div>
        </section>
      </div>
      <div className="space-y-10 xl:border-l xl:border-border xl:pl-8">
        <section><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">Conversations</h2><PortalLink href="/dashboard/conversations">View all</PortalLink></div>
          {!conversations.length && <p className="text-sm leading-6 text-muted-foreground">A question, an idea, or a small change? Start a conversation and keep the replies together.</p>}
          <div className="divide-y divide-border">{conversations.map(conversation => <div key={conversation.id} className="py-3"><PortalLink href={`/dashboard/conversations/${conversation.id}`}>{conversation.subject}</PortalLink><div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{date(conversation.updatedAt)}</span><Status value={conversation.status} /></div></div>)}</div>
          <PortalLink href="/dashboard/conversations#new">Start a conversation<ArrowUpRight size={14} /></PortalLink>
        </section>
        <section id="tips" className="scroll-mt-6 border-t border-border pt-8"><h2 className="mb-5 text-lg font-semibold">A few useful tips</h2><div className="space-y-6">
          <div><h3 className="text-sm font-medium">Give every request a little context.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Share the page, what you want to change, and your ideal deadline. It helps us get straight to work.</p></div>
          <div><h3 className="text-sm font-medium">Keep project assets together.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Send a link to your logo, copy, and photos in a conversation so the team can find them.</p></div>
          <div><h3 className="text-sm font-medium">Review the details before signing.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Check the scope, setup fee, and billing cycle in your offer. Ask us if anything needs adjusting.</p></div>
        </div></section>
      </div>
    </div>
  </>;
}
