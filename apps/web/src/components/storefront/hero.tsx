"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Hexagon, Code, Globe2, BarChart3, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { BackgroundBeams } from "@/components/premium/effects";
import { WigglyUnderline, MagneticElement, InfiniteMarquee, BentoCard } from "@/components/premium/organic-ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ============================================================
// Organic Asymmetric Hero
// ============================================================

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 sm:pt-32 pb-20">
      <BackgroundBeams />

      <div className="relative z-10 mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mt-12">
        {/* Left Side: Heavy Typography */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 space-y-8"
        >
          <motion.h1 
            variants={itemVariants} 
            className="text-6xl sm:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight font-bold"
          >
            Everything Digital. <br className="hidden md:block" />
            <span className="font-serif italic font-normal text-muted-foreground mr-3"><WigglyUnderline className="text-foreground z-10">Perfectly Polished.</WigglyUnderline></span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed pt-2"
          >
            A full-service digital concierge. We don't just build software — we scale your entire brand with elite engineering, marketing, and zero-ops hosting.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-6">
            <MagneticElement pull={0.05}>
              <Link href="/#services">
                <Button size="lg" className="h-14 px-8 text-base rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-medium">
                  Partner with us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </MagneticElement>
            
            <MagneticElement pull={0.05}>
              <Link href="/sign-up" className="text-muted-foreground hover:text-foreground font-medium transition-colors">
                Explore the portal →
              </Link>
            </MagneticElement>
          </motion.div>
        </motion.div>

        {/* Right Side: Abstract Editorial Graphic */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.6 }}
            className="hidden lg:flex lg:col-span-4 justify-center items-center relative"
        >
            <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl mix-blend-screen" />
            
            <motion.div 
                className="relative z-10 w-72 h-88 rounded-[2.5rem] border border-border bg-card/60 backdrop-blur-xl shadow-2xl p-8 flex flex-col justify-between overflow-hidden"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
                <Hexagon className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" strokeWidth={1.5} />
                <div className="space-y-2">
                    <h3 className="font-serif text-5xl italic font-medium leading-none tracking-tight">360°</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed uppercase tracking-widest">End-to-end mastery</p>
                </div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// Bento Grid Services Section
// ============================================================

export function FeaturesSection() {
  return (
    <section id="services" className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 z-20 relative">
      
      <div className="mb-24 text-center max-w-3xl mx-auto">
        <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Everything your brand needs. <br/>
          <WigglyUnderline className="font-serif italic font-normal text-muted-foreground mt-2">In one place.</WigglyUnderline>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[24rem]">
        
        {/* Box 1: Software (Large) */}
        <BentoCard className="md:col-span-2 lg:col-span-2 row-span-1 border-primary/20 bg-primary/10 overflow-hidden" delay={0.1}>
           <div className="flex flex-col h-full justify-between relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-background/50 backdrop-blur-md flex items-center justify-center border border-border/50 shadow-sm">
                 <Code className="h-7 w-7 text-primary" strokeWidth={1.5} />
              </div>
              <div className="max-w-xl">
                 <h3 className="font-serif text-[2.75rem] italic mb-4 leading-none tracking-tight">Custom Software</h3>
                 <p className="text-muted-foreground text-lg leading-relaxed">
                   From highly scalable SaaS platforms to self-hosted, hardware-locked enterprise tooling. We engineer robust, intelligent architectures—no lazy templates.
                 </p>
              </div>
           </div>
           
           <div className="absolute -bottom-24 -right-12 opacity-[0.03] pointer-events-none rotate-12">
              <Code className="h-96 w-96 text-primary" strokeWidth={0.5} />
           </div>
        </BentoCard>

        {/* Box 2: Hosting */}
        <BentoCard className="flex flex-col justify-between" delay={0.2} glow>
           <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-sm">
              <Database className="h-6 w-6 text-foreground" strokeWidth={1.5} />
           </div>
           <div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Zero-Ops Hosting</h3>
              <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
                Dedicated containerized environments. Redis caching. Sub-50ms latency globally. We manage the metal.
              </p>
           </div>
        </BentoCard>

        {/* Box 3: Marketing */}
        <BentoCard className="flex flex-col justify-between" delay={0.3} glow>
           <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-sm">
              <BarChart3 className="h-6 w-6 text-foreground" strokeWidth={1.5} />
           </div>
           <div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Growth Tactics</h3>
              <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
                Algorithm-aligned SEO architectures, high-conversion funnels, and viral brand campaign orchestration.
              </p>
           </div>
        </BentoCard>

        {/* Box 4: Consulting (Wide) */}
        <BentoCard className="md:col-span-2 flex flex-col justify-between bg-card/60 backdrop-blur-sm" delay={0.4}>
           <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-sm">
              <Globe2 className="h-6 w-6 text-foreground" strokeWidth={1.5} />
           </div>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-8">
              <div className="max-w-md">
                 <h3 className="font-serif text-[2.75rem] italic mb-4 leading-none tracking-tight">Expert Consulting</h3>
                 <p className="text-muted-foreground text-lg leading-relaxed">
                   Direct access to principal engineering minds. Strategy consulting with flexible net-30 billing for enterprise clients.
                 </p>
              </div>
              <Button variant="outline" className="rounded-xl h-14 px-8 font-medium">Book a session</Button>
           </div>
        </BentoCard>

      </div>
    </section>
  );
}

// ============================================================
// Infinite Marquee Section
// ============================================================

export function SecuritySection() {
  const words = [
    "Full-Stack Engineering",
    "Digital Marketing",
    "Creative Direction",
    "Managed Hosting",
    "Strategy Consulting",
    "High-Conversion SEO"
  ];

  return (
    <section className="py-24 mb-10 overflow-hidden relative z-10 w-full">
        <InfiniteMarquee items={words} speed={50} />
    </section>
  );
}

// ============================================================
// Footer
// ============================================================

export function Footer() {
  return (
    <footer className="border-t border-border py-16 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex flex-col mb-6 sm:mb-0 gap-2">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 transition-all group-hover:bg-primary/20">
                <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-bold tracking-tight text-xl">Platform</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
               Crafting premium digital experiences from infrastructure to interface.
            </p>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-3">
             <div className="flex gap-8 text-sm font-medium text-muted-foreground">
               <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
             </div>
             <p className="text-xs text-muted-foreground opacity-60">
               © {new Date().getFullYear()} Platform Digital. All rights reserved.
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
