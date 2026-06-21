"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";
import { useTranslations } from "next-intl";

export const BuildCTA = () => {
  const t = useTranslations('WaasContact');

  const whatsappNumber = t('whatsapp_number');
  const whatsappText = t('whatsapp_text');
  const emailAddress = t('email_address');
  const emailSubject = t('email_subject');

  return (
    <section id="contact" className="py-32 px-6 border-t border-border/50 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
        
        {/* Left Column: Direct Hook Copy */}
        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground tracking-tight leading-tight">
            {t.rich('cta_header', {
              br: () => <br />
            })}
          </h2>
          <p className="text-foreground-muted text-lg md:text-xl leading-relaxed font-sans max-w-md">
            {t('cta_subtext')}
          </p>
        </div>

        {/* Right Column: Premium Immediate Contact Cards */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* WhatsApp Card */}
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <BentoCard 
              glowColor="rgba(37,211,102,0.18)"
              className="border-white/5 bg-[#121212]/40 backdrop-blur-md hover:border-[#25D366]/30 shadow-sm transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 border border-[#25D366]/20 group-hover:scale-105 transition-all duration-500">
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-2 min-w-0 text-left">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-[#25D366] transition-colors duration-500">
                    {t('whatsapp_title')}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-sans">
                    {t('whatsapp_desc')}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] tracking-wider uppercase font-sans mt-2">
                    <span>{t('whatsapp_cta')}</span>
                    <ArrowUpRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </a>

          {/* Email Card */}
          <a 
            href={`mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}`}
            className="block group"
          >
            <BentoCard 
              glowColor="rgba(255,255,255,0.08)"
              className="border-white/5 bg-[#121212]/40 backdrop-blur-md hover:border-white/10 shadow-sm transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white shrink-0 border border-white/10 group-hover:scale-105 transition-all duration-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-2 min-w-0 text-left">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-primary transition-colors duration-500">
                    {t('email_title')}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-sans">
                    {t('email_desc')}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-primary tracking-wider uppercase font-sans mt-2 break-all">
                    <span>{t('email_cta')}</span>
                    <ArrowUpRight className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </a>

        </div>
      </div>

      {/* Decorative gradients */}
      <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#25D366]/2 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
