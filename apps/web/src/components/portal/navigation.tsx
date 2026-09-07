"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, MessageSquare, Layers, Lightbulb, Users, Building2, ArrowUpRight, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/primitives";

export function PortalNavigation({ isAdmin = false, canAdmin = false, name }: { isAdmin?: boolean; canAdmin?: boolean; name: string }) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");
  const links = isAdmin ? [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/organizations", label: "Organizations", icon: Building2 },
    { href: "/admin/plans", label: "Plans", icon: Layers },
    { href: "/sales/order", label: "Create offer", icon: FileText },
  ] : [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard#offers", label: "Offers", icon: FileText },
    { href: "/dashboard#plans", label: "Plans", icon: Layers },
    { href: "/dashboard/conversations", label: "Conversations", icon: MessageSquare },
    { href: "/dashboard#tips", label: "Tips", icon: Lightbulb },
  ];
  return <aside className="border-b border-border bg-background lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
    <div className="flex items-center justify-between px-5 py-6 lg:px-6"><Link href={isAdmin ? "/admin" : "/dashboard"} className="rounded font-heading text-3xl font-bold tracking-tight focus-visible:ring-2 focus-visible:ring-ring">Buff<span className="text-primary">.</span></Link><span className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "Client space"}</span></div>
    <nav aria-label={isAdmin ? "Admin navigation" : "Customer navigation"} className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:py-4">
      {links.map(({ href, label, icon: Icon }) => {
        const isCurrent = !href.includes("#") && (pathname === href || (href.endsWith("conversations") && pathname.startsWith(href)));
        return <Link key={href} href={href} aria-current={isCurrent ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-70 ${isCurrent ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"}`}><Icon aria-hidden="true" className={`h-4 w-4 ${isCurrent ? "text-primary" : ""}`} />{label}</Link>;
      })}
    </nav>
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3 lg:block lg:space-y-3 lg:p-5">
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
      {(isAdmin || canAdmin) && <Link href={isAdmin ? "/dashboard" : "/admin"} className="flex items-center gap-2 rounded py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{isAdmin ? "Open client space" : "Open admin"}<ArrowUpRight size={14} /></Link>}
      <Button variant="ghost" size="sm" disabled={isSigningOut} onClick={async () => {
        setIsSigningOut(true); setError("");
        try { const result = await signOut(); if (result.error) throw new Error(); window.location.href = "/auth"; }
        catch { setError("Could not sign out. Try again."); setIsSigningOut(false); }
      }}><LogOut size={14} />{isSigningOut ? "Signing out…" : "Sign out"}</Button>
      {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    </div>
  </aside>;
}
