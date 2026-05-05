"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export const GrowthDiagnosis = () => {
  const t = useTranslations('Growth');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  // Phase 1: The Status Quo
  const opacity1 = useTransform(smoothProgress, [0, 0.1, 0.4, 0.5], [0, 1, 1, 0]);
  const y1 = useTransform(smoothProgress, [0, 0.1], [50, 0]);
  const scale1 = useTransform(smoothProgress, [0, 0.4], [0.95, 1.05]);

  // Phase 2: The Solution
  const opacity2 = useTransform(smoothProgress, [0.55, 0.65, 1, 1], [0, 1, 1, 1]);
  const y2 = useTransform(smoothProgress, [0.55, 0.65], [50, 0]);
  const tracking2 = useTransform(smoothProgress, [0.65, 1], ["-0.05em", "0.02em"]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[200vh] bg-transparent"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          
          {/* Phase 1 */}
          <motion.div 
            style={{ opacity: opacity1, y: y1, scale: scale1 }}
            className="absolute text-center flex items-center justify-center w-full"
          >
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-medium font-heading leading-[1.1] tracking-tight text-white/50 text-balance max-w-5xl"
                dangerouslySetInnerHTML={{ __html: t.raw('diagnosis_headline') }}
            />
          </motion.div>

          {/* Phase 2 */}
          <motion.div 
            style={{ opacity: opacity2, y: y2 }}
            className="absolute text-center flex flex-col items-center gap-6 w-full"
          >
            <p className="text-3xl md:text-5xl lg:text-6xl font-medium font-heading leading-[1.2] text-white text-balance max-w-6xl">

              <motion.span 
                style={{ letterSpacing: tracking2 }}
                className="font-bold text-[#CCFF00] drop-shadow-[0_0_40px_rgba(204,255,0,0.5)] inline-block mt-4 md:mt-0"
              >
                {t('diagnosis_accent')}
              </motion.span><br className="hidden md:block" />
              <span className="text-3xl md:text-5xl lg:text-6xl font-medium font-heading leading-[1.2] text-white text-balance max-w-6xl">{t('diagnosis_subtext')}</span>
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
