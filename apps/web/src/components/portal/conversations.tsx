import { db, schema, eq, desc, asc, and } from "@platform/db";
import { notFound, redirect } from "next/navigation";
import { getPortalUser } from "@/lib/portal";
import { startConversation, replyToConversation, setConversationStatus } from "@/lib/portal-actions";
import { ActionForm } from "./action-form";
import { PageHeading, PortalLink, Status, Empty, Field, fieldClass, date } from "./ui";
import { ArrowLeft } from "lucide-react";
import { RefreshMessages } from "./refresh-messages";

export async function ConversationsPage({ isAdmin = false, searchParams }: { isAdmin?: boolean; searchParams: Promise<{ customer?: string; page?: string }> }) {
  const user = await getPortalUser();
  if (isAdmin && user.role !== "admin") redirect("/dashboard");
  const params = await searchParams;
  const page = Math.max(1, Math.min(100000, Number(params.page) || 1));
  const base = isAdmin ? "/admin/conversations" : "/dashboard/conversations";
  const [threads, customers] = await Promise.all([
    db.select({ conversation: schema.conversations, customerName: schema.users.name }).from(schema.conversations).innerJoin(schema.users, eq(schema.users.id, schema.conversations.customerUserId)).where(isAdmin ? undefined : eq(schema.conversations.customerUserId, user.id)).orderBy(desc(schema.conversations.updatedAt)).limit(31).offset((Math.floor(page) - 1) * 30),
    isAdmin ? db.select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).orderBy(asc(schema.users.name)) : Promise.resolve([]),
  ]);
  return <><PageHeading title="Nachrichten" description={isAdmin ? "Fragen, Updates und Ideen Deiner Kunden. Halte jedes Gespräch am Laufen." : "Sprich mit dem Buff-Team. Ein Thema, ein Gespräch, alles an einem Ort."}><RefreshMessages /></PageHeading>
    <div className="grid items-start gap-10 xl:grid-cols-5"><section className="xl:col-span-3"><h2 className="mb-5 text-lg font-semibold">Neueste Gespräche</h2>
      {!threads.length && <Empty title="Hier ist noch nichts.">Stell eine Frage oder erzähl uns, woran Du gerade arbeitest.</Empty>}
      <div className="divide-y divide-border">{threads.slice(0, 30).map(({ conversation, customerName }) => <article key={conversation.id} className="py-4 first:pt-0"><div className="flex items-start justify-between gap-3"><PortalLink href={`${base}/${conversation.id}`} icon={null}>{conversation.subject}</PortalLink><Status value={conversation.status} /></div><p className="mt-2 text-xs text-muted-foreground">{isAdmin ? `${customerName} · ` : ""}Aktualisiert am {date(conversation.updatedAt)}</p></article>)}</div>
      <div className="mt-4 flex justify-between">{page > 1 && <PortalLink href={`${base}?page=${page - 1}`} icon={ArrowLeft}>Zurück</PortalLink>}{threads.length > 30 && <PortalLink href={`${base}?page=${page + 1}`}>Weiter</PortalLink>}</div>
    </section><section id="new" className="scroll-mt-6 rounded-xl border border-border p-5 sm:p-6 xl:col-span-2"><h2 className="mb-5 text-lg font-semibold">Gespräch starten</h2><ActionForm action={startConversation} submitLabel="Nachricht senden">
      {isAdmin && <label className="block space-y-2 text-sm"><span>Kunde</span><select name="customerUserId" defaultValue={params.customer ?? ""} required className={fieldClass}><option value="" disabled>Kunden auswählen</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email}</option>)}</select></label>}
      <Field name="subject" label="Worum geht es?" required maxLength={160} />
      <label className="block space-y-2 text-sm"><span>Deine Nachricht</span><textarea name="body" required rows={6} maxLength={10000} className={fieldClass} placeholder="Etwas Kontext hilft uns, Dir schneller zu helfen." /></label>
    </ActionForm></section></div></>;
}

export async function ConversationPage({ isAdmin = false, params }: { isAdmin?: boolean; params: Promise<{ id: string }> }) {
  const user = await getPortalUser();
  if (isAdmin && user.role !== "admin") redirect("/dashboard");
  const { id } = await params;
  const [conversation] = await db.select().from(schema.conversations).where(and(eq(schema.conversations.id, id), isAdmin ? undefined : eq(schema.conversations.customerUserId, user.id))).limit(1);
  if (!conversation) notFound();
  const messages = await db.select({ message: schema.conversationMessages, name: schema.users.name, role: schema.users.role }).from(schema.conversationMessages).innerJoin(schema.users, eq(schema.users.id, schema.conversationMessages.authorId)).where(eq(schema.conversationMessages.conversationId, id)).orderBy(asc(schema.conversationMessages.createdAt), asc(schema.conversationMessages.id));
  return <div className="mx-auto max-w-3xl"><PortalLink href={isAdmin ? "/admin/conversations" : "/dashboard/conversations"} icon={ArrowLeft}>Zurück zu den Nachrichten</PortalLink><div className="mt-6"><PageHeading title={conversation.subject} description={`Gestartet am ${date(conversation.createdAt)}`}><Status value={conversation.status} /><RefreshMessages /></PageHeading></div>
    <ol className="space-y-6">{messages.map(({ message, name, role }) => <li key={message.id} className={`rounded-xl border p-5 sm:p-6 ${message.authorId === user.id ? "border-border bg-secondary/40" : "border-border bg-background"}`}><div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-medium">{name}{role === "admin" ? " · Buff-Team" : ""}{message.authorId === user.id ? " · Du" : ""}</span><time dateTime={message.createdAt.toISOString()} className="text-muted-foreground">{date(message.createdAt)} · {message.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })}</time></div><p className="whitespace-pre-wrap break-words text-sm leading-7">{message.body}</p></li>)}</ol>
    <section className="mt-8 border-t border-border pt-8">{conversation.status === "open" ? <ActionForm action={replyToConversation.bind(null, id)} submitLabel="Antwort senden" resetOnSuccess><label className="block space-y-3 text-sm font-medium"><span>Deine Antwort</span><textarea name="body" required rows={5} maxLength={10000} className={fieldClass} /></label></ActionForm> : <p className="text-sm text-muted-foreground">Dieses Gespräch ist geschlossen. Öffne es wieder, wenn Du noch etwas brauchst.</p>}
      <ActionForm action={setConversationStatus.bind(null, id)} submitLabel={conversation.status === "open" ? "Gespräch schließen" : "Gespräch wieder öffnen"} className="mt-6"><input type="hidden" name="status" value={conversation.status === "open" ? "closed" : "open"} /></ActionForm>
    </section></div>;
}
