"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Server, Zap, Users, CheckCircle2 } from "lucide-react";
import { GlowCard } from "@/components/premium/effects";
import { Button, Badge, Skeleton } from "@/components/ui/primitives";
import { WigglyUnderline } from "@/components/premium/organic-ui";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@platform/shared";

const PRODUCT_ICONS: Record<string, React.ElementType> = {
  saas: Zap,
  self_hosted: Server,
  human_service: Users,
};

const PRODUCT_COLORS: Record<string, string> = {
  saas: "text-violet-400 bg-violet-500/10",
  self_hosted: "text-sky-400 bg-sky-500/10",
  human_service: "text-emerald-400 bg-emerald-500/10",
};

const PRODUCT_LABELS: Record<string, string> = {
  saas: "SaaS",
  self_hosted: "Self-Hosted",
  human_service: "Human Service",
};

// ============================================================
// Product Card
// ============================================================

export function ProductCard({ product }: { product: Product }) {
  const Icon = PRODUCT_ICONS[product.type] ?? Zap;
  const colorClass = PRODUCT_COLORS[product.type] ?? "";
  const label = PRODUCT_LABELS[product.type] ?? product.type;

  return (
    <GlowCard>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {label}
          </Badge>
        </div>

        {/* Body */}
        <div>
          <h3 className="text-lg font-semibold leading-snug">{product.name}</h3>
          {product.shortDescription && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Features placeholder */}
        <ul className="space-y-1.5">
          {["Instant delivery", "Full documentation", "Priority support"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(product.priceCents, product.currency)}
            </span>
            {product.type === "saas" && (
              <span className="ml-1 text-xs text-muted-foreground">/mo</span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <Button size="sm" className="gap-1.5">
              View details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </GlowCard>
  );
}

// ============================================================
// Product Grid Skeleton (loading state)
// ============================================================

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="mb-1 h-4 w-full" />
          <Skeleton className="mb-6 h-4 w-2/3" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Products Section (used in storefront)
// ============================================================

export function ProductsSection({ products }: { products: Product[] }) {
  return (
    <section id="products" className="mx-auto max-w-7xl px-4 py-32 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Bespoke <br className="sm:hidden" />
          <WigglyUnderline className="font-serif italic font-normal text-muted-foreground mt-2">Deliverables.</WigglyUnderline>
        </h2>
        <p className="mt-6 text-muted-foreground text-lg">
          Professionally built tools and services. Ready to deploy today.
        </p>
      </motion.div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No products yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Products will appear here once they&apos;re published.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 30 },
                },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
