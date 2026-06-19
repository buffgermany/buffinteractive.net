"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Check, ArrowDownRight, Plus, ChevronsRight, Percent } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";
import { WigglyUnderline } from "@/components/premium/organic-ui";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  setupFee: string;
  desc: string;
  features: string[];
  specialFeature?: string;
  cta: string;
  isPopular?: boolean;
  onCtaClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function PricingCardContent({
  name,
  price,
  period,
  setupFee,
  desc,
  features,
  specialFeature,
  cta,
  isPopular = false,
  onCtaClick,
}: PricingCardProps) {
  return (
    <div className="flex flex-col h-full justify-between flex-grow text-left">
      <div>
        {/* Name Header */}
        <div className="flex flex-col items-start gap-1">
          <h3 className={`text-2xl md:text-3xl font-bold font-heading mt-1 ${isPopular ? "text-[#CCFF00]" : "text-white"
            }`}>
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-white/50 font-sans mt-3 leading-relaxed min-h-[40px]">
          {desc}
        </p>

        {/* Pricing & Setup Fee */}
        <div className="mt-6 flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-4xl font-extrabold font-heading text-white tracking-tight">
              {price}
            </span>
            {period && (
              <span className="text-xs md:text-sm text-white/40 font-medium">
                {period}
              </span>
            )}
          </div>
          <span className="text-[11px] md:text-xs font-sans text-white/45 mt-1 font-medium">
            {setupFee}
          </span>
          <div className="flex items-center gap-1 text-white/35 mt-1.5 font-normal">
            <Percent className="w-3 h-3 shrink-0" />
            <span className="text-[10px] md:text-[11px] font-sans">
              Alle Preise inkl. MwSt. (Brutto)
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-6" />

        {/* Features */}
        <ul className="space-y-3">
          {specialFeature && (
            <li className="flex items-start gap-2.5 text-xs md:text-sm text-[#CCFF00] font-bold">
              <ChevronsRight className="w-4 h-4 shrink-0 mt-0.5 text-[#CCFF00]" strokeWidth={2.5} />
              <span className="font-sans leading-snug">{specialFeature}</span>
            </li>
          )}
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/70">
              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? "text-[#CCFF00]" : "text-white/40"
                }`} strokeWidth={2.5} />
              <span className="font-sans leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="mt-8">
        <a
          href="#contact"
          onClick={onCtaClick}
          className={`w-full py-3.5 px-4 rounded-xl font-bold font-sans text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group cursor-pointer ${isPopular
            ? "bg-[#CCFF00] text-black hover:bg-[#b5e600] shadow-[0_4px_24px_rgba(204,255,0,0.25)]"
            : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
            }`}
        >
          <span>{cta}</span>
          <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
}

export function GrowthParadigm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth scrollProgress through a spring physics filter to create inertia / Lerp catch-up
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  // Staggered Unstacking Coordinates:
  // Card 1 starts slide-out first (0.05 -> 0.55)
  // Card 2 activates scale/raise in the middle (0.15 -> 0.65)
  // Card 3 starts slide-out last (0.25 -> 0.75)

  const x1 = useTransform(smoothProgress, [0.05, 0.55], ["-20%", "-105%"]);
  const r1 = useTransform(smoothProgress, [0.05, 0.55], [-6, 0]);
  const y1 = useTransform(smoothProgress, [0.05, 0.55], [20, 0]);
  const s1 = useTransform(smoothProgress, [0.05, 0.55], [0.94, 1]);

  const y2 = useTransform(smoothProgress, [0.15, 0.65], [0, -12]);
  const s2 = useTransform(smoothProgress, [0.15, 0.65], [0.98, 1.03]);

  const x3 = useTransform(smoothProgress, [0.25, 0.75], ["20%", "105%"]);
  const r3 = useTransform(smoothProgress, [0.25, 0.75], [6, 0]);
  const y3 = useTransform(smoothProgress, [0.25, 0.75], [20, 0]);
  const s3 = useTransform(smoothProgress, [0.25, 0.75], [0.94, 1]);

  const tier1Features = [
    "Individuelles High-End Design",
    "Optimiert für Handys & Tablets",
    "Premium Hosting & SSL-Sicherheit",
    "Einfache Updates inklusive (Texte/Bilder)",
    "Google Maps & lokale SEO-Basics"
  ];

  const tier2Features = [
    "Mehrseitige Website (bis zu 5 Seiten)",
    "Kompletter DSGVO-Schutz & Cookie-Banner",
    "Unbegrenzte Änderungen (Bilder & Texte)",
    "Aktive Google & Suchmaschinen-Optimierung",
    "WhatsApp- & E-Mail-Direktsupport",
    "Inklusive Domain- & E-Mail-Einrichtung"
  ];

  const tier3Features = [
    "Beliebiger Seitenumfang & Sonderfunktionen",
    "Online-Terminbuchung & Formulare",
    "Anbindung an deine Praxis- & Kassensysteme",
    "Persönlicher Ansprechpartner",
    "Höchste Datenschutz- & Sicherheitsstandards"
  ];

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      id="paradigm"
      className="relative z-10 w-full bg-[#050505] md:h-[200vh]"
    >
      {/* 1. DESKTOP INTERACTIVE PINNED CONTAINER */}
      <div className="hidden md:flex sticky top-0 h-dvh flex-col justify-center items-center overflow-hidden py-16 px-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-4 relative z-10 mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter leading-none"
          >
            Transparente <WigglyUnderline>Festpreise.</WigglyUnderline>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="max-w-2xl text-[#A0A0B0] text-base md:text-lg"
          >
            Rundum-Sorglos-Websites ohne Überraschungen. Wir bauen, hosten und pflegen deine Traum-Website.
          </motion.p>
        </div>

        {/* Dynamic Billing Switch */}
        <div className="flex justify-center mb-10 relative z-20">
          <div className="bg-[#121212]/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-xs font-bold font-sans transition-all duration-300 relative ${billingInterval === 'monthly'
                ? "text-black"
                : "text-white/60 hover:text-white"
                }`}
            >
              {billingInterval === 'monthly' && (
                <motion.div
                  layoutId="billingToggle"
                  className="absolute inset-0 bg-[#CCFF00] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Monatlich
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-xs font-bold font-sans transition-all duration-300 relative flex items-center gap-1.5 ${billingInterval === 'yearly'
                ? "text-black"
                : "text-white/60 hover:text-white"
                }`}
            >
              {billingInterval === 'yearly' && (
                <motion.div
                  layoutId="billingToggle"
                  className="absolute inset-0 bg-[#CCFF00] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span>Jährlich</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans tracking-wide uppercase transition-all duration-300 ${billingInterval === 'yearly'
                ? "bg-black/10 text-black font-extrabold"
                : "bg-primary/20 text-[#CCFF00] font-extrabold"
                }`}>
                - 5 %
              </span>
            </button>
          </div>
        </div>

        {/* Card Deck Spacing Frame */}
        <div className="relative w-[310px] lg:w-[350px] xl:w-[380px] h-[610px] lg:h-[650px] xl:h-[695px] flex items-center justify-center z-10">

          {/* Card 1: Essential (Left) */}
          <motion.div
            style={{
              x: x1,
              rotate: r1,
              y: y1,
              scale: s1,
              zIndex: 10,
            }}
            className="absolute w-full h-[540px] lg:h-[580px] xl:h-[625px] cursor-grab active:cursor-grabbing"
          >
            <BentoCard
              glowColor="rgba(255,255,255,0.06)"
              className="h-full border-white/5 bg-[#121212]/40 backdrop-blur-md"
            >
              <PricingCardContent
                name="Essential"
                price={billingInterval === 'monthly' ? "75 €" : "71.25 €"}
                period="/ Monat"
                setupFee={billingInterval === 'monthly' ? "zzgl. 229,99 € Setup-Gebühr" : "zzgl. 229,99 € Setup-Gebühr (bei jährlicher Zahlung)"}
                desc="Der perfekte Einstieg für dein lokales Geschäft, deine Praxis oder dein Restaurant."
                features={tier1Features}
                cta="Essential starten"
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </motion.div>

          {/* Card 2: Growth (Center / Recommended) */}
          <motion.div
            style={{
              x: "0%",
              rotate: 0,
              y: y2,
              scale: s2,
              zIndex: 30,
            }}
            className="absolute w-full h-[590px] lg:h-[630px] xl:h-[675px] cursor-grab active:cursor-grabbing"
          >
            <BentoCard
              glowColor="rgba(204,255,0,0.25)"
              className="h-full border-[#CCFF00]/30 shadow-[0_0_80px_-20px_rgba(204,255,0,0.15)] bg-[#121212]/80 backdrop-blur-md"
            >
              <PricingCardContent
                name="Growth"
                price={billingInterval === 'monthly' ? "89 €" : "84,55 €"}
                period="/ Monat"
                setupFee={billingInterval === 'monthly' ? "zzgl. 329,99 € Setup-Gebühr" : "zzgl. 329,99 € Setup-Gebühr (bei jährlicher Zahlung)"}
                desc="Für Betriebe, die online professionell Kunden & Patienten gewinnen wollen."
                features={tier2Features}
                specialFeature="Alles von Essential"
                cta="Wachstum einleiten"
                isPopular={true}
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </motion.div>

          {/* Card 3: Enterprise (Right) */}
          <motion.div
            style={{
              x: x3,
              rotate: r3,
              y: y3,
              scale: s3,
              zIndex: 20,
            }}
            className="absolute w-full h-[560px] lg:h-[600px] xl:h-[645px] cursor-grab active:cursor-grabbing"
          >
            <BentoCard
              glowColor="rgba(255,255,255,0.06)"
              className="h-full border-white/5 bg-[#121212]/40 backdrop-blur-md"
            >
              <PricingCardContent
                name="Enterprise"
                price="Individuell"
                period=""
                setupFee="Einmaliges Setup nach Aufwand"
                desc="Für größere Betriebe, Gemeinschaftspraxen und anspruchsvolle Sonderwünsche."
                features={tier3Features}
                specialFeature="Alles von Growth"
                cta="Architektur anfordern"
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </motion.div>

        </div>
      </div>

      {/* 2. MOBILE RESPONSIVE STATIC GRID CONTAINER */}
      <div className="block md:hidden w-full py-20 px-6">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <h2 className="text-3xl font-heading font-bold text-white tracking-tighter leading-none">
            Transparente <span className="text-[#CCFF00] font-extrabold">Festpreise.</span>
          </h2>
          <p className="max-w-md text-[#A0A0B0] text-sm">
            Rundum-Sorglos-Websites ohne Überraschungen. Wir bauen, hosten und pflegen deine Traum-Website.
          </p>
        </div>

        {/* Mobile Billing Switch */}
        <div className="flex justify-center mb-10 relative z-20">
          <div className="bg-[#121212]/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-xs font-bold font-sans transition-all duration-300 relative ${billingInterval === 'monthly'
                ? "text-black"
                : "text-white/60 hover:text-white"
                }`}
            >
              {billingInterval === 'monthly' && (
                <motion.div
                  layoutId="billingToggleMobile"
                  className="absolute inset-0 bg-[#CCFF00] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Monatlich
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-xs font-bold font-sans transition-all duration-300 relative flex items-center gap-1.5 ${billingInterval === 'yearly'
                ? "text-black"
                : "text-white/60 hover:text-white"
                }`}
            >
              {billingInterval === 'yearly' && (
                <motion.div
                  layoutId="billingToggleMobile"
                  className="absolute inset-0 bg-[#CCFF00] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span>Jährlich</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-sans tracking-wide uppercase transition-all duration-300 ${billingInterval === 'yearly'
                ? "bg-black/10 text-black font-extrabold"
                : "bg-primary/20 text-[#CCFF00] font-extrabold"
                }`}>
                -5 %
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 max-w-sm mx-auto">
          {/* Card 1 */}
          <div className="w-full h-auto">
            <BentoCard
              glowColor="rgba(255,255,255,0.06)"
              className="h-full border-white/5 bg-[#121212]/40"
            >
              <PricingCardContent
                name="Essential"
                price={billingInterval === 'monthly' ? "75 €" : "71.25 €"}
                period="/ Monat"
                setupFee={billingInterval === 'monthly' ? "zzgl. 249,99 € Setup-Gebühr" : "zzgl. 249,99 € Setup-Gebühr (bei jährlicher Zahlung)"}
                desc="Der perfekte Einstieg für dein lokales Geschäft, deine Praxis oder dein Restaurant."
                features={tier1Features}
                cta="Essential starten"
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </div>

          {/* Card 2 */}
          <div className="w-full h-auto transform scale-102 border-[#CCFF00]/20 rounded-3xl overflow-hidden shadow-[0_0_50px_-15px_rgba(204,255,0,0.15)]">
            <BentoCard
              glowColor="rgba(204,255,0,0.2)"
              className="h-full border-[#CCFF00]/30 bg-[#121212]/80"
            >
              <PricingCardContent
                name="Growth"
                price={billingInterval === 'monthly' ? "95 €" : "90,25 €"}
                period="/ Monat"
                setupFee={billingInterval === 'monthly' ? "zzgl. 329,99 € Setup-Gebühr" : "zzgl. 329,99 € Setup-Gebühr (bei jährlicher Zahlung)"}
                desc="Für Betriebe, die online professionell Kunden & Patienten gewinnen wollen."
                features={tier2Features}
                specialFeature="Alles von Essential"
                cta="Wachstum einleiten"
                isPopular={true}
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </div>

          {/* Card 3 */}
          <div className="w-full h-auto">
            <BentoCard
              glowColor="rgba(255,255,255,0.06)"
              className="h-full border-white/5 bg-[#121212]/40"
            >
              <PricingCardContent
                name="Enterprise"
                price="Individuell"
                period=""
                setupFee="Einmaliges Setup nach Aufwand"
                desc="Für größere Betriebe, Gemeinschaftspraxen und anspruchsvolle Sonderwünsche."
                features={tier3Features}
                specialFeature="Alles von Growth"
                cta="Architektur anfordern"
                onCtaClick={handleCtaClick}
              />
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
