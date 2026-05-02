"use client";

import { motion } from "framer-motion";

const standards = [
  {
    num: "01",
    title: "Millisecond Latency.",
    description: "Speed is a feature. We optimize for the fastest possible Time-to-Interactive. No bloated libraries, no unnecessary requests.",
  },
  {
    num: "02",
    title: "Zero Vendor Lock-in.",
    description: "We build on modern, open-source standards. You own the codebase, you own the IP. We stay because you want us to, not because you are trapped.",
  },
  {
    num: "03",
    title: "Built for the next decade.",
    description: "We don't chase temporary tech trends. We use established, high-performance stacks designed to scale from 100 to 100,000 concurrent users effortlessly.",
  },
];

export const BuildStandards = () => {
  return (
    <section className="py-32 md:py-48 px-6 bg-[#050505] relative overflow-hidden">
      
      {/* Decorative top border line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col gap-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-4 text-center items-center"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading text-white tracking-tight leading-none text-balance">
            Engineering without <span className="text-white/40 italic">compromises.</span>
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-16 lg:gap-8">
          {standards.map((std, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col gap-8 relative group"
            >
              {/* Subtle hover glow behind the number */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#CCFF00]/0 group-hover:bg-[#CCFF00]/5 rounded-full blur-3xl transition-colors duration-700 pointer-events-none" />
              
              <div className="text-7xl md:text-8xl lg:text-9xl font-black font-heading text-white/5 group-hover:text-white/20 transition-colors duration-500 tracking-tighter leading-none">
                {std.num}
              </div>
              
              <div className="h-[1px] w-full bg-white/10 relative overflow-hidden">
                 <motion.div 
                    className="absolute inset-y-0 left-0 bg-[#CCFF00] w-full"
                    initial={{ x: "-100%" }}
                    whileInView={{ x: 0 }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                    viewport={{ once: true }}
                 />
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-white">
                  {std.title}
                </h3>
                <p className="text-[#A0A0B0] text-lg font-sans leading-relaxed">
                  {std.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
