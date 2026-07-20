const fs = require('fs');
const svg = fs.readFileSync('public/saxony_map.svg', 'utf8');
const match = svg.match(/<path id="Saxony" d="([^"]+)"/);
if (match) {
  const pathData = match[1];
  const componentCode = `"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useRef } from "react";

const saxonyPath = "${pathData}";

export function AboutRoots() {
  const t = useTranslations('About');
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"]
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const mapOpacity = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <section ref={containerRef} className="py-24 px-6 lg:px-12 bg-background relative min-h-screen flex items-center overflow-hidden">
      {/* Background Map */}
      <motion.div 
        style={{ opacity: mapOpacity }}
        className="absolute inset-0 z-0 flex items-center justify-end md:justify-center opacity-30 pointer-events-none"
      >
        <svg 
          viewBox="0 0 2068 1508" 
          className="w-[150%] md:w-full h-full max-h-[80vh] md:max-h-screen translate-x-1/4 md:translate-x-[15%] lg:translate-x-1/4 opacity-20"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="translate(-1341.134, -106.004)">
             <motion.path 
               d={saxonyPath}
               style={{ pathLength }}
               stroke="white"
               strokeWidth="4"
               fill="none"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
          </g>
        </svg>
      </motion.div>

      <motion.div style={{ opacity: mapOpacity }} className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <div className="relative w-full h-full max-w-7xl mx-auto">
             <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute top-[40%] right-[30%] flex flex-col items-center"
             >
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(204,255,0,0.8)] animate-pulse" />
                <span className="text-primary font-bold text-xs mt-2 tracking-widest uppercase">Leipzig</span>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute top-[50%] right-[15%] flex flex-col items-center"
             >
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(204,255,0,0.8)] animate-pulse" />
                <span className="text-primary font-bold text-xs mt-2 tracking-widest uppercase">Dresden</span>
             </motion.div>

             <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="absolute top-[60%] right-[25%] flex flex-col items-center"
             >
                <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(204,255,0,0.8)] animate-pulse" />
                <span className="text-primary font-bold text-xs mt-2 tracking-widest uppercase">Chemnitz</span>
             </motion.div>
          </div>
      </motion.div>

      <div className="max-w-6xl mx-auto w-full relative z-20">
        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Text Side */}
          <div className="flex-1 w-full max-w-xl bg-background/40 backdrop-blur-sm p-8 rounded-3xl md:bg-transparent md:backdrop-blur-none md:p-0 md:rounded-none">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground drop-shadow-lg"
            >
              {t('roots_title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-foreground-muted leading-relaxed font-medium drop-shadow-md"
            >
              {t('roots_description')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex gap-6 mt-12 md:hidden"
            >
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)] animate-pulse" />
                  <span className="text-foreground-muted text-sm font-bold uppercase tracking-widest">LEJ</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)] animate-pulse" />
                  <span className="text-foreground-muted text-sm font-bold uppercase tracking-widest">DRS</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)] animate-pulse" />
                  <span className="text-foreground-muted text-sm font-bold uppercase tracking-widest">C-Town</span>
               </div>
            </motion.div>
          </div>
          
          <div className="flex-1 hidden md:block" />
        </div>
      </div>
    </section>
  );
}
`;
  fs.writeFileSync('src/components/buff/AboutRoots.tsx', componentCode);
  console.log('Successfully extracted path and generated component.');
} else {
  console.log('Failed to extract path.');
}
