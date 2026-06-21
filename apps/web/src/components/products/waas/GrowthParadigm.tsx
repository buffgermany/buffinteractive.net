"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Check, ArrowDownRight, Plus, ChevronsRight, Percent, Sliders } from "lucide-react";
import { BentoCard } from "@/components/buff/BentoCard";
import { WigglyUnderline } from "@/components/premium/organic-ui";
import { cn } from "@/lib/utils";

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
  isEnterpriseMdWide?: boolean;
}

function MagneticCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement using spring physics for a luxurious, premium weight
  const springX = useSpring(x, { stiffness: 150, damping: 25 });
  const springY = useSpring(y, { stiffness: 150, damping: 25 });

  // Translation: translate slightly with cursor (max 12px translation)
  const translateX = useTransform(springX, [-0.5, 0.5], [-12, 12]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  // Subtle 3D tilt rotation (max 7 degrees tilt)
  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Relative position from -0.5 to 0.5
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: translateX,
        y: translateY,
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      className={`relative w-full h-full ${className}`}
    >
      {/* 3D perspective wrapper to make card contents physically float on hover */}
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
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
  isEnterpriseMdWide = false,
}: PricingCardProps) {
  if (isEnterpriseMdWide) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 xl:grid-cols-1 gap-8 items-stretch text-left h-full">
        {/* Left Side: Header, Price & CTA */}
        <div className="md:col-span-5 xl:col-span-1 flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-2xl lg:text-3xl font-bold font-heading mt-1 text-white">
                {name}
              </h3>
            </div>

            <p className="text-xs lg:text-sm text-white/50 font-sans mt-3 leading-relaxed">
              {desc}
            </p>

            <div className="mt-6 flex flex-col">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-extrabold font-heading text-white text-3xl md:text-4xl tracking-tight whitespace-nowrap">
                  {price}
                </span>
              </div>
              <span className="text-[11px] lg:text-xs font-sans text-white/45 mt-1 font-medium">
                {setupFee}
              </span>
              <div className="flex items-center gap-1 text-white/35 mt-1.5 font-normal">
                <Percent className="w-3 h-3 shrink-0" />
                <span className="text-[10px] md:text-[11px] font-sans">
                  Alle Preise inkl. MwSt.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <a
              href="#contact"
              onClick={onCtaClick}
              className="w-full py-3.5 px-4 rounded-xl font-bold font-sans text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
            >
              <span>{cta}</span>
              <ArrowDownRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Vertical Divider (Only on md up to xl screens) */}
        <div className="hidden md:block xl:hidden w-[1px] bg-white/5 self-stretch" />

        {/* Right Side: Features */}
        <div className="md:col-span-6 xl:col-span-1 flex flex-col justify-center">
          {specialFeature && (
            <div className="flex items-start gap-2.5 text-xs lg:text-sm text-[#CCFF00] font-bold mb-4">
              <ChevronsRight className="w-4 h-4 shrink-0 mt-0.5 text-[#CCFF00]" strokeWidth={2.5} />
              <span className="font-sans leading-snug">{specialFeature}</span>
            </div>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-1 gap-x-6 gap-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs lg:text-sm text-white/70">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-white/40" strokeWidth={2.5} />
                <span className="font-sans leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between flex-grow text-left">
      <div>
        {/* Name Header */}
        <div className="flex flex-col items-start gap-1">
          <h3 className={`text-2xl lg:text-3xl font-bold font-heading mt-1 ${isPopular ? "text-[#CCFF00]" : "text-white"
            }`}>
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs lg:text-sm text-white/50 font-sans mt-3 leading-relaxed min-h-[40px]">
          {desc}
        </p>

        {/* Pricing & Setup Fee */}
        <div className="mt-6 flex flex-col">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={cn(
              "font-extrabold font-heading text-white tracking-tight whitespace-nowrap",
              price.length > 8 ? "text-xl sm:text-2xl md:text-3xl" : "text-3xl md:text-4xl"
            )}>
              {price}
            </span>
            {period && (
              <span className="text-xs md:text-sm text-white/40 font-medium whitespace-nowrap">
                {period}
              </span>
            )}
          </div>
          <span className="text-[11px] lg:text-xs font-sans text-white/45 mt-1 font-medium">
            {setupFee}
          </span>
          <div className="flex items-center gap-1 text-white/35 mt-1.5 font-normal">
            <Percent className="w-3 h-3 shrink-0" />
            <span className="text-[10px] md:text-[11px] font-sans">
              Alle Preise inkl. MwSt.
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 my-6" />

        {/* Features */}
        <ul className="space-y-3">
          {specialFeature && (
            <li className="flex items-start gap-2.5 text-xs lg:text-sm text-[#CCFF00] font-bold">
              <ChevronsRight className="w-4 h-4 shrink-0 mt-0.5 text-[#CCFF00]" strokeWidth={2.5} />
              <span className="font-sans leading-snug">{specialFeature}</span>
            </li>
          )}
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs lg:text-sm text-white/70">
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
  const [isInteractive, setIsInteractive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deckScale, setDeckScale] = useState(1);

  useEffect(() => {
    setMounted(true);
    const checkInteractive = () => {
      const isLarge = window.innerWidth >= 1280 && window.innerHeight >= 820;
      setIsInteractive(isLarge);
      if (isLarge) {
        const height = window.innerHeight;
        // Scale down content if viewport height is less than 1000px
        const scale = height < 1000 ? Math.max(0.75, height / 1000) : 1;
        setDeckScale(scale);
      }
    };
    checkInteractive();
    window.addEventListener("resize", checkInteractive);
    return () => window.removeEventListener("resize", checkInteractive);
  }, []);

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
      className={cn(
        "relative z-10 w-full bg-[#050505]",
        mounted && isInteractive ? "xl:h-[200vh]" : "h-auto"
      )}
    >
      {/* 1. DESKTOP INTERACTIVE PINNED CONTAINER */}
      {mounted && isInteractive && (
        <div className="hidden xl:flex sticky top-0 h-dvh flex-col justify-center items-center overflow-hidden py-6 px-6">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />

          {/* Scaled Content Wrapper to prevent overlapping on shorter viewports */}
          <div
            style={{
              transform: `scale(${deckScale})`,
              transformOrigin: "center",
            }}
            className="flex flex-col items-center justify-center w-full transition-transform duration-200"
          >
            <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-4 relative z-10 mb-4">
              <motion.h2
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="text-4xl md:text-6xl font-heading font-bold text-white tracking-tighter leading-tight"
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
            <div className="flex justify-center mb-6 relative z-20">
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
                <MagneticCard>
                  <BentoCard
                    glowColor="rgba(255,255,255,0.06)"
                    className="h-full border-white/5 bg-[#121212]/40 backdrop-blur-md"
                  >
                    <PricingCardContent
                      name="Essential"
                      price={billingInterval === 'monthly' ? "75 €" : "71.25 €"}
                      period="/ Monat"
                      setupFee={billingInterval === 'monthly' ? "zzgl. 359,99 € Einmalgebühr" : "zzgl. 229,99 € Einmalgebühr (bei jährlicher Zahlung)"}
                      desc="Der perfekte Einstieg für dein lokales Geschäft, deine Praxis oder dein Restaurant."
                      features={tier1Features}
                      cta="Mit Essential starten"
                      onCtaClick={handleCtaClick}
                    />
                  </BentoCard>
                </MagneticCard>
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
                <MagneticCard>
                  <BentoCard
                    glowColor="rgba(204,255,0,0.25)"
                    className="h-full border-[#CCFF00]/30 shadow-[0_0_80px_-20px_rgba(204,255,0,0.15)] bg-[#121212]/80 backdrop-blur-md"
                  >
                    <PricingCardContent
                      name="Growth"
                      price={billingInterval === 'monthly' ? "89 €" : "84,55 €"}
                      period="/ Monat"
                      setupFee={billingInterval === 'monthly' ? "zzgl. 369,99 € Einmalgebühr" : "zzgl. 369,99 € Einmalgebühr (bei jährlicher Zahlung)"}
                      desc="Für Betriebe, die online professionell Kunden & Patienten gewinnen wollen."
                      features={tier2Features}
                      specialFeature="Alles von Essential"
                      cta="Mit Growth anfangen"
                      isPopular={true}
                      onCtaClick={handleCtaClick}
                    />
                  </BentoCard>
                </MagneticCard>
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
                <MagneticCard>
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
                      cta="Angebot anfordern"
                      onCtaClick={handleCtaClick}
                    />
                  </BentoCard>
                </MagneticCard>
              </motion.div>

            </div>

            {/* Hint */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-[#121212]/40 backdrop-blur-sm text-xs text-white/50 relative z-20"
            >
              <Sliders className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>
                <strong className="text-white/80 font-semibold">Individuelle Aufteilung?</strong> Höhere monatliche Rate und geringere Einmalgebühr (oder umgekehrt) sind möglich. <a href="#contact" onClick={handleCtaClick} className="text-[#CCFF00] hover:underline font-medium">Sprich uns einfach an.</a>
              </span>
            </motion.div>
          </div>
        </div>
      )}

      {/* 2. RESPONSIVE STATIC CONTAINER (MOBILE, TABLET, PORTABLES & SSR) */}
      {(!mounted || !isInteractive) && (
        <div className="w-full py-20 px-4 sm:px-6 md:py-32 relative">
          {/* Subtle Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[600px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-4 relative z-10 mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tighter leading-tight">
              Transparente <span className="text-[#CCFF00] font-extrabold">Festpreise.</span>
            </h2>
            <p className="max-w-2xl text-[#A0A0B0] text-sm sm:text-base md:text-lg leading-relaxed">
              Rundum-Sorglos-Websites ohne Überraschungen. Wir bauen, hosten und pflegen deine Traum-Website.
            </p>
          </div>

          {/* Mobile/Tablet Billing Switch */}
          <div className="flex justify-center mb-12 relative z-20">
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
                    layoutId="billingToggleStatic"
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
                    layoutId="billingToggleStatic"
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

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-8 max-w-xl md:max-w-4xl xl:max-w-6xl items-stretch relative z-10 mx-auto">

            {/* Card 1 */}
            <div className="w-full h-auto">
              <MagneticCard>
                <BentoCard
                  glowColor="rgba(255,255,255,0.06)"
                  className="h-full border-white/5 bg-[#121212]/40"
                >
                  <PricingCardContent
                    name="Essential"
                    price={billingInterval === 'monthly' ? "75 €" : "71.25 €"}
                    period="/ Monat"
                    setupFee={billingInterval === 'monthly' ? "zzgl. 359,99 € Einmalgebühr" : "zzgl. 229,99 € Einmalgebühr (bei jährlicher Zahlung)"}
                    desc="Der perfekte Einstieg für dein lokales Geschäft, deine Praxis oder dein Restaurant."
                    features={tier1Features}
                    cta="Mit Essential starten"
                    onCtaClick={handleCtaClick}
                  />
                </BentoCard>
              </MagneticCard>
            </div>

            {/* Card 2: Growth (Highlighted/Popular Card) */}
            <div className="w-full h-auto transform xl:scale-105 relative z-20">
              <MagneticCard>
                <BentoCard
                  glowColor="rgba(204,255,0,0.2)"
                  className="h-full border-[#CCFF00]/30 bg-[#121212]/80 shadow-[0_0_50px_-15px_rgba(204,255,0,0.15)]"
                >
                  <PricingCardContent
                    name="Growth"
                    price={billingInterval === 'monthly' ? "89 €" : "84,55 €"}
                    period="/ Monat"
                    setupFee={billingInterval === 'monthly' ? "zzgl. 379,99 € Einmalgebühr" : "zzgl. 379,99 € Einmalgebühr (bei jährlicher Zahlung)"}
                    desc="Für Betriebe, die online professionell Kunden & Patienten gewinnen wollen."
                    features={tier2Features}
                    specialFeature="Alles von Essential"
                    cta="Mit Growth anfangen"
                    isPopular={true}
                    onCtaClick={handleCtaClick}
                  />
                </BentoCard>
              </MagneticCard>
            </div>

            {/* Card 3 */}
            <div className="w-full h-auto relative z-10 md:col-span-2 xl:col-span-1">
              <MagneticCard>
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
                    cta="Angebot anfordern"
                    onCtaClick={handleCtaClick}
                    isEnterpriseMdWide={true}
                  />
                </BentoCard>
              </MagneticCard>
            </div>
          </div>

          {/* Hint for mobile/static layout */}
          <div className="mt-12 flex justify-center relative z-20">
            <div className="flex items-start md:items-center gap-2.5 max-w-xl mx-auto px-5 py-3.5 rounded-2xl border border-white/5 bg-[#121212]/40 backdrop-blur-sm text-xs text-white/50 text-left md:text-center">
              <Sliders className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5 md:mt-0" />
              <p className="leading-relaxed">
                <strong className="text-white/80 font-semibold">Individuelle Aufteilung gewünscht?</strong> Dir wäre eine höhere monatliche Rate bei geringerer Einmalgebühr (oder umgekehrt) lieber? Kein Problem – wir finden die passende Balance für dich. <a href="#contact" onClick={handleCtaClick} className="text-[#CCFF00] hover:underline font-semibold inline-block md:inline whitespace-nowrap">Jetzt anfragen</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
