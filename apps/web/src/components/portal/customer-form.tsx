import { saveUser } from "@/lib/portal-actions";
import { ActionForm } from "./action-form";
import { Field, fieldClass } from "./ui";

export function CustomerForm({ user, organizations, actorId }: {
  user?: { id: string; name: string; email: string; phone: string | null; company: string | null; role: string; organizationId: string | null };
  organizations: { id: string; name: string }[];
  actorId: string;
}) {
  return <ActionForm action={saveUser.bind(null, user?.id ?? "")} submitLabel={user ? "Kunde speichern" : "Kunde anlegen"} resetOnSuccess={!user}>
    <div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Vollständiger Name" required value={user?.name} maxLength={150} /><Field name="email" label="E-Mail-Adresse" type="email" required value={user?.email} maxLength={254} /><Field name="phone" label="Telefon" type="tel" value={user?.phone} maxLength={80} /><Field name="company" label="Firmenname" value={user?.company} /></div>
    <label className="block space-y-2 text-sm"><span>Organisation</span><select name="organizationId" defaultValue={user?.organizationId ?? ""} className={fieldClass}><option value="">Keine Organisation zugeordnet</option>{organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select><span className="block text-xs text-muted-foreground">Mit der Organisation wird auch der Firmenname aktualisiert. Angebote und Gespräche bleiben für diesen Kunden privat.</span></label>
    <label className="block space-y-2 text-sm"><span>Zugriffsrolle</span>{user?.id === actorId ? <><input type="hidden" name="role" value="admin" /><p className="text-muted-foreground">Admin · Dein eigener Zugang ist geschützt</p></> : <select name="role" defaultValue={user?.role ?? "user"} className={fieldClass}><option value="user">Kunde</option><option value="admin">Admin — voller Zugriff</option></select>}</label>
    <p className="text-xs leading-5 text-muted-foreground">{user ? "Wenn Du E-Mail oder Rolle änderst, wird dieser Kunde abgemeldet. Eine neue E-Mail-Adresse muss erneut bestätigt werden." : "Legt ein Konto ohne Passwort an. Erstelle ein Angebot, um diesen Kunden per Magic-Link einzuladen."}</p>
  </ActionForm>;
}
