"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import { useRouter } from "next/navigation";

export function LanguagePopup() {
  const router = useRouter();
  const { hasDismissedLanguagePopup, setLocale, dismissLanguagePopup, locale } = useLanguageStore();
  const [show, setShow] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // 1500ms delay as requested, and only if not dismissed yet and locale is EN
    if (!hasDismissedLanguagePopup && locale === 'en') {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasDismissedLanguagePopup, locale]);

  const handleSwitch = (newLocale: string) => {
    setLocale(newLocale);
    setShow(false);
    router.refresh();
  };

  const handleDismiss = () => {
    dismissLanguagePopup();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:right-auto md:bottom-8 md:left-8 z-100 flex flex-col p-5 bg-[#0A0A0A]/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:w-[320px]"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base mb-1">Language detected</h3>
              <p className="text-[#A0A0B0] text-xs">Switch to German?</p>
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
              onClick={() => handleSwitch('de')}
              className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/10 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10">
                        <img src="https://flagcdn.com/de.svg" alt="Deutsch" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">Wechsel auf Deutsch</span>
                </div>
            </button>

            {showMore && (
                <motion.button
                  initial={{ opacity: 0, height: 0, margin: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleSwitch('es')}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:border-[#CCFF00]/50 hover:bg-[#CCFF00]/10 transition-all group overflow-hidden"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10">
                            <img src="https://flagcdn.com/es.svg" alt="Español" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-[#CCFF00] transition-colors">Cambiar a Español</span>
                    </div>
                </motion.button>
            )}

            <button
              onClick={handleDismiss}
              className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-white/5 transition-all group"
            >
                <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-[16px] shrink-0 rounded-[2px] overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all">
                        <img src="https://flagcdn.com/gb.svg" alt="English" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-white">Continue in English</span>
                </div>
            </button>

            {!showMore && (
                <button 
                    onClick={() => setShowMore(true)}
                    className="text-[10px] text-[#A0A0B0] hover:text-white mt-1 uppercase tracking-widest text-center transition-colors pb-1"
                >
                    Other languages
                </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
