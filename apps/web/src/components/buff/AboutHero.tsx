"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

export function AboutHero() {
  const t = useTranslations('About');
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll animations for transition to next section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  // Card spreading animations on scroll
  const cardSpreadX1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const cardSpreadX2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const cardSpreadY1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const cardSpreadY2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const cardsOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize coordinates from -1 to 1
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Parallax transforms based on mouse
  const card1ParallaxX = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const card1ParallaxY = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const card1RotateX = useTransform(smoothMouseY, [-1, 1], [15, -15]);
  const card1RotateY = useTransform(smoothMouseX, [-1, 1], [-15, 15]);

  const card2ParallaxX = useTransform(smoothMouseX, [-1, 1], [-40, 40]);
  const card2ParallaxY = useTransform(smoothMouseY, [-1, 1], [-40, 40]);
  const card2RotateX = useTransform(smoothMouseY, [-1, 1], [20, -20]);
  const card2RotateY = useTransform(smoothMouseX, [-1, 1], [-20, 20]);

  // Combine scroll and parallax transforms
  const card1X = useTransform(() => cardSpreadX1.get() + card1ParallaxX.get());
  const card1Y = useTransform(() => cardSpreadY1.get() + card1ParallaxY.get());
  const card2X = useTransform(() => cardSpreadX2.get() + card2ParallaxX.get());
  const card2Y = useTransform(() => cardSpreadY2.get() + card2ParallaxY.get());

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 lg:px-12 pt-32 pb-12 bg-background perspective-[1000px]"
    >
      {/* Dynamic Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ 
            x: [0, 50, -20, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 30, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-[#00F0FF]/10 rounded-full blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Glassmorphic Cards Layer */}
      <motion.div 
        style={{ opacity: cardsOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 perspective-[1200px]"
      >
        {isMobile ? (
           /* Mobile Layout: Stacked with automated breathing */
           <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
             <motion.div 
                animate={{ y: [-10, 10, -10], rotate: [-2, 2, -2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[80%] aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl -translate-y-12 rotate-[-5deg]"
             />
             <motion.div 
                animate={{ y: [10, -10, 10], rotate: [2, -2, 2] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute w-[90%] aspect-[4/3] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl translate-y-12 rotate-[3deg]"
             />
           </div>
        ) : (
          /* Desktop Layout: Interactive Parallax */
          <div className="relative w-full max-w-3xl aspect-[16/9] flex items-center justify-center transform-style-3d">
            {/* Back Card (Left) */}
            <motion.div 
              style={{ 
                x: card1X, 
                y: card1Y,
                rotateX: card1RotateX,
                rotateY: card1RotateY,
                rotateZ: -8,
                z: -100
              }}
              className="absolute w-[60%] aspect-[4/3] rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] -translate-x-20 -translate-y-10"
            />
            
            {/* Front Card (Right) */}
            <motion.div 
              style={{ 
                x: card2X, 
                y: card2Y,
                rotateX: card2RotateX,
                rotateY: card2RotateY,
                rotateZ: 4,
                z: 50
              }}
              className="absolute w-[65%] aspect-[4/3] rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] translate-x-16 translate-y-12"
            />
          </div>
        )}
      </motion.div>

      {/* Typography Layer */}
      <motion.div 
        style={{ opacity: textOpacity, scale: textScale, y: textY }}
        className="relative z-20 w-full max-w-4xl mx-auto flex flex-col items-center text-center pointer-events-none"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground mb-6 text-balance drop-shadow-lg"
        >
          {t('hero_title')}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
          className="text-lg md:text-2xl text-foreground-muted max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md"
        >
          {t('hero_subtitle')}
        </motion.p>
      </motion.div>

      {/* Fade out to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />
    </section>
  );
}
