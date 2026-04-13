"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

// Next.js dynamisches Importieren trennt den Code fürs Backend und lädt ThreeJS erst client-side.
const LidarBackground = dynamic(() => import('./LidarBackground'), { ssr: false });

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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const [loadBackground, setLoadBackground] = useState(false);

  useEffect(() => {
    // Delay loading the 3D scene until text has primarily animated rendering
    // This dramatically improves the Time To Interactive for initial paint.
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setLoadBackground(true));
      } else {
        setLoadBackground(true);
      }
    }, 600); // 600ms corresponds closely to text animation duration (0.8s but starts earlier)

    return () => clearTimeout(timer);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[120vh] flex items-center justify-center overflow-hidden px-6 lg:px-12 pt-24 pb-12"
      style={{
        maskImage: `linear-gradient(to bottom, black 80%, transparent)`,
        WebkitMaskImage: `linear-gradient(to bottom, black 80%, transparent)`
      }}
    >
      {/* Absolute Full-Screen Lidar Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto cursor-crosshair">
        <div className="absolute -inset-[5%] w-[110%] h-[110%] blur-[1px]">
          {loadBackground && <LidarBackground scrollProgress={scrollYProgress} />}
        </div>
        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-background/40 pointer-events-none" />
        {/* Centered intense shadow to pop the text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-screen md:w-[800px] h-[500px] bg-background/90 blur-[100px] rounded-[100%]" />
        </div>
      </div>

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
