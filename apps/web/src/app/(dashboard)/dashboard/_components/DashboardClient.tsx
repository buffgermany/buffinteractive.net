"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { Key, ShoppingBag, Zap, Server, Users, ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface License {
  id: string;
  licenseKey: string;
  status: string;
  hardwareId?: string | null;
  createdAt: Date;
  productId: string;
  product: {
    name: string;
    type: string;
  };
}

interface Order {
  id: string;
  externalOrderId: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: Date;
}

interface DashboardClientProps {
  userName: string;
  licenses: License[];
  orders: Order[];
}

// ============================================================
// Count-Up Animation Hook
// ============================================================

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ============================================================
// KPI Stat Component
// ============================================================

function StatBlock({ label, value, icon: Icon, index }: { label: string; value: number; icon: any; index: number }) {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 + index * 0.1 }}
      className="group flex flex-col gap-3 py-10 px-8 relative overflow-hidden glass rounded-3xl border-white/5 hover:border-primary/20 transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500">
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground group-hover:text-primary/70 transition-colors uppercase">{label}</span>
      </div>
      
      <div className="mt-4 relative z-10">
        <span ref={ref} className="font-heading font-bold text-6xl lg:text-7xl leading-none tracking-tighter text-white tabular-nums">
          {count}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================
// Status Config
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bgColor: string; borderColor: string }> = {
  active: { label: "Active", color: "text-primary", icon: CheckCircle2, bgColor: "bg-primary/10", borderColor: "border-primary/20" },
  suspended: { label: "Suspended", color: "text-amber-400", icon: AlertCircle, bgColor: "bg-amber-400/10", borderColor: "border-amber-400/20" },
  expired: { label: "Expired", color: "text-muted-foreground", icon: Clock, bgColor: "bg-muted-foreground/10", borderColor: "border-muted-foreground/20" },
  revoked: { label: "Revoked", color: "text-red-400", icon: XCircle, bgColor: "bg-red-400/10", borderColor: "border-red-400/20" },
  paid: { label: "Paid", color: "text-primary", icon: CheckCircle2, bgColor: "bg-primary/10", borderColor: "border-primary/20" },
  pending: { label: "Pending", color: "text-amber-400", icon: Clock, bgColor: "bg-amber-400/10", borderColor: "border-amber-400/20" },
  refunded: { label: "Refunded", color: "text-muted-foreground", icon: XCircle, bgColor: "bg-muted-foreground/10", borderColor: "border-muted-foreground/20" },
};

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  self_hosted: "Infrastructure",
  human_service: "Strategic Service",
  saas: "Digital Arsenal",
};

// ============================================================
// License Row
// ============================================================

function LicenseRow({ license, index }: { license: License; index: number }) {
  const statusCfg = STATUS_CONFIG[license.status] ?? STATUS_CONFIG["expired"];
  const StatusIcon = statusCfg.icon;
  const ProductIcon = license.product.type === "self_hosted" ? Server : license.product.type === "human_service" ? Users : Zap;
  const isExpired = license.status === "expired" || license.status === "revoked";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 + index * 0.05 }}
    >
      <Link
        href={`/dashboard/licenses/${license.id}`}
        className={cn(
            "group relative flex items-center gap-6 py-6 px-8 transition-all duration-300 hover:bg-white/[0.04] border-l-2",
            isExpired ? "border-transparent opacity-60 grayscale" : "border-primary/40 hover:border-primary"
        )}
      >
        <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500",
            !isExpired ? "bg-primary/5 border-primary/10 group-hover:bg-primary group-hover:text-background group-hover:border-primary" : "bg-white/5 border-white/5"
        )}>
          <ProductIcon size={22} strokeWidth={2.5} className={cn(!isExpired && "group-hover:text-background")} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-lg font-bold text-white truncate">{license.product.name}</p>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">
                {PRODUCT_TYPE_LABEL[license.product.type] ?? license.product.type}
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground truncate opacity-70 group-hover:opacity-100 transition-opacity">{license.licenseKey}</p>
        </div>

        <div className={cn("hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all", statusCfg.color, statusCfg.bgColor, statusCfg.borderColor)}>
          <StatusIcon size={12} strokeWidth={3} />
          {statusCfg.label}
        </div>

        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </Link>
    </motion.div>
  );
}

// ============================================================
// Order Row
// ============================================================

function OrderRow({ order, index }: { order: Order; index: number }) {
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
  const formattedAmount = new Intl.NumberFormat("en", {
    style: "currency",
    currency: order.currency?.toUpperCase() ?? "EUR",
  }).format(order.amountCents / 100);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en", {
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.05 }}
      className="flex items-center justify-between py-4 group"
    >
        <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{formattedAmount}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{order.externalOrderId}</span>
        </div>
        <div className="flex flex-col items-end text-right">
            <span className="text-[10px] text-muted-foreground mb-1">{formattedDate}</span>
            <div className={cn("text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border leading-none", statusCfg.color, statusCfg.borderColor, statusCfg.bgColor)}>
                {statusCfg.label}
            </div>
        </div>
    </motion.div>
  );
}

// ============================================================
// Hero Section
// ============================================================

function DashboardHero({ firstName }: { firstName: string }) {
    return (
        <section className="relative py-12 md:py-24 flex flex-col items-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
            >
                <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-tighter text-white leading-tight mb-6">
                    Moin, <span className="text-primary">{firstName}</span>.
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed opacity-80">
                    Your digital arsenal is active. Manage licenses, track orders, and scale your deployment.
                </p>
            </motion.div>
        </section>
    );
}

// ============================================================
// Main Client Component
// ============================================================

export function DashboardClient({ userName, licenses, orders }: DashboardClientProps) {
  const activeLicenses = useMemo(() => licenses.filter((l) => l.status === "active").length, [licenses]);
  const uniqueProducts = useMemo(() => new Set(licenses.map((l) => l.productId)).size, [licenses]);
  const firstName = userName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 pb-32">
      
      <DashboardHero firstName={firstName} />

      {/* ── Stat Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <StatBlock label="Active Licenses" value={activeLicenses} icon={Key} index={0} />
        <StatBlock label="Order History" value={orders.length} icon={ShoppingBag} index={1} />
        <StatBlock label="Products in Arsenal" value={uniqueProducts} icon={Zap} index={2} />
      </div>

      {/* ── Premium Bento Content ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Licenses Panel (Largest) */}
        <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-heading font-bold tracking-tight">Your Arsenal</h2>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded border border-white/5">{licenses.length} Total</span>
                </div>
                {licenses.length > 0 && (
                    <Link href="/dashboard/licenses" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                        View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                )}
            </div>

            {licenses.length === 0 ? (
                <div className="flex-1 glass rounded-[2.5rem] border-white/5 p-12 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 h-20 w-20 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 opacity-20">
                        <Key size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 uppercase tracking-tight">The arsenal is empty</h3>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        You haven't acquired any digital licenses yet. Unlock infrastructure and strategic services.
                    </p>
                    <Link href="/#products">
                        <button className="interactive-pill bg-primary text-background px-10 py-3 font-bold uppercase text-sm hover:scale-105 transition-transform shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                            Browse Products
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="glass rounded-[2rem] border-white/5 overflow-hidden divide-y divide-white/[0.04]">
                    {licenses.slice(0, 6).map((license, i) => (
                        <LicenseRow key={license.id} license={license} index={i} />
                    ))}
                    {licenses.length > 6 && (
                        <Link href="/dashboard/licenses" className="block py-6 text-center text-xs font-bold text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10">
                            + {licenses.length - 6} more licenses. View full arsenal.
                        </Link>
                    )}
                </div>
            )}
        </div>

        {/* Sidebar Panel (Orders & Status) */}
        <div className="lg:col-span-4 space-y-10">
            {/* Orders Section */}
            <div>
                <h3 className="text-xl font-heading font-bold mb-8 flex items-center justify-between">
                    Recent Orders
                    <Link href="/dashboard/orders" className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">History</Link>
                </h3>
                <div className="glass rounded-[2rem] border-white/5 p-8 divide-y divide-white/[0.04]">
                    {orders.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center italic">No orders detected.</p>
                    ) : (
                        orders.slice(0, 5).map((order, i) => (
                            <OrderRow key={order.id} order={order} index={i} />
                        ))
                    )}
                </div>
            </div>

            {/* Quick Support Card */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="glass rounded-[2rem] border-primary/20 p-8 bg-gradient-to-br from-primary/10 to-transparent relative group overflow-hidden cursor-pointer"
            >
                <div className="absolute top-2 right-2 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={20} />
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-background mb-4 transition-transform group-hover:rotate-12">
                    <Zap size={20} />
                </div>
                <h4 className="text-lg font-bold mb-2">Need strategic support?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    Our engineering team is ready to scale your infrastructure or fix bottlenecks.
                </p>
                <Link href="/#contact" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                    Initialize Comms
                </Link>
            </motion.div>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// Skeleton (Optimistic Loader)
// ============================================================

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-10 space-y-16 animate-pulse">
      <div className="space-y-4 pt-12">
        <div className="h-3 w-32 bg-white/5 rounded" />
        <div className="h-20 w-96 bg-white/10 rounded-2xl" />
        <div className="h-4 w-64 bg-white/5 rounded" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 glass rounded-3xl border-transparent bg-white/5" />
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 h-96 glass rounded-[2rem] border-transparent bg-white/5" />
        <div className="lg:col-span-4 h-96 glass rounded-[2rem] border-transparent bg-white/5" />
      </div>
    </div>
  );
}
