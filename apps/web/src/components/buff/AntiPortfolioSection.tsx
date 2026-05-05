"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, LayoutGrid, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { BentoCard } from "./BentoCard";

export function AntiPortfolioSection() {
  const t = useTranslations('EnterpriseBento');
  return (
    <section 
      className="relative py-32 px-6 overflow-hidden bg-[#050505]"
      style={{
        maskImage: `linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)`
      }}
    >
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center min-h-screen">
        
        {/* Section Header */}
        <div className="mb-12 md:mb-16 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold font-heading text-[#F8F8F8] tracking-tight leading-tight">
              {t.rich('section_headline', {
                sup1: (chunks) => <sup className="text-[0.6em] ml-0.5 text-muted-foreground/50">{chunks}</sup>
              })}
            </h2>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          
          {/* Card 1: The Authority — Full width top */}
          <motion.div 
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full"
          >
            <BentoCard className="w-full min-h-[320px] md:min-h-[380px]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 h-full">
                <div className="flex flex-col justify-between h-full gap-8">
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 bg-[#E20074] transition-colors duration-500 group-hover:bg-[#F8F8F8]"
                    style={{
                      maskImage: `url(https://cdn.simpleicons.org/deutschetelekom/ffffff)`,
                      WebkitMaskImage: `url(https://cdn.simpleicons.org/deutschetelekom/ffffff)`,
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                    }}
                  />
                  <div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-[#F8F8F8] tracking-tight leading-tight max-w-4xl">
                      {t.rich('card1_headline', {
                        sup2: (chunks) => <sup className="text-[0.6em] ml-0.5 text-muted-foreground/50">{chunks}</sup>
                      })}
                    </h2>
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Row 2: Card 2 + Card 3 side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            {/* Card 2 */}
            <motion.div 
              className="flex"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.15 }}
            >
              <BentoCard className="w-full">
                <div>
                  <Zap className="w-8 h-8 text-[#CCFF00] mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t('card2_title')}</h3>
                  <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                    {t('card2_text')}
                  </p>
                </div>
              </BentoCard>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className="flex"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
            >
              <BentoCard className="w-full">
                <div>
                  <LayoutGrid className="w-8 h-8 text-[#CCFF00] mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t('card3_title')}</h3>
                  <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                    {t('card3_text')}
                  </p>
                </div>
              </BentoCard>
            </motion.div>

          </div>
        </div>

        {/* NDA Footer Hint */}
        <motion.div
           initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} 
           whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
           viewport={{ once: true, margin: "-50px" }} 
           transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.4 }}
           className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
        >
          <Lock className="w-4 h-4 text-[#A0A0B0]" />
          <span className="text-[#A0A0B0] text-sm md:text-base font-medium tracking-wide uppercase">
            {t('nda_hint')}
          </span>
        </motion.div>

      </div>
    </section>
  );
}