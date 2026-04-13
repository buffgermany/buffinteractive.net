"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export function LoadingScreen() {
  const t = useTranslations("Loading");
  // We initialize as true. It will stay true for the duration.
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0);

  const steps = [
    t("step1"),
    t("step2"),
    t("step3"),
    t("step4"),
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const finishLoading = () => {
      setIsLoading(false);
      document.body.style.overflow = "";
    };

    if (document.readyState === "complete") {
      // Wenn die Seite bereits geladen ist, keine künstliche Verzögerung
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading);
    }

    // Text cycled weiter für User mit echten Ladezeiten
    const interval = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 400);

    return () => {
      window.removeEventListener("load", finishLoading);
      clearInterval(interval);
      document.body.style.overflow = "";
    };
  }, [steps.length]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-150 flex flex-col items-center justify-center bg-background text-foreground"
        >
          <div className="overflow-hidden h-24 md:h-32 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="font-heading text-2xl md:text-5xl lg:text-7xl text-center font-bold tracking-tighter"
              >
                {steps[step]}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex w-48 md:w-64">
             <div className="h-[2px] bg-foreground/10 w-full overflow-hidden">
                <motion.div 
                   className="h-full bg-foreground"
                   initial={{ width: "0%" }}
                   animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                   transition={{ duration: 0.7, ease: "easeInOut" }}
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
