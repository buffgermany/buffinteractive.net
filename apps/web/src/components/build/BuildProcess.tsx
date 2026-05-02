"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Search, PenTool, TerminalSquare, Key } from "lucide-react";

const processes = [
  {
    id: "01",
    title: "Deep Audit",
    description: "We don't guess. We analyze your existing codebase, infrastructure bottlenecks, and data flow. We identify exactly where performance is bleeding.",
    deliverable: "Technical Assessment Document",
    icon: Search,
  },
  {
    id: "02",
    title: "Architecture Blueprint",
    description: "Before writing a single line of code, we design the system. Scalability limits, database schemas, and the exact tech stack are mapped out.",
    deliverable: "System Architecture Graph",
    icon: PenTool,
  },
  {
    id: "03",
    title: "Silent Execution",
    description: "Head-down engineering. We build the infrastructure and frontend with millisecond-latency standards. No bloated libraries, no unnecessary abstractions.",
    deliverable: "Production-Ready Codebase",
    icon: TerminalSquare,
  },
  {
    id: "04",
    title: "Handover & Ownership",
    description: "We don't hold you hostage. You get full ownership of the IP, comprehensive documentation, and a system built to scale for the next decade.",
    deliverable: "Full IP Transfer & Docs",
    icon: Key,
  },
];

export const BuildProcess = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-32 md:py-48 bg-[#050505] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col gap-4 mb-24 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-bold font-heading text-white tracking-tight">
            How we execute.
          </h2>
          <p className="text-[#A0A0B0] text-xl font-sans">
            A transparent, rigorous engineering pipeline.
          </p>
        </div>

        <div className="relative">
          {/* Background Line */}
          <div className="absolute left-[27px] md:left-[39px] top-0 bottom-0 w-[2px] bg-white/10" />
          
          {/* Animated Fill Line */}
          <motion.div 
            className="absolute left-[27px] md:left-[39px] top-0 w-[2px] bg-[#CCFF00] shadow-[0_0_15px_#CCFF00]"
            style={{ height: lineHeight }}
          />

          <div className="flex flex-col gap-24">
            {processes.map((step, index) => {
              // Calculate rough trigger point for each item
              const triggerPoint = index / (processes.length - 1);
              
              return (
                <div key={step.id} className="relative pl-20 md:pl-32 group">
                  
                  {/* Node */}
                  <div className="absolute left-0 top-0 w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-[#0A0A0A] border border-white/10 z-10 overflow-hidden transition-colors duration-500 group-hover:border-[#CCFF00]/50 group-hover:bg-[#CCFF00]/5">
                    <motion.div 
                      className="absolute inset-0 bg-[#CCFF00]/20"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, times: [0, 0.2, 1] }}
                      viewport={{ margin: "-50% 0px -50% 0px" }}
                    />
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white/50 group-hover:text-[#CCFF00] transition-colors duration-500" />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-20% 0px -20% 0px" }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col gap-4 pt-2 md:pt-4"
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="text-xl md:text-2xl font-mono text-white/30 font-bold">{step.id}</span>
                      <h3 className="text-2xl md:text-4xl font-bold font-heading text-white">{step.title}</h3>
                    </div>
                    
                    <p className="text-[#A0A0B0] text-lg md:text-xl font-sans leading-relaxed max-w-2xl">
                      {step.description}
                    </p>

                    <div className="mt-4 flex items-center gap-3 w-fit px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                      <span className="text-xs font-mono text-white/70 tracking-widest uppercase">
                        Output: {step.deliverable}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
