'use client';

import { motion, useAnimationFrame } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingDown, Receipt } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';

function GrowthCurvesBackground() {
  const curves = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const offset = i * 20;
      return `M -100 ${300 + offset} Q 200 ${100 + offset} 400 ${400 + offset} T 1000 ${200 + offset} T 1600 ${350 + offset}`;
    });
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.14] flex items-center justify-center">
      <svg className="w-full h-full min-h-[500px]" viewBox="0 0 1200 800" preserveAspectRatio="none">
        {curves.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="#CCFF00"
            strokeWidth="1.5"
            animate={{ y: [15, -15, 15] }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function AdSpendCounter() {
  const startVal = 2450.00;
  const currencySymbol = '€';
  const [spend, setSpend] = useState(startVal);

  useAnimationFrame((time, delta) => {
    // Slower, smoother growth based on time elapsed
    setSpend((prev) => prev + (delta * 0.04));
  });

  return (
    <div className="font-mono text-4xl md:text-[2.75rem] font-bold tracking-tighter text-red-600 flex items-center gap-1">
      <span className="text-red-600/70 text-3xl font-bold">{currencySymbol}</span>
      {spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  );
}

function ReceiptVisual() {
  // Hardcoded 10 itemized extra costs directly in German
  const items = [
    { name: "Entwickler-Stundenlohn", price: "150,00 €" },
    { name: "Premium Web-Hosting", price: "49,00 €/Monat" },
    { name: "Cookie-Banner & DSGVO-Check", price: "199,00 €" },
    { name: "Sicherheits-Backups", price: "29,00 €/Monat" },
    { name: "Google Maps & SEO Setup", price: "249,00 €" },
    { name: "Wartung & Textpflege", price: "89,00 €/Monat" },
    { name: "Design-Konzeptentwurf", price: "850,00 €" },
    { name: "SSL-Sicherheitszertifikat", price: "19,00 €/Monat" },
    { name: "Domain-Gebühren", price: "15,00 €/Jahr" },
    { name: "Dringende Fehlerbehebung", price: "350,00 €" }
  ];

  // Replicate to 50 items to ensure smooth continuous infinite scrolling
  const repeatedItems = Array.from({ length: 50 }).map((_, i) => {
    const item = items[i % items.length];
    return {
      ...item,
      id: 10293 + i
    };
  });

  return (
    <div className="relative w-full max-w-sm xl:max-w-md mx-auto" style={{ perspective: "1500px" }}>
      {/* Noise Filter Definition */}
      <svg className="absolute w-0 h-0 invisible">
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
        </filter>
      </svg>

      <motion.div
        animate={{ rotateY: [-4, 4, -4], rotateX: [2, -2, 2], y: [-5, 5, -5] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        className="w-full relative group"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Deep drop shadow for paper physical depth */}
        <div className="absolute inset-0 bg-black/40 blur-2xl transform translate-y-12 scale-95 opacity-50" />

        <div className="bg-[#F2F2F2] w-full flex flex-col relative z-20 text-black font-mono rounded-t-[0.5rem] shadow-xl overflow-hidden">
          {/* Paper Grain Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ filter: "url(#paper-noise)" }} />

          {/* Crease/Fold Gradients */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/20 via-transparent to-black/[0.02]" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.02) 50%, transparent 55%)" }} />

          {/* Plasticky Sheen (Thermal Paper waxiness) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            style={{ backgroundSize: "200% 200%", backgroundPosition: "var(--sheen-x, 0%) var(--sheen-y, 0%)" }} />

          {/* Header */}
          <div className="flex flex-col items-center justify-center border-b-2 border-black/20 pb-6 mb-2 pt-10 px-8 text-center space-y-2 relative">
            <Receipt className="w-8 h-8 text-black mb-2 opacity-80" />
            <span className="text-xl font-bold tracking-widest uppercase opacity-90">RECHNUNG</span>
            <span className="text-[10px] tracking-[0.2em] text-black/40 uppercase font-bold text-center leading-normal">EINZELKOSTEN BEI DER DIY-VARIANTE</span>
          </div>

          {/* Scrolling Items Area */}
          <div className="relative h-[200px] md:h-[280px] overflow-hidden w-full px-8">
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#F2F2F2] to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F2F2F2] to-transparent z-10" />

            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              className="flex flex-col pt-4"
            >
              {repeatedItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-black/5 text-[10px] text-black/80 font-bold gap-4">
                  <div className="flex flex-col gap-0.5 text-left min-w-0">
                    <span className="uppercase truncate">{item.name}</span>
                    <span className="text-black/40 text-[9px] truncate">Kategorie: Extra-Aufwand</span>
                  </div>
                  <span className="tabular-nums opacity-60 shrink-0">{item.price}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer / Total Area */}
          <div className="px-8 pt-6 pb-2 mt-4 border-t-2 border-black/20 border-dashed relative">
            <div className="text-[11px] font-bold uppercase tracking-widest text-black/40 mb-2 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> Unerwartete Kosten...
            </div>
            {/* Only colored element: Red counter */}
            <AdSpendCounter />

            {/* Simulation of thermal printer artifacts */}
            <div className="mt-8 flex justify-center gap-1 opacity-10 grayscale">
              <div className="w-8 h-8 bg-black rounded-sm" />
              <div className="w-8 h-8 bg-black rounded-sm" />
              <div className="w-8 h-8 bg-black rounded-sm" />
            </div>
          </div>
        </div>

        {/* Jagged Bottom Edge via SVG */}
        <div className="relative -mt-[1px] z-10 w-full text-[#F2F2F2] drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)]">
          <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="w-full h-4 block fill-current">
            <path d="M0,0 L0,1 Q1.25,6 2.5,1 Q3.75,6 5,1 Q6.25,6 7.5,1 Q8.75,6 10,1 Q11.25,6 12.5,1 Q13.75,6 15,1 Q16.25,6 17.5,1 Q18.75,6 20,1 Q21.25,6 22.5,1 Q23.75,6 25,1 Q26.25,6 27.5,1 Q28.75,6 30,1 Q31.25,6 32.5,1 Q33.75,6 35,1 Q36.25,6 37.5,1 Q38.75,6 40,1 Q41.25,6 42.5,1 Q43.75,6 45,1 Q46.25,6 47.5,1 Q48.75,6 50,1 Q51.25,6 52.5,1 Q53.75,6 55,1 Q56.25,6 57.5,1 Q58.75,6 60,1 Q61.25,6 62.5,1 Q63.75,6 65,1 Q66.25,6 67.5,1 Q68.75,6 70,1 Q71.25,6 72.5,1 Q73.75,6 75,1 Q76.25,6 77.5,1 Q78.75,6 80,1 Q81.25,6 82.5,1 Q83.75,6 85,1 Q86.25,6 87.5,1 Q88.75,6 90,1 Q91.25,6 92.5,1 Q93.75,6 95,1 Q96.25,6 97.5,1 Q98.75,6 100,1 L100,0 Z" />
          </svg>
        </div>

      </motion.div>
    </div>
  );
}

export function GrowthHero({
  city,
  title,
  description,
}: {
  city?: string;
  title?: React.ReactNode;
  description?: string;
} = {}) {
  return (
    <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center pt-24 md:pt-32 pb-20 md:pb-24 px-4 sm:px-6 z-10 w-full overflow-hidden bg-background">
      
      {/* Absolute Full-Screen Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <GrowthCurvesBackground />
        
        {/* Base dark overlay */}
        <div className="absolute inset-0 bg-background/30 pointer-events-none" />
        
        {/* Centered intense gradient to pop the text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-[1000px] aspect-square bg-[radial-gradient(circle,hsl(var(--background)/0.8)_0%,transparent_75%)] opacity-100" />
        </div>
      </div>

      {/* Bottom fade transition */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-16 w-full max-w-7xl mx-auto relative z-10 lg:pt-8">

        {/* Left Column: Copy & Actions */}
        <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left min-w-0 pr-0 lg:pr-8">
          <motion.h1
            initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.5rem] 2xl:text-[3.75rem] tracking-tighter leading-[1.1] text-foreground mb-6 text-balance w-full max-w-xl lg:max-w-[38rem] xl:max-w-[42rem] mx-auto lg:mx-0"
          >
            {title || (
              <>
                Deine <span className="text-primary font-extrabold">Website auf{' '}
                  Autopilot.</span>{' '}
                Vollkommen ohne Kopfschmerzen.
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="w-full max-w-xl lg:max-w-[32rem] xl:max-w-[36rem] text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed pt-2 mb-10 px-2 sm:px-0 text-balance mx-auto lg:mx-0"
          >
            {description || "Websites auf Autopilot: Rundum-Sorglos statt teurer Einmalzahlung. Wir bauen, hosten und pflegen deine Traum-Website zum fairen monatlichen Festpreis. Damit du dich voll auf dein Geschäft konzentrieren kannst."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-6 pt-4 md:pt-6 w-full sm:w-auto px-2 sm:px-0 mx-auto lg:mx-0"
          >
            <Link href="#contact" className="group interactive-pill flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-base hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] w-full sm:w-auto active:scale-95">
              Jetzt Angebot anfordern
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#paradigm" className="text-muted-foreground font-medium hover:text-foreground transition-all duration-300 px-6 py-4 text-sm md:text-base">
              Preise & Pläne ansehen
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Visualizer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
          className="w-full lg:w-[450px] xl:w-[500px] shrink-0 scale-90 sm:scale-95 md:scale-100"
        >
          <ReceiptVisual />
        </motion.div>

      </div>
    </section>
  );
}
