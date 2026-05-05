"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useTranslations } from "next-intl";

export const BuildDiagnosis = () => {
  const t = useTranslations('Build');
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  // Apply a heavier, lazier spring to make the morphing slower and the ending softer
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 25,
    mass: 1.5,
    restDelta: 0.001
  });

  // Significant reduction in letter-spacing range to prevent layout shifts and wrapping
  const letterSpacing1 = useTransform(smoothProgress, [0, 0.8], ["0.02em", "-0.01em"]);
  const letterSpacing2 = useTransform(smoothProgress, [0.2, 1], ["0.02em", "-0.01em"]);

  return (
    <section ref={containerRef} className="relative py-32 md:py-48 bg-background overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-center justify-center gap-24 relative z-10">
        
        {/* Phase 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="text-center flex items-center justify-center w-full"
        >
          <motion.h2 
            style={{ letterSpacing: letterSpacing1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-medium font-heading leading-[1.1] text-foreground-muted text-balance max-w-5xl"
          >
            {t.rich('diagnosis_headline', {
              sup1: (chunks) => <span className="text-foreground font-bold drop-shadow-md">{chunks}</span>
            })}
          </motion.h2>
        </motion.div>

        {/* Phase 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
          className="text-center flex flex-col items-center gap-6 w-full"
        >
          <motion.p 
            style={{ letterSpacing: letterSpacing2 }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium font-heading leading-[1.2] text-foreground text-balance max-w-6xl"
          >
            {t('diagnosis_phase2_part1')}
            <span className="font-extrabold text-primary block my-2 md:my-4 tracking-tight whitespace-nowrap">
              {t('diagnosis_phase2_accent')}
            </span>
            <span>{t('diagnosis_phase2_part2')}</span>
          </motion.p>
        </motion.div>

      </div>
    </section>
  );
};
