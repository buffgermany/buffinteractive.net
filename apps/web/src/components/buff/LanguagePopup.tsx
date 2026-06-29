"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

export function LanguagePopup() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("LanguagePopup");
  const { hasDismissedLanguagePopup, setLocale, dismissLanguagePopup } = useLanguageStore();
  const [show, setShow] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  useEffect(() => {
    // 1500ms delay, and only if not dismissed yet
    if (!hasDismissedLanguagePopup) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasDismissedLanguagePopup]);

  // Handle automatic dismissal after transition finishes
  useEffect(() => {
    if (!isPending && switchingTo) {
      const timer = setTimeout(() => {
        setShow(false);
        setSwitchingTo(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPending, switchingTo]);

  const handleSwitch = (newLocale: string) => {
    setSwitchingTo(newLocale);
    startTransition(() => {
      setLocale(newLocale); // persist cookie as fallback
      dismissLanguagePopup(newLocale);
      router.replace(pathname, { locale: newLocale });
    });
  };

  const handleDismiss = () => {
    dismissLanguagePopup(currentLocale);
    setShow(false);
  };

  // Dynamically configure options based on the active locale resolved on the server
  let mainRecommend = {
    code: 'de',
    btnText: t('btn_de'),
    flagUrl: 'https://flagcdn.com/de.svg',
    alt: 'Deutsch'
  };
  let otherRecommend = {
    code: 'es',
    btnText: t('btn_es'),
    flagUrl: 'https://flagcdn.com/es.svg',
    alt: 'Español'
  };
  let currentLanguage = {
    code: 'en',
    flagUrl: 'https://flagcdn.com/gb.svg',
    alt: 'English'
  };

  if (currentLocale === 'de') {
    mainRecommend = {
      code: 'en',
      btnText: t('btn_en'),
      flagUrl: 'https://flagcdn.com/gb.svg',
      alt: 'English'
    };
    otherRecommend = {
      code: 'es',
      btnText: t('btn_es'),
      flagUrl: 'https://flagcdn.com/es.svg',
      alt: 'Español'
    };
    currentLanguage = {
      code: 'de',
      flagUrl: 'https://flagcdn.com/de.svg',
      alt: 'Deutsch'
    };
  } else if (currentLocale === 'es') {
    mainRecommend = {
      code: 'en',
      btnText: t('btn_en'),
      flagUrl: 'https://flagcdn.com/gb.svg',
      alt: 'English'
    };
    otherRecommend = {
      code: 'de',
      btnText: t('btn_de'),
      flagUrl: 'https://flagcdn.com/de.svg',
      alt: 'Deutsch'
    };
    currentLanguage = {
      code: 'es',
      flagUrl: 'https://flagcdn.com/es.svg',
      alt: 'Español'
    };
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.4, ease: "easeInOut" } }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:right-auto md:bottom-8 md:left-8 z-100 flex flex-col p-5 bg-[#0A0A0A]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:w-[340px]"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base mb-1">{t('title_detected')}</h3>
              <p className="text-[#A0A0B0] text-xs leading-relaxed">{t('text')}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 -mt-1 -mr-1 text-[#A0A0B0] hover:text-white transition-colors rounded-full hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSwitch(mainRecommend.code)}
              disabled={isPending}
              className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/10 transition-all group disabled:opacity-80 disabled:cursor-wait text-left"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
                  <img src={mainRecommend.flagUrl} alt={mainRecommend.alt} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                  {switchingTo === mainRecommend.code ? t('switching') : mainRecommend.btnText}
                </span>
                {switchingTo === mainRecommend.code && (
                  <div className="ml-auto">
                    <Loader2 size={14} className="text-[#CCFF00] animate-spin" />
                  </div>
                )}
              </div>
            </button>

            {showMore && (
              <motion.button
                initial={{ opacity: 0, height: 0, margin: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSwitch(otherRecommend.code)}
                disabled={isPending}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/10 transition-all group overflow-hidden disabled:opacity-80 disabled:cursor-wait text-left"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10 flex items-center justify-center bg-white/5">
                    <img src={otherRecommend.flagUrl} alt={otherRecommend.alt} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                    {switchingTo === otherRecommend.code ? t('switching') : otherRecommend.btnText}
                  </span>
                  {switchingTo === otherRecommend.code && (
                    <div className="ml-auto">
                      <Loader2 size={14} className="text-[#CCFF00] animate-spin" />
                    </div>
                  )}
                </div>
              </motion.button>
            )}

            <button
              onClick={handleDismiss}
              disabled={isPending}
              className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-white/5 transition-all group disabled:opacity-50 text-left"
            >
              <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity w-full">
                <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all flex items-center justify-center bg-white/5">
                  <img src={currentLanguage.flagUrl} alt={currentLanguage.alt} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-white">
                  {t('continue')}
                </span>
              </div>
            </button>

            {!showMore && (
              <button
                onClick={() => setShowMore(true)}
                disabled={isPending}
                className="text-[10px] text-[#A0A0B0] hover:text-white mt-1 uppercase tracking-widest text-center transition-colors pb-1 disabled:opacity-0"
              >
                {t('other_languages')}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
