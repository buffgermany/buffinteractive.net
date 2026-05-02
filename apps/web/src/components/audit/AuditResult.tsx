"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, RotateCcw, Zap, Target, Layout } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

type AuditData = {
  painPoint: "engineering" | "growth" | "both" | null;
  scale: "startup" | "scaleup" | "enterprise" | null;
  objective: "repair" | "modernize" | "scale" | null;
};

export const AuditResult = ({ data, reset }: { data: AuditData; reset: () => void }) => {
  const isGrowth = data.painPoint === "growth";
  const isEngineering = data.painPoint === "engineering";
  const isBoth = data.painPoint === "both";

  const accentColor = useMemo(() => isGrowth ? "#CCFF00" : "#00F0FF", [isGrowth]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", accentColor);
  }, [accentColor]);

  const result = useMemo(() => {
    if (isBoth) return {
      title: "Full Spectrum Engineering",
      desc: "Your setup needs a unified overhaul. We consolidate your tech stack and align it with a ruthless growth strategy.",
      href: "/build", 
      cta: "View Engineering Specs",
      icon: Layout,
    };
    if (isGrowth) return {
      title: "Growth Accelerator Blueprint",
      desc: "Your product is solid, but your distribution is bleeding. You need a mathematical approach to market share.",
      href: "/growth",
      cta: "Explore Growth Arsenal",
      icon: Target,
    };
    return {
      title: "Infrastructure Evolution",
      desc: "Your tech stack is a bottleneck. We engineer high-performance systems that bend to your vision.",
      href: "/build",
      cta: "Discuss Architecture",
      icon: Zap,
    };
  }, [isBoth, isGrowth]);

  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-24 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/20 via-white/5 to-transparent overflow-hidden shadow-2xl"
      >
        {/* Dynamic Glow Effect */}
        <div 
          className="absolute inset-0 opacity-10 blur-[120px] pointer-events-none transition-colors duration-1000" 
          style={{ backgroundColor: "var(--accent-color)" }}
        />
        
        <div className="relative z-10 bg-black/95 rounded-[2.5rem] p-10 md:p-20 flex flex-col items-center text-center backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-12 bg-(--accent-color)/10 border border-(--accent-color)/20 shadow-2xl shadow-(--accent-color)/10"
          >
             <result.icon className="w-12 h-12 text-(--accent-color)" />
          </motion.div>

          <h2 className="font-bold text-[10px] uppercase tracking-[0.4em] mb-6 text-(--accent-color) opacity-60 font-sans">
            Assessment Complete
          </h2>
          <h3 className="text-5xl md:text-7xl font-bold font-heading text-white tracking-tight mb-10 leading-[0.95] text-balance">
            {result.title}
          </h3>
          
          <p className="text-white/60 text-xl md:text-2xl font-sans leading-relaxed max-w-3xl mb-16 font-medium text-balance">
            {result.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
             <Link 
               href={result.href}
               className="flex items-center justify-center gap-3 px-10 py-5 rounded-full font-bold text-lg hover:scale-[1.05] active:scale-[0.98] transition-all bg-(--accent-color) text-black shadow-2xl shadow-(--accent-color)/20 font-sans"
             >
               {result.cta}
               <ArrowRight className="w-5 h-5" />
             </Link>
             <Link 
               href="/#contact"
               className="flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-sm font-sans"
             >
               Book Audit Call
             </Link>
          </div>

          <button 
            onClick={reset}
            className="mt-16 flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-widest group backdrop-blur-sm font-sans"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-[-120deg] transition-transform duration-700" /> 
            <span>Restart Audit</span>
          </button>
        </div>
      </motion.div>

      {/* Suggested Focus Areas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 w-full"
      >
        {[
          "Zero Technical Debt",
          "Ruthless Unit Economics",
          "Millisecond Latency"
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-center gap-4 text-white/30 font-bold text-[10px] uppercase tracking-[0.3em] font-sans">
            <CheckCircle2 className="w-5 h-5 text-(--accent-color) opacity-60" />
            {item}
          </div>
        ))}
      </motion.div>
    </section>
  );
};
