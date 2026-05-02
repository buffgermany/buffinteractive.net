"use client";

import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import React, { useRef, useEffect } from "react";
import { ArrowRight, Database, Activity, Cpu, Server, Lock, Network, Code, Terminal, Zap } from "lucide-react";
import Link from "next/link";

const ArchitectureGrid = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-[0.85] pointer-events-none overflow-hidden">
    {/* Container scaled up and rotated for isometric perspective */}
    <div className="w-[250vw] h-[250vh] rotate-[-8deg] scale-[1.05] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
      
      {/* Background Brand Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-extrabold font-heading tracking-tighter text-white/[0.015] whitespace-nowrap select-none">
        BUFF // ENGINEERING
      </div>

      {/* Ultra-Dense CSS Grid spanning the entire rotated space */}
      <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-5 w-full h-full p-[5vw] content-center justify-center auto-rows-[minmax(100px,auto)]">
        
        {/* Module: System Logs */}
        <div className="col-span-3 row-span-4 border border-white/10 bg-[#050505]/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl overflow-hidden font-mono text-[9px] text-white/40 leading-relaxed flex flex-col gap-[2px]">
           <div className="flex items-center gap-2 text-[#CCFF00]/70 mb-3 border-b border-white/10 pb-3 uppercase tracking-widest text-[10px]">
             <Terminal className="w-3 h-3" /> SYSTEM.LOG // TAIL
           </div>
           {Array.from({length: 15}).map((_, i) => (
             <div key={i} className="flex gap-3 whitespace-nowrap opacity-60">
               <span className="text-white/20">[{new Date().toISOString().split('T')[1]?.substring(0, 11) ?? ""}]</span>
               <span className="text-white/30">{['INFO', 'WARN', 'SYS '][i % 3]}</span>
               <span className={i % 4 === 0 ? "text-[#CCFF00]/80" : ""}>
                 {['Node synchronized via primary relay', 'Rebalancing shards across regions', 'Packet loss detected on edge node', 'Route optimized (latency: 12ms)', 'Allocating memory buffer [256MB]', 'Cache hit (ratio: 0.98)'][i % 6]}
               </span>
             </div>
           ))}
        </div>

        {/* Module: Active Endpoints */}
        <div className="col-span-2 row-span-3 border border-white/10 bg-[#0A0A0A]/60 backdrop-blur-lg rounded-[2rem] p-6 shadow-2xl flex flex-col">
           <div className="flex items-center gap-2 text-white/50 tracking-widest uppercase mb-4 border-b border-white/10 pb-3 text-[10px] font-mono">
             <Network className="w-3 h-3" /> API Routes
           </div>
           <div className="flex flex-col gap-2 flex-1">
             {['/v1/auth/verify', '/v1/nodes/sync', '/v1/edge/deploy', '/v1/telemetry', '/v1/stream/open'].map((ep, i) => (
                <div key={i} className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <span className="font-mono text-[10px] text-white/60">{ep}</span>
                  <span className="font-mono text-[9px] text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(204,255,0,0.2)]">200</span>
                </div>
             ))}
           </div>
        </div>

        {/* Module: Edge Latency */}
        <div className="col-span-3 row-span-3 border border-white/10 bg-gradient-to-br from-[#111] to-[#050505] rounded-[2rem] p-10 relative overflow-hidden shadow-2xl flex items-center justify-center">
           <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] border-[0.5px] border-white/5 rounded-full" />
           <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[300px] h-[300px] border border-white/10 rounded-full" />
           <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[200px] h-[200px] border-[2px] border-[#CCFF00]/20 bg-[#CCFF00]/5 rounded-full" />
           <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[100px] h-[100px] bg-[#CCFF00]/10 blur-2xl rounded-full" />
           <div className="absolute top-8 left-8 opacity-40 flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#CCFF00]">
             <Activity className="w-4 h-4" /> Edge Latency
           </div>
           <div className="text-7xl font-light text-white/90 tracking-tighter z-10 flex items-baseline">
             0.8<span className="text-3xl text-white/40 ml-1">ms</span>
           </div>
        </div>

        {/* Module: Code Snippet */}
        <div className="col-span-4 row-span-3 border border-white/10 bg-[#080808]/90 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl overflow-hidden font-mono text-[11px] leading-loose relative">
          <div className="absolute top-0 right-0 p-6 opacity-20"><Code className="w-6 h-6 text-white" /></div>
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/40" />
          </div>
          <pre className="text-white/50 opacity-80">
            <span className="text-[#CCFF00]/70">export async function</span> handleRequest(req) {'{\n'}
            {'  '}const {'{ payload }'} = <span className="text-white/80">await</span> req.json();{'\n'}
            {'  '}<span className="text-[#CCFF00]/70">try</span> {'{\n'}
            {'    '}const node = <span className="text-white/80">await</span> resolveEdgeNode(payload);{'\n'}
            {'    '}<span className="text-[#CCFF00]/70">return</span> Response.json({'{\n'}
            {'      '}status: <span className="text-[#CCFF00]/70">200</span>,{'\n'}
            {'      '}latency: <span className="text-white/80">node.latency</span>{'\n'}
            {'    }'});{'\n'}
            {'  }'} <span className="text-[#CCFF00]/70">catch</span> (err) {'{\n'}
            {'    '}reportAnomaly(err);{'\n'}
            {'  }'}{'\n'}
            {'}'}
          </pre>
        </div>

        {/* Module: Data Throughput Graph */}
        <div className="col-span-4 row-span-2 border border-white/10 bg-[#050505]/80 backdrop-blur-lg rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between z-10 relative">
            <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Throughput (GB/s)</div>
            <Zap className="w-4 h-4 text-[#CCFF00]/60" />
          </div>
          <svg className="w-full h-[150%] absolute bottom-0 left-0" preserveAspectRatio="none">
            <path d="M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20 L800,200 L0,200 Z" fill="rgba(204,255,0,0.03)" />
            <path d="M0,100 C100,50 200,80 300,30 S400,60 500,10 S600,90 800,20" stroke="rgba(204,255,0,0.4)" strokeWidth="2" fill="none" />
            {/* Grid lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          </svg>
          <div className="absolute top-[40%] right-[10%] w-3 h-3 bg-[#CCFF00] rounded-full shadow-[0_0_15px_#CCFF00] animate-pulse" />
        </div>

        {/* Module: Server Rack (Dense) */}
        <div className="col-span-2 row-span-4 border border-white/10 bg-[#0A0A0A]/70 backdrop-blur-2xl rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 tracking-widest uppercase mb-2 border-b border-white/10 pb-3">
            <Server className="w-3 h-3" /> Core.Storage
          </div>
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} className="w-full h-10 bg-white/[0.02] border border-white/5 rounded-lg flex items-center px-4 gap-3 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-[#CCFF00]/60 shadow-[0_0_8px_rgba(204,255,0,0.4)]' : 'bg-white/20'}`} />
               <div className="h-1 flex-1 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
               <div className="text-[8px] font-mono text-white/30">{i}TB</div>
            </div>
          ))}
        </div>

        {/* Module: System Load Bars */}
        <div className="col-span-3 row-span-2 border border-white/10 bg-[#050505]/60 backdrop-blur-md rounded-[2rem] p-8 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center w-full">
            <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Cluster Load</div>
            <Cpu className="w-4 h-4 text-white/30" />
          </div>
          <div className="flex items-end gap-1.5 h-24 mt-6">
             {[40, 60, 30, 80, 50, 90, 40, 70, 100, 45, 65, 85, 30, 55, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-white/5 to-white/20 rounded-t-sm transition-all" style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>

        {/* Module: Security Group Policies */}
        <div className="col-span-3 row-span-3 border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-lg rounded-[2rem] p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Security Policies</div>
              <Lock className="w-4 h-4 text-[#CCFF00]/50" />
            </div>
            <div className="flex flex-col gap-3">
               {[
                 { label: 'Ingress Firewall', status: 'Active', color: 'text-[#CCFF00]' },
                 { label: 'DDoS Mitigation', status: 'Monitoring', color: 'text-white/60' },
                 { label: 'Zero-Trust Proxy', status: 'Enforced', color: 'text-[#CCFF00]' },
                 { label: 'Rate Limiting', status: 'Active', color: 'text-[#CCFF00]' }
               ].map((policy, i) => (
                 <div key={i} className="flex justify-between items-center bg-white/[0.03] p-3 rounded-xl border border-white/5">
                   <span className="font-mono text-[10px] text-white/70">{policy.label}</span>
                   <span className={`font-mono text-[9px] ${policy.color}`}>{policy.status}</span>
                 </div>
               ))}
            </div>
        </div>

        {/* Filler/Abstract Complexity Blocks */}
        <div className="col-span-2 row-span-2 border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] rounded-[2rem] p-6 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="w-1/2 h-1/2 bg-[#CCFF00]/10 blur-3xl rounded-full absolute" />
                <div className="grid grid-cols-4 gap-2 w-full h-full p-4">
                    {Array.from({length: 16}).map((_, i) => <div key={i} className="bg-white/5 rounded-md" />)}
                </div>
            </div>
        </div>

        <div className="col-span-1 row-span-3 border border-white/10 bg-[#050505]/90 rounded-[2rem] flex flex-col items-center py-10 gap-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#CCFF00]/40 animate-[spin_8s_linear_infinite]" />
            <div className="w-1 h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full" />
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 animate-[spin_12s_linear_infinite_reverse]" />
        </div>

        <div className="col-span-3 row-span-1 border border-white/10 bg-white/[0.02] rounded-[2rem] p-4 flex gap-2 items-center justify-center overflow-hidden">
            {Array.from({length: 30}).map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i % 7 === 0 ? 'bg-[#CCFF00]/60 shadow-[0_0_8px_#CCFF00]' : 'bg-white/10'}`} />)}
        </div>

        {/* Right side density ensurements */}
        <div className="col-span-4 row-span-2 border border-white/10 bg-[#0A0A0A]/50 rounded-[2rem] p-8 flex items-center gap-8 shadow-2xl">
           <Database className="w-12 h-12 text-white/20" />
           <div className="flex-1 h-full flex flex-col justify-center gap-3">
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-gradient-to-r from-[#CCFF00]/20 to-[#CCFF00]/60 shadow-[0_0_10px_#CCFF00]" />
             </div>
             <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>Storage Cluster Alpha</span>
                <span className="text-[#CCFF00]/80">85% Capacity</span>
             </div>
           </div>
        </div>
        
        <div className="col-span-2 row-span-2 border border-white/10 bg-[#050505]/80 rounded-[2rem] p-8 flex flex-col justify-center gap-4 shadow-2xl">
           <div className="w-full h-6 bg-white/10 rounded-lg border border-white/5" />
           <div className="w-3/4 h-6 bg-white/10 rounded-lg border border-white/5" />
           <div className="w-1/2 h-6 bg-[#CCFF00]/20 rounded-lg border border-[#CCFF00]/30 shadow-[0_0_10px_rgba(204,255,0,0.1)]" />
        </div>

      </div>
    </div>
  </div>
);

const Magnetic = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping: 20, stiffness: 150, mass: 0.1 });
  const springY = useSpring(y, { damping: 20, stiffness: 150, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
};

export const BuildHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [1, 1, 1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  
  // Smooth scroll reveal for the mask
  const expansionRaw = useTransform(scrollYProgress, [0, 0.25], [400, 4000]);
  const maskExpansion = useSpring(expansionRaw, { stiffness: 50, damping: 30 });


  // Mouse Tracking for X-Ray
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    // Initial position center
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-[#050505]">
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Underlay: The Premium Architecture Grid */}
        <ArchitectureGrid />

        {/* Overlay: The opaque black mask that hides the grid until hovered/scrolled */}
        <motion.div 
          className="absolute inset-0 bg-[#050505] z-10 pointer-events-none"
          style={{
            WebkitMaskImage: useMotionTemplate`radial-gradient(circle ${maskExpansion}px at ${mouseX}px ${mouseY}px, transparent 0%, black 100%)`,
            maskImage: useMotionTemplate`radial-gradient(circle ${maskExpansion}px at ${mouseX}px ${mouseY}px, transparent 0%, black 100%)`
          }}
        />

        {/* The Content Layer: Centered and Commanding */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center pointer-events-none">
          
          <motion.div 
            style={{ opacity: contentOpacity, y: contentY }}
            className="flex flex-col items-center pointer-events-auto"
          >
            <h1 className="text-5xl xs:text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-tighter font-heading font-bold text-white mb-8 text-balance drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              Stop patching.<br />
              Start <span className="text-[#CCFF00] italic pr-4">engineering</span>.
            </h1>

            <p className="max-w-2xl text-lg md:text-2xl text-white/70 leading-relaxed font-sans mb-12 text-balance drop-shadow-[0_0_20px_rgba(0,0,0,1)] font-medium">
              We strip away the bloat and technical debt. 
              Buff builds high-performance infrastructure that operates silently, 
              scales endlessly, and bends to your business logic.
            </p>

            <Magnetic>
              <Link
                href="#architecture-review"
                className="group flex items-center justify-center gap-4 px-12 py-5 rounded-full bg-white text-[#050505] font-bold text-lg transition-all hover:bg-[#CCFF00] hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] active:scale-95 w-full sm:w-auto shadow-2xl"
              >
                <span>Discuss Architecture</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
          </motion.div>

        </div>

        {/* Fade Out Gradient for smooth transition to next section */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-30 pointer-events-none" />
      </div>
    </section>
  );
};
