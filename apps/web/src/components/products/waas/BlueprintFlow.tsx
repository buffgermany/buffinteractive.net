'use client';

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { BentoCard } from "@/components/buff/BentoCard";

export function BlueprintFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    restDelta: 0.001
  });

  // --- 1. Opacity Transitions (REVEALS CARDS ONLY WHEN ACTIVE TO ELIMINATE BLEED-THROUGH) ---
  // Card 1 fades out completely when Card 2 starts overlapping it
  const opacity1 = useTransform(smoothProgress, [0.0, 0.16, 0.22], [1, 1, 0]);

  // Card 2 is invisible at start, active during middle, and fades to 0 completely when Card 3 starts overlapping it
  const opacity2 = useTransform(smoothProgress, [0.0, 0.20, 0.26, 0.50, 0.56], [0, 0, 1, 1, 0]);

  // Card 3 is invisible until Card 2 is ready to be replaced
  const opacity3 = useTransform(smoothProgress, [0.0, 0.52, 0.60, 1.0], [0, 0, 1, 1]);

  // --- 2. Pointer Events (PREVENTS COVERED INVISIBLE CARDS INTERCEPTING CLICKS) ---
  const pointerEvents1 = useTransform(smoothProgress, [0.0, 0.20], ["auto", "none"]);
  const pointerEvents2 = useTransform(smoothProgress, [0.0, 0.20, 0.52], ["none", "auto", "none"]);
  const pointerEvents3 = useTransform(smoothProgress, [0.0, 0.52], ["none", "auto"]);

  // --- 3. Parallax Card Stack Scales & Translates ---
  // Card 1 rests, then moves up slightly at transition
  const y1 = useTransform(smoothProgress, [0.0, 0.15, 0.22], [0, 0, -20]);
  const s1 = useTransform(smoothProgress, [0.0, 0.15, 0.22], [1, 1, 0.95]);

  // Card 2 enters cleanly from 300px (not too far to prevent overflow/clipping), then moves up slightly at transition
  const y2 = useTransform(smoothProgress, [0.0, 0.15, 0.26, 0.50, 0.56], [300, 300, 0, 0, -20]);
  const s2 = useTransform(smoothProgress, [0.0, 0.20, 0.26, 0.50, 0.56], [0.95, 0.95, 1, 1, 0.95]);

  // Card 3 enters cleanly from 300px
  const y3 = useTransform(smoothProgress, [0.0, 0.48, 0.60], [300, 300, 0]);
  const s3 = useTransform(smoothProgress, [0.0, 0.48, 0.60], [0.95, 0.95, 1]);

  return (
    <section
      ref={containerRef}
      id="blueprint"
      className="relative w-full bg-[#050505] overflow-visible border-b border-white/5 h-[300vh]"
    >
      <div className="sticky top-0 h-[100dvh] flex flex-col justify-center items-center overflow-hidden py-4 xs:py-6 sm:py-10 md:py-16 px-4 sm:px-6">

        {/* Glowing background matrix */}
        <div className="absolute top-[30%] left-[20%] w-[250px] xs:w-[450px] h-[250px] xs:h-[450px] bg-primary/2 rounded-full blur-[90px] xs:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[200px] xs:w-[350px] h-[200px] xs:h-[350px] bg-primary/1 rounded-full blur-[70px] xs:blur-[110px] pointer-events-none" />

        {/* Section Header */}
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-1.5 xs:gap-3 relative z-10 mb-4 xs:mb-6 sm:mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tighter leading-tight"
          >
            In 3 Schritten zu deiner<br /><span className="text-primary">Traum-Website.</span>
          </motion.h2>
        </div>

        {/* Card Stack Frame - Highly compact responsive heights to fit perfectly in any dynamic viewport */}
        {mounted && (
          <div className="relative w-full max-w-5xl h-[210px] xs:h-[190px] sm:h-[170px] md:h-[440px] xl:h-[480px] flex items-center justify-center z-10">

            {/* Step 1 Card */}
            <motion.div
              style={{
                y: y1,
                scale: s1,
                opacity: opacity1,
                pointerEvents: pointerEvents1,
                zIndex: 10,
              }}
              className="absolute w-full h-full"
            >
              <BentoCard
                glowColor="rgba(255,255,255,0.03)"
                className="h-full border-white/5 bg-[#0e0c12]/60 backdrop-blur-lg"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 xs:gap-5 md:gap-8 items-center justify-center md:justify-between h-full relative">
                  <div className="md:col-span-7 flex flex-col justify-center text-left gap-2 xs:gap-3 md:gap-5 min-w-0 w-full md:mb-0 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] xs:text-xs font-extrabold text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/5 uppercase tracking-wider">
                        01
                      </span>
                      <span className="text-[8px] xs:text-xs text-white/40 uppercase font-mono tracking-widest">Vision & Briefing</span>
                    </div>
                    <h3 className="text-base xs:text-lg md:text-2xl xl:text-3xl font-heading font-bold text-white leading-tight">Erstgespräch & Vision</h3>
                    <p className="text-[#A0A0B0] text-[10px] xs:text-sm xl:text-base leading-relaxed font-sans max-w-md md:max-w-xl font-normal">
                      Keine unendlichen Fragebögen, kein Stress. In einem entspannten 15-minütigen Gespräch klären wir deine spezifischen Wünsche, deinen favorisierten Stil und deine Geschäftsziele. Wir nehmen alles auf – du musst dich auf nichts vorbereiten.
                    </p>
                  </div>
                  <div className="hidden md:flex justify-end items-end md:col-span-5 md:absolute md:bottom-[-24px] md:right-[-24px] lg:bottom-[-32px] lg:right-[-32px] md:h-[110%] md:w-auto z-0 origin-bottom-right pointer-events-none">
                    <img
                      src="/blueprint-step1.png"
                      alt="Erstgespräch & Vision Mockup"
                      className="w-auto h-full object-contain object-right-bottom rounded-tl-2xl md:rounded-tl-3xl transition-transform duration-500 hover:scale-105 pointer-events-auto"
                    />
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            {/* Step 2 Card */}
            <motion.div
              style={{
                y: y2,
                scale: s2,
                opacity: opacity2,
                pointerEvents: pointerEvents2,
                zIndex: 20,
              }}
              className="absolute w-full h-full"
            >
              <BentoCard
                glowColor="rgba(204,255,0,0.18)"
                className="h-full border-white/10 bg-[#0c0d0a]/80 backdrop-blur-lg shadow-[0_0_80px_-25px_rgba(204,255,0,0.08)]"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 xs:gap-5 md:gap-8 items-center justify-center md:justify-between h-full">
                  <div className="md:col-span-7 flex flex-col justify-center text-left gap-2 xs:gap-3 md:gap-5 min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] xs:text-xs font-extrabold text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/5 uppercase tracking-wider">
                        02
                      </span>
                      <span className="text-[8px] xs:text-xs text-white/40 uppercase font-mono tracking-widest">Maßgeschneiderte Kreation</span>
                    </div>
                    <h3 className="text-base xs:text-lg md:text-2xl xl:text-3xl font-heading font-bold text-white leading-tight">Pixelgenaues Handwerk</h3>
                    <p className="text-[#A0A0B0] text-[10px] xs:text-sm xl:text-base leading-relaxed font-sans max-w-md md:max-w-xl font-normal">
                      Innerhalb von nur 7 Tagen entwerfen wir deinen vollkommen individuellen Designentwurf. Keine billigen Templates von der Stange, sondern maßgeschneiderter Code, der exakt auf deine Marke abgestimmt ist. Du gibst uns Feedback, wir schleifen das Design – bis es zu 100% sitzt.
                    </p>
                  </div>
                  <div className="hidden md:flex justify-center items-center md:col-span-5 md:h-[220px] xl:h-[260px] shrink-0 overflow-hidden w-full md:max-w-full mx-auto">
                    <img
                      src="/blueprint-step2.png"
                      alt="Pixelgenaues Handwerk Mockup"
                      className="w-full h-full object-contain rounded-xl md:rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </BentoCard>
            </motion.div>

            {/* Step 3 Card */}
            <motion.div
              style={{
                y: y3,
                scale: s3,
                opacity: opacity3,
                pointerEvents: pointerEvents3,
                zIndex: 30,
              }}
              className="absolute w-full h-full"
            >
              <BentoCard
                glowColor="rgba(255,255,255,0.03)"
                className="h-full border-white/5 bg-[#0b0c10]/80 backdrop-blur-lg"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 xs:gap-5 md:gap-8 items-center justify-center md:justify-between h-full">
                  <div className="md:col-span-7 flex flex-col justify-center text-left gap-2 xs:gap-3 md:gap-5 min-w-0 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] xs:text-xs font-extrabold text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/5 uppercase tracking-wider">
                        03
                      </span>
                      <span className="text-[8px] xs:text-xs text-white/40 uppercase font-mono tracking-widest">Autopilot aktivieren</span>
                    </div>
                    <h3 className="text-base xs:text-lg md:text-2xl xl:text-3xl font-heading font-bold text-white leading-tight">Go-Live & Rundum-Sorglos</h3>
                    <p className="text-[#A0A0B0] text-[10px] xs:text-sm xl:text-base leading-relaxed font-sans max-w-md md:max-w-xl font-normal">
                      Sobald du rundum zufrieden bist, schalten wir die Seite scharf. Ab jetzt übernimmt dein Autopilot: Blitzschnelles Hosting auf ISO-zertifizierten deutschen Servern, SSL-Verschlüsselung, automatische Backups und DSGVO-Updates sind aktiv. Und all deine fortlaufenden Änderungswünsche? WhatsApp genügt.
                    </p>
                  </div>
                  <div className="hidden md:flex justify-center items-center md:col-span-5 md:h-[220px] xl:h-[260px] shrink-0 overflow-hidden w-full md:max-w-full mx-auto">
                    <img
                      src="/blueprint-step3.png"
                      alt="Go-Live & Rundum-Sorglos Mockup"
                      className="w-full h-full object-contain rounded-xl md:rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </BentoCard>
            </motion.div>

          </div>
        )}
      </div>
    </section>
  );
}
