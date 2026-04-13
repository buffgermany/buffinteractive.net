"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Key, ShoppingBag, Zap, Server, Users, ArrowUpRight, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

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

function useCountUp(target: number, duration = 1200) {
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.08 }}
      className="group flex flex-col gap-2 py-8 border-b border-white/5 md:border-b-0 md:border-r last:border-r-0 px-8 first:pl-0 last:pr-0 relative overflow-hidden"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(204,255,0,0.05)_0,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/15">
          <Icon className="h-3.5 w-3.5 text-[#CCFF00]" />
        </div>
        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#A0A0B0]">{label}</span>
      </div>
      <span ref={ref} className="font-heading font-black text-7xl lg:text-8xl leading-none tracking-tighter text-white tabular-nums" style={{ WebkitFontSmoothing: "antialiased" }}>
        {count}
      </span>
    </motion.div>
  );
}

// ============================================================
// Status Config
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Active", color: "text-[#CCFF00]", icon: CheckCircle2 },
  suspended: { label: "Suspended", color: "text-amber-400", icon: AlertCircle },
  expired: { label: "Expired", color: "text-[#A0A0B0]", icon: Clock },
  revoked: { label: "Revoked", color: "text-red-400", icon: XCircle },
  paid: { label: "Paid", color: "text-[#CCFF00]", icon: CheckCircle2 },
  pending: { label: "Pending", color: "text-amber-400", icon: Clock },
  refunded: { label: "Refunded", color: "text-[#A0A0B0]", icon: XCircle },
};

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  self_hosted: "Self-Hosted",
  human_service: "Human Service",
  saas: "SaaS",
};

// ============================================================
// License Row
// ============================================================

function LicenseRow({ license, index }: { license: License; index: number }) {
  const statusCfg = STATUS_CONFIG[license.status] ?? { label: license.status, color: "text-[#A0A0B0]", icon: Clock };
  const StatusIcon = statusCfg.icon;
  const ProductIcon = license.product.type === "self_hosted" ? Server : license.product.type === "human_service" ? Users : Zap;
  const isActive = license.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 + index * 0.06 }}
    >
      <Link
        href={`/dashboard/licenses/${license.id}`}
        className={`group relative flex items-center gap-6 py-5 px-6 transition-all duration-300 hover:bg-white/[0.03] ${isActive ? "border-l-2 border-[#CCFF00]" : "border-l-2 border-transparent"}`}
      >
        {/* Type tag */}
        <span className="hidden lg:block w-28 shrink-0 text-[9px] font-mono uppercase tracking-[0.2em] text-[#A0A0B0]">
          {PRODUCT_TYPE_LABEL[license.product.type] ?? license.product.type}
        </span>

        {/* Product icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${isActive ? "bg-[#CCFF00]/10 border-[#CCFF00]/20 group-hover:bg-[#CCFF00]/15" : "bg-white/5 border-white/5 group-hover:bg-white/10"}`}>
          <ProductIcon className={`h-4 w-4 ${isActive ? "text-[#CCFF00]" : "text-[#A0A0B0]"}`} />
        </div>

        {/* Product name + key */}
        <div className="flex-1 overflow-hidden">
          <p className="text-base font-bold text-white truncate group-hover:text-white/90 transition-colors">{license.product.name}</p>
          <p className="text-[11px] font-mono text-[#A0A0B0] truncate mt-0.5">{license.licenseKey}</p>
        </div>

        {/* Status */}
        <div className={`hidden sm:flex items-center gap-1.5 ${statusCfg.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          <span className="text-[10px] font-mono uppercase tracking-widest">{statusCfg.label}</span>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="h-4 w-4 text-[#A0A0B0] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
      </Link>
    </motion.div>
  );
}

// ============================================================
// Order Timeline Item
// ============================================================

function OrderTimelineItem({ order, index, isLast }: { order: Order; index: number; isLast: boolean }) {
  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "text-[#A0A0B0]", icon: Clock };
  const StatusIcon = statusCfg.icon;
  const opacity = Math.max(0.35, 1 - index * 0.15);
  const isFirst = index === 0;

  const formattedAmount = new Intl.NumberFormat("en", {
    style: "currency",
    currency: order.currency?.toUpperCase() ?? "EUR",
    minimumFractionDigits: 2,
  }).format(order.amountCents / 100);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: opacity, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.4 + index * 0.07 }}
      className="relative flex gap-4 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[7px] top-6 w-px h-full bg-white/5" />
      )}

      {/* Dot */}
      <div className={`relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${isFirst ? "border-[#CCFF00] bg-[#CCFF00]" : "border-white/20 bg-[#0A0A0A]"}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-3 w-3 shrink-0 ${statusCfg.color}`} />
            <span className={`text-[9px] font-mono uppercase tracking-widest ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
          <span className={`font-heading font-black text-base tracking-tight ${isFirst ? "text-white" : "text-white/70"}`}>
            {formattedAmount}
          </span>
        </div>
        <p className="text-[10px] font-mono text-[#A0A0B0] mt-1 truncate">{order.externalOrderId}</p>
        <p className="text-[10px] text-[#A0A0B0] mt-0.5">{formattedDate}</p>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Client Component
// ============================================================

export function DashboardClient({ userName, licenses, orders }: DashboardClientProps) {
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const uniqueProducts = new Set(licenses.map((l) => l.productId)).size;
  const firstName = userName.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 py-10 space-y-16">
      {/* ── Greeting ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
      >
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#A0A0B0] mb-2">Command Center</p>
        <h1 className="font-heading font-black text-5xl sm:text-6xl tracking-tighter text-white leading-none">
          {firstName}.
        </h1>
      </motion.div>

      {/* ── KPI Bar ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="border-t border-white/5"
      >
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          <StatBlock label="Active Licenses" value={activeLicenses} icon={Key} index={0} />
          <StatBlock label="Total Orders" value={orders.length} icon={ShoppingBag} index={1} />
          <StatBlock label="Products owned" value={uniqueProducts} icon={Zap} index={2} />
        </div>
        <div className="border-t border-white/5" />
      </motion.div>

      {/* ── Main Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

        {/* License List — 2/3 */}
        <div className="lg:col-span-2 lg:border-r border-white/5">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-6 lg:pr-10">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#A0A0B0]">Your Licenses</p>
              <p className="text-xs text-[#A0A0B0] mt-1">{licenses.length} total · {activeLicenses} active</p>
            </div>
          </div>

          {licenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-start gap-4 py-16 pl-6 border-l-2 border-dashed border-white/10"
            >
              <Key className="h-8 w-8 text-[#A0A0B0]/30" />
              <p className="text-xl font-bold text-white">No licenses yet</p>
              <p className="text-sm text-[#A0A0B0] max-w-xs leading-relaxed">Purchase a product to get your first license. All your keys will live here.</p>
              <Link href="/#products">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-2 text-sm font-bold text-[#CCFF00] hover:underline"
                >
                  Browse products <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {licenses.map((license, i) => (
                <LicenseRow key={license.id} license={license} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Order Timeline — 1/3 */}
        <div className="lg:pl-10 pt-8 lg:pt-0">
          <div className="pb-6">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#A0A0B0]">Recent Activity</p>
            <p className="text-xs text-[#A0A0B0] mt-1">{orders.length} orders</p>
          </div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="pl-4 border-l border-dashed border-white/10 py-8"
            >
              <p className="text-sm text-[#A0A0B0]">No activity yet.</p>
            </motion.div>
          ) : (
            <div>
              {orders.map((order, i) => (
                <OrderTimelineItem key={order.id} order={order} index={i} isLast={i === orders.length - 1} />
              ))}
            </div>
          )}
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
      <div className="space-y-3">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-16 w-48 bg-white/10 rounded" />
      </div>
      <div className="border-t border-white/5">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 py-8 px-8">
              <div className="h-3 w-28 bg-white/5 rounded mb-4" />
              <div className="h-16 w-20 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <div className="border-t border-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 lg:border-r border-white/5 space-y-px">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-white/[0.02] border-l-2 border-transparent" />
          ))}
        </div>
        <div className="lg:pl-10 pt-8 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3.5 w-3.5 rounded-full bg-white/10 shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-white/5 rounded" />
                <div className="h-2 w-full bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
