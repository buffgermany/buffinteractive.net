"use client";

import { motion } from "framer-motion";
import { Zap, Unlock, Layers } from "lucide-react";
import { useTranslations } from "next-intl";

const standardsData = [
  {
    num: "01",
    id: "1",
    icon: Zap,
  },
  {
    num: "02",
    id: "2",
    icon: Unlock,
  },
  {
    num: "03",
    id: "3",
    icon: Layers,
  },
];

export const BuildStandards = () => {
  const t = useTranslations('Build');

  return (
    <section className="py-32 md:py-48 bg-background relative overflow-hidden border-t border-border/50">
      <div className="max-w-7xl mx-auto flex flex-col gap-16 md:gap-32 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="flex flex-col gap-4 text-center items-center px-6"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground tracking-tight leading-none text-balance">
            {t('std_header_part1')}<span className="text-foreground-muted italic">{t('std_header_accent')}</span>
          </h2>
        </motion.div>
        
        <div className="flex flex-col w-full border-b border-border/50">
          {standardsData.map((std, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative flex flex-col lg:flex-row items-start lg:items-center py-12 md:py-16 border-t border-border/50 hover:bg-white/[0.02] transition-colors duration-500 px-6 md:px-12 w-full overflow-hidden"
            >
              {/* Subtle hover background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Title Column */}
              <div className="w-full lg:w-1/3 mb-4 lg:mb-0 pr-8 relative z-10">
                 <h3 className="text-2xl md:text-4xl font-heading font-bold text-foreground/80 group-hover:text-foreground transition-colors duration-500 tracking-tight text-balance">
                    {t(`std_${std.id}_title`)}
                 </h3>
              </div>

              {/* Icon & Number Column */}
              <div className="w-full lg:w-1/4 flex items-center gap-3 mb-6 lg:mb-0 relative z-10">
                 <div className="text-[#00F0FF] opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                    <std.icon size={48} strokeWidth={1.5} />
                 </div>
              </div>
              
              {/* Description Column */}
              <div className="w-full lg:w-[41.666%] relative z-10">
                 <p className="text-foreground-muted text-lg font-sans leading-relaxed group-hover:text-foreground/90 transition-colors duration-500 max-w-xl">
                    {t(`std_${std.id}_text`)}
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
