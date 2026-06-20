"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Shield, Clock, HardDrive, Cpu, Globe, Infinity
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { WigglyUnderline, MagneticElement, BentoCard } from "@/components/premium/organic-ui";
import type { Product as SharedProduct } from "@platform/shared";

type Product = SharedProduct & {
  shortDescription?: string | null;
  isFeatured?: boolean;
  imageKey?: string | null;
  updatedAt?: Date;
};

const PRODUCT_TYPE_GLOWS: Record<string, string> = {
  saas: "from-blue-500/10 to-transparent",
  self_hosted: "from-amber-500/10 to-transparent",
  human_service: "from-emerald-500/10 to-transparent",
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Checkout failed");
      }

      const { url } = await res.json() as { url: string };
      router.push(url);
    } catch (err) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="relative isolate">
      {/* Background Stage Glow */}
      <div className={cn(
        "absolute inset-0 -z-10 bg-linear-to-b blur-[120px] opacity-30 pointer-events-none",
        PRODUCT_TYPE_GLOWS[product.type] || "from-primary/10 to-transparent"
      )} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Editorial Stage */}
        <div className="mb-20 space-y-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-sm font-semibold tracking-widest uppercase text-muted-foreground"
          >
            <Shield className="h-4 w-4 text-primary" strokeWidth={2} />
            <span>{product.type.replace("_", " ")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] md:leading-[0.9]"
          >
            {product.name.split(" ").map((word, i) => (
              <span key={i} className="inline-block mr-4">
                {i % 2 === 1 ? (
                  <span className="font-serif italic font-normal text-muted-foreground">{word}</span>
                ) : (
                  word
                )}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-xl text-muted-foreground leading-relaxed font-medium"
          >
            {product.description}
          </motion.p>
        </div>

        {/* Ownership & Bento Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BentoCard className="flex flex-col justify-between h-64 border-primary/20 bg-primary/5">
                 <Infinity className="h-8 w-8 text-primary" strokeWidth={1.5} />
                 <div>
                    <h3 className="font-serif text-3xl italic mb-2 tracking-tight">Full License</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       {product.type === "self_hosted" 
                          ? "Truly own your binary. Perpetual hardware-locked license key included." 
                          : "Continuous cloud-managed availability with high SLA priority."}
                    </p>
                 </div>
              </BentoCard>

              <BentoCard className="flex flex-col justify-between h-64" glow>
                 <Clock className="h-8 w-8 text-foreground" strokeWidth={1.5} />
                 <div>
                    <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Access credentials or keys dispatched the moment your digital identity is verified.
                    </p>
                 </div>
              </BentoCard>

              {product.type === "self_hosted" && (
                <BentoCard className="flex flex-col justify-between h-64" delay={0.1}>
                   <HardDrive className="h-8 w-8 text-foreground" strokeWidth={1.5} />
                   <div>
                      <h3 className="text-xl font-bold mb-2">Local Binary</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                         Pre-compiled for standard linux/windows distributions. Zero external telemetry required.
                      </p>
                   </div>
                </BentoCard>
              )}

              <BentoCard className="flex flex-col justify-between h-64" delay={0.2}>
                 <Cpu className="h-8 w-8 text-foreground" strokeWidth={1.5} />
                 <div>
                    <h3 className="text-xl font-bold mb-2">Principal Support</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                       Direct email access to the engineering team for integration assistance.
                    </p>
                 </div>
              </BentoCard>
            </div>

            <div className="p-8 rounded-4xl border border-border bg-card/40 flex items-center gap-6">
               <Globe className="h-8 w-8 text-primary shrink-0" strokeWidth={1.5} />
               <p className="text-muted-foreground italic leading-relaxed font-serif text-lg">
                  "This architecture is built for the long game. We prioritize data sovereignty and extreme engineering over lazy abstractions."
               </p>
            </div>
          </div>

          {/* Pricing/Ownership Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <BentoCard className="p-10 border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl overflow-visible">
               <div className="space-y-8">
                  <div className="space-y-2">
                     <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Investment</span>
                     <div className="flex items-baseline gap-2">
                        <WigglyUnderline className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                           {formatCurrency(product.priceCents, product.currency)}
                        </WigglyUnderline>
                        {product.type === "saas" && (
                           <span className="text-lg text-muted-foreground font-medium italic font-serif">/mo</span>
                        )}
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     {[
                        "Complete digital access",
                        "Dedicated support channel",
                        "Future security patches included",
                        "Hardware portability (Self-Hosted)",
                     ].map(item => (
                        <div key={item} className="flex items-center gap-3 text-sm font-medium">
                           <CheckCircle2 className="h-4 w-4 text-primary" />
                           {item}
                        </div>
                     ))}
                  </div>

                  <MagneticElement pull={0.1}>
                    <Button
                      size="lg"
                      className="w-full h-16 text-lg rounded-2xl glow-primary shadow-xl shadow-primary/20 font-bold"
                      onClick={handleCheckout}
                      loading={loading}
                    >
                      {loading ? "Establishing Identity…" : "Secure Initial Access"}
                      {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </MagneticElement>

                  <p className="text-center text-xs text-muted-foreground opacity-60">
                     Trusted by visionary brands. Transaction handled securely via {product.paymentType === "digital_goods" ? "Lemon Squeezy" : "Stripe Invoicing"}.
                  </p>
               </div>
            </BentoCard>

            <div className="mt-8 px-6 grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl border border-border/50 bg-secondary/30 text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Global SLA</p>
                  <p className="font-bold">99.9%</p>
               </div>
               <div className="p-4 rounded-2xl border border-border/50 bg-secondary/30 text-center">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Latency</p>
                  <p className="font-bold">&lt; 50ms</p>
               </div>
            </div>
          </div>

        </div>

        {/* Global Footer (included in page.tsx) */}
      </div>
    </div>
  );
}

