"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Cpu, Server, RefreshCw, Zap, Database } from "lucide-react";

const capabilities = [
  {
    id: "frontend",
    title: "High-Performance Frontends",
    text: "Beautiful design is useless if it's slow. We build React and Next.js frontends that feel native. Ultra-low latency, accessible, and designed for flawless user experiences.",
    icon: Cpu,
  },
  {
    id: "infrastructure",
    title: "Silent Engines",
    text: "We engineer databases and APIs that don't flinch under pressure. From secure payment gateways to massive data processing, we build the silent engines that power your business.",
    icon: Server,
  },
  {
    id: "modernization",
    title: "Legacy Refactoring",
    text: "We don't just build from scratch. We step in, audit your failing legacy code, and refactor it into a modern architecture—without disrupting your daily operations.",
    icon: RefreshCw,
  },
];

// Visual Components
const FrontendVisual = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-[80%] aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
        <div className="w-1/3 h-2 rounded-full bg-white/10" />
      </div>
      <div className="flex-1 flex gap-4 mt-2">
        <div className="w-1/3 h-full rounded-xl bg-white/5 flex flex-col gap-3 p-4">
           <div className="w-full h-2 rounded-full bg-white/20" />
           <div className="w-3/4 h-2 rounded-full bg-white/10" />
           <div className="w-5/6 h-2 rounded-full bg-white/10" />
        </div>
        <div className="flex-1 h-full rounded-xl bg-[#CCFF00]/5 border border-[#CCFF00]/20 relative overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.05)_inset]">
           <motion.div 
             initial={{ x: "-150%" }}
             animate={{ x: "150%" }}
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
             className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
           />
           <Cpu className="w-8 h-8 text-[#CCFF00]/40" />
        </div>
      </div>
    </motion.div>
  </div>
);

const InfrastructureVisual = () => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.03)_0%,transparent_70%)]" />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 relative z-10 w-[70%]"
    >
       {Array.from({length: 4}).map((_, i) => (
         <div key={i} className="h-14 w-full rounded-xl border border-white/10 bg-[#050505]/80 backdrop-blur-md flex items-center px-6 gap-6 overflow-hidden relative shadow-lg">
            <Database className="w-5 h-5 text-white/30" />
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: "20%" }}
                 animate={{ width: ["20%", "95%", "35%"] }}
                 transition={{ repeat: Infinity, duration: 2 + (i * 0.5), ease: "easeInOut", repeatType: "reverse" }}
                 className="h-full bg-gradient-to-r from-[#CCFF00]/20 to-[#CCFF00]/80 shadow-[0_0_10px_#CCFF00]"
               />
            </div>
         </div>
       ))}
    </motion.div>
  </div>
);

const ModernizationVisual = () => (
  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0A] gap-6">
     <motion.div 
       initial={{ opacity: 1 }}
       animate={{ opacity: 0.2, filter: "blur(6px)", scale: 0.95 }}
       transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
       className="w-[70%] p-6 rounded-2xl border border-red-500/20 bg-red-500/5 font-mono text-xs text-red-500/40 opacity-50"
     >
        <div>{"function legacyRender() {"}</div>
        <div className="pl-4">{"// FIXME: Memory leak"}</div>
        <div className="pl-4">{"while(true) {"}</div>
        <div className="pl-8">{"mutateGlobalState();"}</div>
        <div className="pl-4">{"}"}</div>
        <div>{"}"}</div>
     </motion.div>

     <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 relative z-10">
       <Zap className="w-5 h-5 text-white/50" />
     </div>

     <motion.div 
       initial={{ opacity: 0.2, filter: "blur(6px)", scale: 0.95 }}
       animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
       transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
       className="w-[70%] p-6 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/5 font-mono text-xs text-[#CCFF00]/80 shadow-[0_0_30px_rgba(204,255,0,0.05)]"
     >
        <div>{"export const modernRender = async () => {"}</div>
        <div className="pl-4">{"const data = await getOptimizedStream();"}</div>
        <div className="pl-4">{"return <StreamView data={data} />;"}</div>
        <div>{"}"}</div>
     </motion.div>
  </div>
);

export const BuildCapabilities = () => {
  const [activeTab, setActiveTab] = useState(capabilities[0].id);

  return (
    <section className="relative w-full bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 relative items-start">
          
          {/* Left Column: Scrolling Content */}
          <div className="flex flex-col py-[10vh] lg:py-[30vh] gap-[15vh] lg:gap-[40vh]">
            {capabilities.map((cap) => (
              <motion.div
                key={cap.id}
                onViewportEnter={() => setActiveTab(cap.id)}
                viewport={{ margin: "-50% 0px -50% 0px" }} // Trigger when element hits center of viewport
                className={`flex flex-col gap-6 transition-all duration-700 ease-out ${activeTab === cap.id ? "opacity-100 scale-100" : "opacity-30 blur-[2px] scale-95"}`}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
                  <cap.icon className="w-7 h-7 text-white/80" />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight leading-tight">
                    {cap.title}
                  </h3>
                </div>
                <p className="text-[#A0A0B0] leading-relaxed text-lg md:text-xl font-sans max-w-lg">
                  {cap.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Sticky Visual Container */}
          <div className="hidden lg:flex sticky top-[20vh] h-[60vh] w-full rounded-[2rem] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl items-center justify-center">
             <AnimatePresence mode="wait">
               {activeTab === "frontend" && (
                 <motion.div key="frontend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <FrontendVisual />
                 </motion.div>
               )}
               {activeTab === "infrastructure" && (
                 <motion.div key="infra" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <InfrastructureVisual />
                 </motion.div>
               )}
               {activeTab === "modernization" && (
                 <motion.div key="mod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                    <ModernizationVisual />
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
