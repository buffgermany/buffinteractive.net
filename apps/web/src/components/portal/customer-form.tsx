import { saveUser } from "@/lib/portal-actions";
import { ActionForm } from "./action-form";
import { Field, fieldClass } from "./ui";

export function CustomerForm({ user, organizations, actorId }: {
  user?: { id: string; name: string; email: string; phone: string | null; company: string | null; role: string; organizationId: string | null };
  organizations: { id: string; name: string }[];
  actorId: string;
}) {
  return <ActionForm action={saveUser.bind(null, user?.id ?? "")} submitLabel={user ? "Save customer" : "Create customer"} resetOnSuccess={!user}>
    <div className="grid gap-4 sm:grid-cols-2"><Field name="name" label="Full name" required value={user?.name} maxLength={150} /><Field name="email" label="Email address" type="email" required value={user?.email} maxLength={254} /><Field name="phone" label="Phone" type="tel" value={user?.phone} maxLength={80} /><Field name="company" label="Company name" value={user?.company} /></div>
    <label className="block space-y-2 text-sm"><span>Organization</span><select name="organizationId" defaultValue={user?.organizationId ?? ""} className={fieldClass}><option value="">No organization assigned</option>{organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select><span className="block text-xs text-muted-foreground">Assigning an organization also updates the company name. Offers and conversations stay private to this customer.</span></label>
    <label className="block space-y-2 text-sm"><span>Access role</span>{user?.id === actorId ? <><input type="hidden" name="role" value="admin" /><p className="text-muted-foreground">Admin · your own access is protected</p></> : <select name="role" defaultValue={user?.role ?? "user"} className={fieldClass}><option value="user">Customer</option><option value="admin">Admin — full workspace access</option></select>}</label>
    <p className="text-xs leading-5 text-muted-foreground">{user ? "Changing an email or role signs this customer out. An updated email must be verified again." : "Creates an account without a password. Create an offer to invite this customer through the existing magic-link flow."}</p>
  </ActionForm>;
}
