"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// High-fidelity placeholder that mimics the 3D scene's vibe during load
function LidarPlaceholder() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Primary lime glow - positioned to align with the typical 3D cluster focus */}
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[radial-gradient(ellipse,rgba(204,255,0,0.15)_0%,transparent_70%)] animate-pulse duration-[4000ms]" />
      
      {/* Atmospheric secondary glows */}
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(204,255,0,0.05)_0%,transparent_60%)]" />
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(204,255,0,0.03)_0%,transparent_60%)]" />
    </div>
  );
}

// Dynamic import with SSR disabled and a high-fidelity placeholder
const LidarBackground = dynamic(() => import('./LidarBackground'), { 
  ssr: false,
  loading: () => <LidarPlaceholder />
});

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative inline-block"
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const t = useTranslations('Hero');
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[120vh] flex items-center justify-center overflow-hidden px-6 lg:px-12 pt-24 pb-12"
    >
      {/* Absolute Full-Screen Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <div className="absolute -inset-[5%] w-[110%] h-[110%]">
          <LidarBackground scrollProgress={scrollYProgress} />
        </div>
        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-background/40 pointer-events-none" />
        
        {/* Centered intense gradient to pop the text (Replacing expensive blur filter) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-[1000px] aspect-square bg-[radial-gradient(circle,hsl(var(--background)/0.9)_0%,transparent_70%)] opacity-100" />
        </div>
      </div>

      {/* Bottom fade transition (Replacing expensive mask-image) */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center pointer-events-none"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="heading-massive text-foreground mb-8 text-balance max-w-4xl drop-shadow-2xl"
        >
          {t('title_part1')} <span className="text-accent">{t('title_part2')}</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-2xl text-white max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md"
        >
          {t('description')}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="pointer-events-auto"
        >
          <Magnetic>
            <button className="interactive-pill bg-[#CCFF00] text-background px-8 py-4 text-lg font-bold hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] active:scale-95 transition-all">
              {t('cta')}
            </button>
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  );
}

