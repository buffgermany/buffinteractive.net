"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Terminal, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/store/languageStore";
import { useLocale, useTranslations } from 'next-intl';

const LOCALES = [
  { code: 'en', label: 'English', actionText: 'Switch to English', activeText: 'Continue in English', flagUrl: 'https://flagcdn.com/gb.svg' },
  { code: 'de', label: 'Deutsch', actionText: 'Wechsel auf Deutsch', activeText: 'Weiter auf Deutsch', flagUrl: 'https://flagcdn.com/de.svg' },
  { code: 'es', label: 'Español', actionText: 'Cambiar a Español', activeText: 'Continuar en Español', flagUrl: 'https://flagcdn.com/es.svg' }
];

export function Footer() {
  const router = useRouter();
  const t = useTranslations('Footer');
  const currentLocale = useLocale();
  const { setLocale } = useLanguageStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LOCALES.find(l => l.code === currentLocale) || LOCALES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className="relative bg-[#0A0A0A] border-t border-white/5 pt-24 overflow-hidden">
        {/* Top standard footer format */}
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-32 z-10 relative">
            <div className="col-span-1 md:col-span-2">
                <h4 className="font-heading font-bold text-2xl mb-4">{t('title')}</h4>
                <p className="text-muted-foreground text-sm max-w-xs">
                    {t('description')}
                </p>
                <div className="mt-8 flex gap-4 text-muted-foreground text-sm max-w-xs">
                    <span>{t('no_bullshit')}</span>
                </div>
            </div>
            
            <div className="flex flex-col gap-3">
                <h5 className="font-bold text-sm uppercase tracking-widest text-foreground-muted mb-4">{t('nav_title')}</h5>
                <Link href="/#services" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav_services')}</Link>
                <Link href="/#about" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav_about')}</Link>
                <Link href="/#contact" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('nav_start_project')}</Link>
            </div>

            <div className="flex flex-col gap-3">
                <h5 className="font-bold text-sm uppercase tracking-widest text-foreground-muted mb-4">{t('legal_title')}</h5>
                <Link href="/imprint" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('legal_imprint')}</Link>
                <Link href="/privacy" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('legal_privacy')}</Link>
                <Link href="/terms" prefetch={true} className="text-sm text-muted-foreground hover:text-white transition-colors">{t('legal_terms')}</Link>
                
                <div className="mt-4 pt-4 border-t border-white/5 relative">
                    <div className="flex flex-col gap-2 relative">
                        <span className="text-sm font-bold text-foreground-muted uppercase tracking-widest mb-1">{t('language_title')}</span>
                        
                        <div className="relative" ref={dropdownRef}>
                           {/* Important: we want the dropdown menu to open UPWARDS generally in a footer, or just downwards if there's space. Let's make it open downwards since we have space below, or upwards since it's the footer edge. The absolute bottom is not directly underneath, but to be safe, opening UPWARDS is usually better in a footer. */}
                           <button 
                               onClick={() => setIsLangOpen(!isLangOpen)}
                               className="text-sm text-white hover:text-primary transition-colors flex items-center justify-between group w-full text-left py-1 outline-none"
                           >
                               <div className="flex items-center gap-2.5">
                                 <img src={currentLanguage?.flagUrl || 'https://flagcdn.com/gb.svg'} alt={currentLanguage?.label || 'English'} className="w-5 h-[15px] object-cover rounded-[2px]" />
                                 <strong className="font-bold">{currentLanguage?.label || 'English'}</strong>
                               </div>
                               <ChevronUp size={14} className={`transition-transform duration-300 ml-2 ${isLangOpen ? 'rotate-180' : ''}`} />
                           </button>

                           {/* Dropdown Menu - opening upwards */}
                           {isLangOpen && (
                               <div className="absolute bottom-full left-0 mb-3 w-[280px] bg-[#0A0A0A]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50 flex flex-col gap-2 p-3 origin-bottom-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {LOCALES.map((lang) => {
                                        const isActive = currentLocale === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLocale(lang.code);
                                                    setIsLangOpen(false);
                                                    router.refresh();
                                                }}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all group outline-none ${
                                                    isActive 
                                                    ? 'border-transparent hover:bg-white/5' 
                                                    : 'border-white/5 bg-white/5 hover:border-primary/50 hover:bg-primary/10'
                                                }`}
                                            >
                                                <div className={`flex items-center gap-3 transition-opacity ${isActive ? 'opacity-60 group-hover:opacity-100' : ''}`}>
                                                    <div className={`w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10 transition-all ${isActive ? 'grayscale group-hover:grayscale-0' : ''}`}>
                                                        <img src={lang.flagUrl} alt={lang.label} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className={`text-sm transition-colors tracking-tight ${isActive ? 'text-white font-medium' : 'text-white font-bold group-hover:text-primary'}`}>
                                                        {isActive ? lang.activeText : lang.actionText}
                                                    </span>
                                                </div>
                                            </button>
                                       );
                                   })}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Easter Egg */}
        <div className="absolute right-6 bottom-[18vw] md:bottom-[12vw] z-20 group">
            <Link href="#bitfog-entry" prefetch={true} className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground/30 hover:text-[#00F0FF] transition-all duration-300">
                <Terminal size={12} />
                <span>&gt; ping bitfog</span>
            </Link>
            {/* Tooltip */}
            <div className="absolute bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="glass px-3 py-1.5 rounded-md border border-[#00F0FF]/30 whitespace-nowrap hidden md:block">
                    <span className="text-xs text-white">{t('bitfog_tooltip')}</span>
                </div>
            </div>
        </div>

        {/* Massive Typography Baseline */}
        <div className="relative w-full overflow-hidden flex justify-center -mb-[6vw] select-none pointer-events-none">
            <h1 className="font-heading font-black text-[18vw] leading-none text-white/5 tracking-tighter">
                BUFF.
            </h1>
        </div>
        
        {/* Absolute Bottom Copy */}
        <div className="absolute bottom-4 left-6 z-20 text-[10px] uppercase font-bold tracking-widest text-white/20">
            {t('copyright')}
        </div>
    </footer>
  );
}
