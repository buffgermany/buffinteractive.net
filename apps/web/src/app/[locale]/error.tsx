"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";

import { RefreshCw, MessageSquareCode } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const locale = useLocale();
  const t = useTranslations("Error");

  useEffect(() => {
    // Log the error to your analytics or console
    console.error("Storefront runtime error captured:", error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050505] text-foreground font-sans pt-32 pb-24 relative overflow-hidden flex flex-col justify-center">
        {/* Glowing visual indicators */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/2 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[300px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 w-full text-center">
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-heading font-bold text-white tracking-tighter leading-tight">
            {t.rich('title', {
              br: () => <br />,
              span: (chunks) => <span className="text-red-500 font-bold">{chunks}</span>
            })}
          </h1>

          {/* LAYMAN COMFORTING COPY */}
          <p className="mt-6 text-[#A0A0B0] text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          {/* Main Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 relative z-20">
            <button
              onClick={() => reset()}
              className="py-4 px-8 rounded-xl font-bold font-sans text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 bg-[#CCFF00] text-black hover:bg-[#b5e600] transition-all duration-300 shadow-[0_4px_30px_rgba(204,255,0,0.2)] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('cta_primary')}</span>
            </button>
            <Link
              href={`/${locale}#contact`}
              className="py-4 px-8 rounded-xl font-bold font-sans text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>{t('cta_secondary')}</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
