"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { Zap, LayoutGrid, Lock } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";

export function AntiPortfolioSection() {
  const [isMobile, setIsMobile] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const gradientOpacity = useTransform(scrollYProgress, [0.1, 0.45, 0.75, 0.95], [0, 1, 1, 0]);
  const gradientY = useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section
      className="relative py-32 px-6 overflow-hidden bg-[#050505]"
    >
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col justify-center">

        {/* Section Header */}
        <div className="mb-12 md:mb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold font-heading text-[#F8F8F8] tracking-tight leading-tight">
              Gebaut für Europas wertvollsten Konzern.
              <sup className="text-[0.6em] ml-0.5 text-muted-foreground/50">1</sup>
            </h2>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 w-full">

          {/* Card 1: The Authority — Full width top */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full"
          >
            <BentoCard className="w-full min-h-[320px] md:min-h-[380px]" glowColor="rgba(226, 0, 116, 0.15)">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 h-full z-10 relative">
                <div className="flex flex-col justify-between h-full gap-8">
                  <Lock
                    className="w-10 h-10 md:w-14 md:h-14 text-[#E20074] transition-colors duration-500 group-hover:text-[#F8F8F8]"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-[#F8F8F8] tracking-tight leading-tight max-w-4xl">
                      Wir skalieren die Vertriebssteuerung der{' '}
                      <span className="relative inline-flex items-center align-baseline select-none overflow-hidden rounded-md px-2.5 py-0.5 bg-[#1F1F1F]/40 border border-white/5 shadow-inner whitespace-nowrap">
                        <motion.span
                          className="font-mono tracking-wider text-xl md:text-4xl lg:text-5xl opacity-50 filter blur-[2px] text-[#F8F8F8] block select-none whitespace-nowrap"
                          animate={{ opacity: [0.4, 0.6, 0.4] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          ••••••• •••••••
                        </motion.span>
                        <span className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          animate={{ x: "200%" }}
                          transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut",
                            repeatDelay: 1
                          }}
                        />
                      </span>{' '}
                      bundesweit.
                      <sup className="text-[0.6em] ml-0.5 text-muted-foreground/50">2</sup>
                    </h2>
                  </div>
                </div>
              </div>

              {/* Mobile scroll-reveal gradient fill (from the bottom, like user's scribble) */}
              <motion.div
                className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-transparent via-[#E20074]/18 to-transparent pointer-events-none md:hidden"
                style={{
                  opacity: gradientOpacity,
                  y: gradientY
                }}
              />
            </BentoCard>
          </motion.div>

          {/* Row 2: Card 2 + Card 3 side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Card 2 */}
            <motion.div
              className="flex"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.15 }}
            >
              <BentoCard className="w-full">
                <div>
                  <Zap className="w-8 h-8 text-[#CCFF00] mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Null Sekunden Bedenkzeit.</h3>
                  <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                    Eingesetzt live im Kundengespräch. Das bedeutet: Null Toleranz für Ladezeiten & Fehler. Das Tool steht nie im Weg. Absolute Höchstgeschwindigkeit war hier keine Option, sondern das fundamentale Design-Prinzip.
                  </p>
                </div>
              </BentoCard>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              className="flex"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
            >
              <BentoCard className="w-full">
                <div>
                  <LayoutGrid className="w-8 h-8 text-[#CCFF00] mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Komplexität, unsichtbar gemacht.</h3>
                  <p className="text-[#A0A0B0] leading-relaxed text-sm md:text-base">
                    Gebaut für den pausenlosen Einsatz aus ganz Deutschland. Das Frontend ist spielerisch leicht, das Backend eine absolute Festung. Volle Rechtesteuerung, strenge Compliance und maximale Ausfallsicherheit.
                  </p>
                </div>
              </BentoCard>
            </motion.div>

          </div>
        </div>

        {/* NDA Footer Hint */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.4 }}
          className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-3 text-center"
        >
          <Lock className="w-4 h-4 text-[#A0A0B0]" />
          <span className="text-[#A0A0B0] text-sm md:text-base font-medium tracking-wide uppercase">
            Weitere verschwiegene Marktführer unter NDA
          </span>
        </motion.div>

      </div>
    </section>
  );
}
