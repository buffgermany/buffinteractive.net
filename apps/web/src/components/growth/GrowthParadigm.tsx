"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowDownRight, Zap } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";
import { WigglyUnderline } from "@/components/premium/organic-ui";
import { useTranslations } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
} as const;

export function GrowthParadigm() {
  const t = useTranslations('GrowthParadigm');
  return (
    <section id="paradigm" className="relative z-10 w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050505]">
      {/* Visual Transition: Connecting Line from Arsenal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-gradient-to-b from-primary/50 to-transparent z-20 pointer-events-none" />
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="flex flex-col items-center text-center gap-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter leading-none"
          >
            {t('title')} <WigglyUnderline>{t('title_accent')}</WigglyUnderline>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="max-w-2xl text-[#A0A0B0] text-lg md:text-xl"
          >
            {t('subtext')}
          </motion.p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
        >
          {/* Legacy Paradigm Column */}
          <motion.div variants={itemVariants} className="h-full">
            <BentoCard className="h-full grayscale opacity-50 hover:opacity-100 transition-all duration-700">
              <div className="flex flex-col h-full">
                <div className="mb-10">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[#8A8A96] font-heading uppercase leading-none">{t('legacy_title')}</h3>
                </div>
                
                <div className="space-y-12">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <X className="w-5 h-5 text-red-500/40 shrink-0" />
                      <h4 className="text-lg font-bold text-white opacity-60">{t('legacy_1_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans leading-relaxed">
                      {t('legacy_1_text')}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <X className="w-5 h-5 text-red-500/40 shrink-0" />
                      <h4 className="text-lg font-bold text-white opacity-60">{t('legacy_2_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans leading-relaxed">
                      {t('legacy_2_text')}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <X className="w-5 h-5 text-red-500/40 shrink-0" />
                      <h4 className="text-lg font-bold text-white opacity-60">{t('legacy_3_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans leading-relaxed">
                      {t('legacy_3_text')}
                    </p>
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Buff Growth Column */}
          <motion.div variants={itemVariants} className="h-full">
            <BentoCard className="h-full border-primary/20 shadow-[0_0_80px_-20px_rgba(204,255,0,0.15)]">
              <div className="flex flex-col h-full">
                <div className="mb-10">
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white font-heading uppercase leading-none">{t('buff_title')} <span className="text-[#CCFF00]">{t('buff_title_accent')}</span></h3>
                </div>
                
                <div className="space-y-12">
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-6 h-6 text-[#CCFF00] shrink-0" strokeWidth={2.5} />
                      <h4 className="text-xl font-bold text-white">{t('buff_1_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans text-lg leading-relaxed">
                      {t('buff_1_text')}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-6 h-6 text-[#CCFF00] shrink-0" strokeWidth={2.5} />
                      <h4 className="text-xl font-bold text-white">{t('buff_2_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans text-lg leading-relaxed">
                      {t('buff_2_text')}
                    </p>
                  </div>

                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <Check className="w-6 h-6 text-[#CCFF00] shrink-0" strokeWidth={2.5} />
                      <h4 className="text-xl font-bold text-white">{t('buff_3_title')}</h4>
                    </div>
                    <p className="text-[#A0A0B0] font-sans text-lg leading-relaxed">
                      {t('buff_3_text')}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-12">
                   <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-6">
                      <p className="text-sm font-medium text-white/70">{t('footer_text')}</p>
                      <Zap className="w-6 h-6 text-[#CCFF00]" />
                   </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
