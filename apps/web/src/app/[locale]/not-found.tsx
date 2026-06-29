"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";
import { ArrowRight, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const locale = useLocale();
  const t = useTranslations("NotFound");


  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050505] text-foreground font-sans pt-32 pb-24 relative overflow-hidden flex flex-col justify-center">
        {/* Subtle high-end futuristic glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/2 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-[#CCFF00]/2 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 w-full text-center">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-heading font-bold text-white tracking-tighter leading-tight"
          >
            {t.rich('title', {
              br: () => <br className="hidden sm:block" />,
              span: (chunks) => <span className="text-[#CCFF00] font-bold">{chunks}</span>
            })}
          </motion.h1>

          {/* LAYMAN CONVERTING COPY */}
          <motion.p
            initial={{ opacity: 0, y: 25, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="mt-6 text-[#A0A0B0] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>

          {/* Direct CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4 relative z-20"
          >
            <Link
              href={`/${locale}#contact`}
              className="py-4 px-8 rounded-xl font-bold font-sans text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-[#CCFF00] text-black hover:bg-[#b5e600] transition-all duration-300 shadow-[0_4px_30px_rgba(204,255,0,0.2)] cursor-pointer"
            >
              <span>{t('cta_primary')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/${locale}`}
              className="py-4 px-8 rounded-xl font-bold font-sans text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{t('cta_secondary')}</span>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
