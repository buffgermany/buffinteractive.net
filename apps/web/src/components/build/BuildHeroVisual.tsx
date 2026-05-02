"use client";

import { motion } from "framer-motion";

const Layer = ({ 
  label, 
  subLabel, 
  index, 
  active = false 
}: { 
  label: string; 
  subLabel: string; 
  index: number; 
  active?: boolean 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
    className="relative flex items-center gap-6 group"
  >
    {/* Connection Line */}
    <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-[1px] bg-white/10 group-hover:bg-[#00F0FF]/50 transition-colors" />
    
    {/* Layer Box */}
    <div className={`
      flex-1 p-4 border border-white/10 backdrop-blur-sm transition-all duration-500
      ${active ? 'bg-[#00F0FF]/5 border-[#00F0FF]/30' : 'bg-white/5 hover:bg-white/10'}
    `}>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className={`text-[10px] font-mono tracking-widest uppercase mb-1 ${active ? 'text-[#00F0FF]' : 'text-white/40'}`}>
            Layer 0{index + 1}
          </span>
          <span className="text-sm font-heading font-bold text-white uppercase tracking-tight">
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/20 group-hover:text-[#00F0FF]/40 transition-colors">
          {subLabel}
        </span>
      </div>
      
      {/* Optimization Bar */}
      <div className="mt-3 h-[1px] w-full bg-white/5 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, delay: 1 + index * 0.2 }}
          className={`h-full ${active ? 'bg-[#00F0FF]' : 'bg-white/20'}`}
        />
      </div>
    </div>
  </motion.div>
);

export const BuildHeroVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto py-12">
      {/* Vertical Spine */}
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      
      <div className="flex flex-col gap-8 pl-12 relative">
        {/* Animated Flow Dot */}
        <motion.div 
          animate={{ y: [0, 400] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-[-2px] top-0 w-1 h-1 bg-[#00F0FF] rounded-full shadow-[0_0_10px_#00F0FF] z-10"
        />

        <Layer 
            label="Edge Intelligence" 
            subLabel="Latency: < 2ms" 
            index={0} 
            active
        />
        <Layer 
            label="Logical Core" 
            subLabel="Concurrency: 100k+" 
            index={1} 
        />
        <Layer 
            label="Persistence Layer" 
            subLabel="99.999% Durability" 
            index={2} 
        />
        <Layer 
            label="Security Mesh" 
            subLabel="Zero Trust" 
            index={3} 
        />
      </div>

      {/* Background Technical Decoration */}
      <div className="absolute -right-24 top-0 bottom-0 w-64 opacity-[0.03] pointer-events-none select-none">
        <svg width="100%" height="100%" viewBox="0 0 100 400" preserveAspectRatio="none">
            <defs>
                <pattern id="grid-build" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-build)" />
        </svg>
      </div>

      {/* Status Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute -bottom-8 left-12 flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-[#00F0FF] tracking-tighter uppercase">System Nominal</span>
        </div>
        <div className="h-[1px] w-12 bg-white/10" />
        <span className="text-[10px] font-mono text-white/20 uppercase">Rev: 2026.04</span>
      </motion.div>
    </div>
  );
};
