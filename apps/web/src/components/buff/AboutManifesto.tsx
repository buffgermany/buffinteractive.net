"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { useRef, useEffect, useState } from "react";
import { X, Check } from 'lucide-react';

export function AboutManifesto() {
  const t = useTranslations('About');
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // We track scroll on this section to handle the slide-in and parallax out
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Slide-in animations (Desktop only)
  // They start offscreen and slide to 0 as the section comes into view
  const slideLeftX = useTransform(scrollYProgress, [0, 0.4], [-200, 0]);
  const slideRightX = useTransform(scrollYProgress, [0, 0.4], [200, 0]);
  
  const opacityFade = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  // Parallax upwards as the user scrolls past the section
  const parallaxY = useTransform(scrollYProgress, [0.6, 1], [0, -100]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen py-24 px-6 lg:px-12 bg-background flex flex-col justify-center overflow-hidden z-20"
    >
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div 
          style={{ y: parallaxY }}
          className="w-full"
        >
          <div className="mb-20 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground"
            >
              {t('manifesto_title')}
            </motion.h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center justify-center">
            
            {/* The Agency Standard Card (Left, Frosted Glass, Offset Lower) */}
            <motion.div 
              style={{ 
                x: isMobile || prefersReducedMotion ? 0 : slideLeftX,
                opacity: isMobile || prefersReducedMotion ? 1 : opacityFade,
              }}
              initial={isMobile || prefersReducedMotion ? { opacity: 0, y: 30 } : false}
              whileInView={isMobile || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: "-100px" }}
              className="w-full max-w-[500px] p-8 md:p-12 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/5 shadow-xl md:mt-24 flex flex-col justify-center"
            >
              <h3 className="text-xl md:text-2xl font-bold mb-8 text-foreground-muted">
                {t('manifesto_agency_title')}
              </h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-white/5 text-foreground-muted mt-0.5 shrink-0">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <span className="text-foreground-muted leading-relaxed font-medium">{t('manifesto_agency_1')}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-white/5 text-foreground-muted mt-0.5 shrink-0">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <span className="text-foreground-muted leading-relaxed font-medium">{t('manifesto_agency_2')}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-white/5 text-foreground-muted mt-0.5 shrink-0">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <span className="text-foreground-muted leading-relaxed font-medium">{t('manifesto_agency_3')}</span>
                </li>
              </ul>
            </motion.div>

            {/* The BUFF Standard Card (Right, Solid Premium Material, Offset Higher) */}
            <motion.div 
              style={{ 
                x: isMobile || prefersReducedMotion ? 0 : slideRightX,
                opacity: isMobile || prefersReducedMotion ? 1 : opacityFade,
              }}
              initial={isMobile || prefersReducedMotion ? { opacity: 0, y: 30 } : false}
              whileInView={isMobile || prefersReducedMotion ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: isMobile ? 0.2 : 0 }}
              className="w-full max-w-[500px] p-8 md:p-12 rounded-[2rem] bg-surface border border-primary/20 shadow-[0_20px_50px_rgba(204,255,0,0.08)] md:-mt-12 flex flex-col justify-center relative overflow-hidden"
            >
              {/* Subtle inner top glow to mimic brushed metal highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <h3 className="text-xl md:text-2xl font-bold mb-8 text-foreground">
                {t('manifesto_buff_title')}
              </h3>
              <ul className="space-y-8 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-primary/20 text-primary mt-0.5 shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span className="text-foreground leading-relaxed font-bold">{t('manifesto_buff_1')}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-primary/20 text-primary mt-0.5 shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span className="text-foreground leading-relaxed font-bold">{t('manifesto_buff_2')}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 rounded-full bg-primary/20 text-primary mt-0.5 shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.5)]">
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span className="text-foreground leading-relaxed font-bold">{t('manifesto_buff_3')}</span>
                </li>
              </ul>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
