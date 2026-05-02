"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Menu, X, LogOut, LayoutDashboard, Shield, Key, Download } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useSession, signOut } from "@/lib/auth-client";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

// ============================================================
// Storefront Navigation
// ============================================================

const NAV_LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteNav() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30 transition-all group-hover:bg-primary/20 group-hover:ring-primary/50">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-foreground tracking-tight">Platform</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {session ? (
            <>
              {((session.user as any).role === "admin" || (session.user as any).role === "ADMIN") && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="glow-primary-sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-3 p-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ThemeToggle />
              </div>
              {session ? (
                <>
                  <Link href="/dashboard"><Button variant="outline" className="w-full">Dashboard</Button></Link>
                  <Button variant="ghost" className="w-full" onClick={() => signOut()}>Sign out</Button>
                </>
              ) : (
                <>
                  <Link href="/sign-in"><Button variant="outline" className="w-full">Sign in</Button></Link>
                  <Link href="/sign-up"><Button className="w-full">Get started</Button></Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

// ============================================================
// Dashboard Top Rail
// ============================================================

const DASHBOARD_NAV: { href: string; label: string; icon: any }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/licenses", label: "Licenses", icon: Key },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
];

export function DashboardTopRail({ currentPath }: { currentPath: string }) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const initials = session?.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading font-black text-xl tracking-tighter text-white hover:text-[#CCFF00] transition-colors duration-300"
        >
          Buff.
        </Link>

        {/* Nav Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-1.5 backdrop-blur-md">
          {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
            const active = currentPath === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors duration-200",
                  active ? "text-black" : "text-[#A0A0B0] hover:text-white"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="toprail-active-pill"
                    className="absolute inset-0 bg-[#CCFF00] rounded-full z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              </Link>
            );
          })}
          {((session?.user as any)?.role === "admin" || (session?.user as any)?.role === "ADMIN") && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Shield className="h-3 w-3" />
              Admin
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-medium text-white leading-none">{session?.user.name}</span>
            <span className="text-[10px] text-[#A0A0B0] font-mono">{session?.user.email}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[11px] font-bold text-[#CCFF00]">
            {initials}
          </div>
          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/auth"; } } })}
            className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#A0A0B0] hover:text-white hover:border-white/30 transition-all duration-200"
            aria-label="Sign out"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
