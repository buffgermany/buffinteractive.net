"use client";

import { motion } from "framer-motion";
import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArchitectureGrid } from "./ArchitectureGrid";
import { Magnetic } from "@/components/shared/Magnetic";

export const BuildHero = () => {
  const t = useTranslations('Build');

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden">
      
      {/* Underlay: The Premium Architecture Grid (Static/Light Animation) */}
      <div className="absolute inset-0 z-0 bg-background">
        <ArchitectureGrid />
        
        {/* Base dark overlay to ensure text legibility without heavy text-shadows */}
        <div className="absolute inset-0 bg-background/60 pointer-events-none" />
        
        {/* Centered intense gradient to pop the text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-[1000px] aspect-square bg-[radial-gradient(circle,hsl(var(--background)/0.8)_0%,transparent_70%)] opacity-100" />
        </div>
      </div>

      {/* Fade Out Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      {/* The Content Layer: Centered and Commanding */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="flex flex-col items-center"
        >
          <h1 className="heading-massive text-foreground mb-8 text-balance drop-shadow-2xl max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
            {t('hero_title_part1')}{' '}
            <span className="text-primary">{t('hero_title_accent')}</span>
          </h1>

          <p className="max-w-3xl text-lg md:text-2xl text-foreground-muted leading-relaxed font-sans mb-12 text-balance drop-shadow-md">
            {t('hero_description')}
          </p>

          <Magnetic>
            <Link
              href="#architecture-review"
              className="interactive-pill flex items-center justify-center gap-4 px-10 py-5 bg-primary text-primary-foreground font-bold text-lg hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] active:scale-95 w-full sm:w-auto overflow-hidden group"
            >
              <span className="relative z-10">{t('cta')}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
};

