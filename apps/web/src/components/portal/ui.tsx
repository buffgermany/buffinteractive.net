import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/primitives";

export const fieldClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
// No padding and no hover-only background: a portal link has to sit flush with
// the text around it, so it reads as a link before you ever point at it.
export const linkClass = "group inline-flex min-h-10 items-center gap-1.5 break-words rounded py-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-70";
export const money = (value: string) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Number(value));
export const date = (value: Date) => new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" }).format(value);
export const cycleLabel = (cycle: string) => (cycle === "monatlich" ? "Monat" : "Jahr");

const statusLabels: Record<string, string> = { active: "Aktiv", paused: "Pausiert", ended: "Beendet", open: "Offen", closed: "Geschlossen", pending: "Offen", signed: "Unterschrieben", expired: "Abgelaufen", cancelled: "Storniert" };

export function PageHeading({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <header className="mb-10 flex flex-wrap items-end justify-between gap-5"><div className="min-w-0"><h1 className="break-words font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{children}</header>;
}
export function Status({ value }: { value: string }) {
  const isActive = ["active", "open", "signed"].includes(value);
  return <span className={`inline-flex shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${isActive ? "border-primary/25 bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>{statusLabels[value] ?? value}</span>;
}
export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-border p-6 sm:p-8"><h3 className="font-medium">{title}</h3><div className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{children}</div></div>;
}
export function Field({ label, name, value, required = false, type = "text", maxLength = 200 }: { label: string; name: string; value?: string | null; required?: boolean; type?: string; maxLength?: number }) {
  return <label className="block space-y-2 text-sm"><span>{label}</span><Input name={name} defaultValue={value ?? ""} required={required} type={type} maxLength={maxLength} /></label>;
}
export function PortalLink({ href, children, icon: Icon = ArrowRight }: { href: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> | null }) {
  return <Link href={href} className={linkClass}>{children}{Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />}</Link>;
}
