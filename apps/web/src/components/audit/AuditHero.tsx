"use client";

import { motion } from "framer-motion";

export const AuditHero = () => {
  return (
    <section className="relative pt-32 pb-16 px-6 flex flex-col items-center text-center max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-2 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-color,hsl(var(--primary)))] animate-pulse shadow-[0_0_10px_var(--accent-color,hsl(var(--primary)))]" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50">
            Needs Analysis v1.0.4
          </span>
        </div>
        
        <h1 className="heading-massive text-white">
          Stop guessing.<br />
          Start <span className="text-[var(--accent-color,hsl(var(--primary)))] italic transition-colors duration-1000">building</span>.
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-3xl font-sans leading-relaxed text-balance font-medium">
          Most tech stacks are accidental. Most marketing is hope-based. 
          The Audit identifies your exact bottlenecks in <span className="text-white">120 seconds</span>.
        </p>
      </motion.div>
    </section>
  );
};
