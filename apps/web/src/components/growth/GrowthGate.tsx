"use client";

import { useTranslations } from "next-intl";
import { Mail, ArrowUpRight } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";

export function GrowthGate() {
  const t = useTranslations('GrowthGate');
  const tContact = useTranslations('WaasContact');

  const whatsappNumber = tContact('whatsapp_number');
  const whatsappText = t('whatsapp_text');
  const emailAddress = tContact('email_address');
  const emailSubject = t('email_subject');

  return (
    <section id="contact" className="relative z-10 w-full py-32 md:py-48 bg-[#050207] border-t border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,255,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 w-full flex flex-col gap-16 relative z-10">
        <div className="flex flex-col gap-6 text-center md:text-left">
          <h2 className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tighter">
            {t('title')}
          </h2>
          <p className="text-xl md:text-2xl text-[#A0A0B0] font-sans leading-relaxed max-w-3xl">
            {t('subtext')}
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full mt-4 max-w-2xl mx-auto">
          {/* WhatsApp Card */}
          <a 
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <BentoCard 
              glowColor="rgba(37,211,102,0.18)"
              className="border-white/5 bg-[#121212]/40 backdrop-blur-md hover:border-[#25D366]/30 shadow-sm transition-all duration-500 h-full"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 border border-[#25D366]/20 group-hover:scale-105 transition-all duration-500">
                  <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-2 min-w-0 text-left">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-[#25D366] transition-colors duration-500">
                    {tContact('whatsapp_title')}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-sans">
                    {tContact('whatsapp_desc')}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-[#25D366] tracking-wider uppercase font-sans mt-2">
                    <span>{tContact('whatsapp_cta')}</span>
                    <ArrowUpRight className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
              className="border-white/5 bg-[#121212]/40 backdrop-blur-md hover:border-white/10 shadow-sm transition-all duration-500 h-full"
            >
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white shrink-0 border border-white/10 group-hover:scale-105 transition-all duration-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-2 min-w-0 text-left">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-primary transition-colors duration-500">
                    {tContact('email_title')}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-sans">
                    {tContact('email_desc')}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-primary tracking-wider uppercase font-sans mt-2 break-all">
                    <span>{tContact('email_cta')}</span>
                    <ArrowUpRight className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </a>
        </div>
      </div>
    </section>
  );
}
