"use client";

import { Code, Globe2, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { WigglyUnderline, BentoCard } from "@/components/premium/organic-ui";

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
