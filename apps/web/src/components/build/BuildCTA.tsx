"use client";

import { motion } from "framer-motion";

export const BuildCTA = () => {
  return (
    <section id="architecture-review" className="py-32 px-6 border-t border-white/5 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 relative z-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 w-fit px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="text-xs font-mono text-white/70 tracking-widest uppercase">
              Phase 01
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-heading text-[#F8F8F8] tracking-tight leading-tight">
            Initiate the <br />Deep Audit.
          </h2>
          <p className="text-[#A0A0B0] text-xl leading-relaxed font-sans max-w-md">
            We don't guess. Bring us your toughest technical challenge, your failing legacy system, 
            or your vision for a new platform. We will find the bottlenecks and engineer the roadmap.
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label htmlFor="name" className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase font-heading">Name</label>
              <input 
                id="name"
                type="text" 
                placeholder="John Doe"
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all focus:bg-white/10"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label htmlFor="role" className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase font-heading">Role</label>
              <input 
                id="role"
                type="text" 
                placeholder="CTO / Founder"
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all focus:bg-white/10"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <label htmlFor="challenge" className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase font-heading">The Technical Challenge</label>
            <textarea 
              id="challenge"
              placeholder="Describe your current bottleneck or vision..."
              rows={5}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all focus:bg-white/10 resize-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 0 30px rgba(204,255,0,0.3)" }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-5 bg-[#CCFF00] text-[#050505] font-heading font-extrabold uppercase tracking-[0.2em] transition-all rounded-lg text-lg mt-4 shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          >
            Request Audit
          </motion.button>
        </form>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#CCFF00]/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
