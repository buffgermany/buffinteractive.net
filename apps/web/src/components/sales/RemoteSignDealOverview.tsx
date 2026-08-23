"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Calendar } from "lucide-react";
import { PRICING_CONFIG } from "@/config/pricing";
import { RemoteInviteData } from "./RemoteOrderFormFlow";

interface RemoteSignDealOverviewProps {
  invite: RemoteInviteData;
  onStartSign: () => void;
}

interface HeartParticle {
  id: number;
  startX: number; // percentage of viewport width
  startY: number; // starting offset
  driftX: number;
  delay: number;
  duration: number;
  scale: number;
  maxOpacity: number;
  rotate: number;
  emoji: string;
}

function HeartWaveBackground() {
  const [mounted, setMounted] = useState(false);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Tasteful pink/red hearts
    const pinkRedHearts = ["💖", "❤️", "💕", "💗"];

    // 12 subtle hearts for a gentle, lightweight wave
    const generated: HeartParticle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      startX: 8 + (i * 7.5) + (Math.random() - 0.5) * 6, // evenly distributed across screen
      startY: 20 + Math.random() * 40, // stagger starting height in lower area
      driftX: (Math.random() - 0.5) * 60, // gentle horizontal drift
      delay: 1.2 + (i * 0.12), // staggered start between 1.2s and 2.6s
      duration: 2.8 + Math.random() * 0.6, // slow motion ~3s
      scale: 0.8 + Math.random() * 0.4,
      maxOpacity: 0.35 + Math.random() * 0.25, // subtle 0.35 - 0.60
      rotate: (Math.random() - 0.5) * 30,
      emoji: pinkRedHearts[i % pinkRedHearts.length] || "💖",
    }));

    setHearts(generated);

    // Auto cleanup after the 3-second wave completes
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5200);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
            scale: h.scale * 0.8,
            rotate: 0,
          }}
          animate={{
            opacity: [0, h.maxOpacity, h.maxOpacity * 0.7, 0],
            y: -180, // slow upward drift
            x: h.driftX, // gentle sway
            scale: [h.scale * 0.8, h.scale, h.scale * 0.95, h.scale * 0.8],
            rotate: h.rotate,
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            ease: [0.25, 0.1, 0.25, 1], // silky smooth cubic-bezier
          }}
          style={{
            position: "absolute",
            left: `${h.startX}%`,
            top: `${h.startY}%`,
            willChange: "transform, opacity",
          }}
          className="text-base sm:text-lg filter drop-shadow-[0_0_8px_rgba(244,63,94,0.35)]"
        >
          {h.emoji}
        </motion.div>
      ))}
    </div>
  );
}

export function RemoteSignDealOverview({
  invite,
  onStartSign,
}: RemoteSignDealOverviewProps) {
  const planKey = invite.tarif?.toLowerCase() || "growth";
  const planInfo =
    PRICING_CONFIG.plans[planKey as keyof typeof PRICING_CONFIG.plans] ||
    PRICING_CONFIG.plans.growth;

  const isYearly = invite.zahlungsrhythmus === "jaehrlich";
  const setupPrice = invite.setupPreisBrutto ?? planInfo.setupFee;
  const laufendPrice =
    invite.laufendPreisBrutto ??
    (isYearly ? planInfo.priceYearly : planInfo.priceMonthly);

  const formatEuro = (val: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formattedExpiry = React.useMemo(() => {
    try {
      if (!invite.expiresAt) return "In 14 Tagen";
      const date = new Date(invite.expiresAt);
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "In 14 Tagen";
    }
  }, [invite.expiresAt]);

  const customerFirstName = invite.customerName?.trim()
    ? invite.customerName.trim().split(" ")[0]
    : "";

  const recipientDisplayName =
    invite.companyName || invite.customerName || "Dein Unternehmen";

  const planDeliverables: Record<"essential" | "growth" | "enterprise", string[]> = {
    essential: [
      "Individuelles Screendesign (100% Responsive)",
      "Premium Hosting auf deutschen Servern & SSL",
      "Inhaltsänderungen inklusive (Texte/Bilder)",
      "Lokale SEO-Grundoptimierung",
      "Domain- & E-Mail-Einrichtung",
    ],
    growth: [
      "Mehrseitige Website (bis zu 5 Seiten)",
      "Unbegrenzte Inhaltsänderungen (Bilder & Texte via WhatsApp/Mail)",
      "Kompletter DSGVO-Schutz & Cookie-Consent",
      "Google Maps & Standortintegration",
      "Suchmaschinen-Optimierung (Core Web Vitals)",
      "WhatsApp- & E-Mail-Direktsupport",
      "Premium High-Speed Hosting & tägliche Backups",
    ],
    enterprise: [
      "Beliebiger Seitenumfang & Sonderfunktionen",
      "Online-Terminbuchung & Formulare",
      "Anbindung an Praxis-, Buchungs- oder Kassensysteme",
      "Persönlicher Lead-Entwickler auf Kurzwahl",
      "Höchste Sicherheits- & Performance-Standards",
      "Priorisierter Support & SLAs",
    ],
  };

  const currentFeatures: string[] =
    planKey in planDeliverables
      ? planDeliverables[planKey as keyof typeof planDeliverables]
      : planDeliverables.growth;

  return (
    <section className="relative w-full pt-10 pb-16 px-4 sm:px-6 max-w-3xl mx-auto font-sans">
      {/* 3-Second Pink/Red Heart Wave */}
      <HeartWaveBackground />

      {/* 1. Header: Syne title with highlighted name & personal subtext (Stagger 1: delay 0.1s) */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.1 }}
        className="relative z-10 mb-8 mt-16 text-left sm:text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
          Schön, dass du da bist
          {customerFirstName ? (
            <>
              , <span className="text-[#CCFF00] font-extrabold">{customerFirstName}</span>.
            </>
          ) : (
            "."
          )}
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 mt-2 font-sans max-w-xl mx-auto leading-relaxed">
          Vielen Dank für unser Gespräch – wir freuen uns sehr auf die gemeinsame Umsetzung! Hier ist dein Angebot für{" "}
          <span className="font-semibold text-white">{recipientDisplayName}</span>:
        </p>
      </motion.div>

      {/* 2. Deal Card (Stagger 2: delay 0.35s) */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.35 }}
        className="relative z-10 rounded-xl border border-white/10 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-md mt-12"
      >
        {/* Top bar: Tariff pill & Expiry date */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#CCFF00] text-black font-heading font-black text-xs uppercase tracking-wider">
              Tarif {planInfo.name}
            </span>
            {isYearly && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 text-xs font-sans font-medium">
                Jährliche Zahlung (-5%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-sans">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Gültig bis {formattedExpiry}</span>
          </div>
        </div>

        {/* Pricing columns with Syne extrabold */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-white/10">
          <div>
            <span className="text-xs text-neutral-400 block mb-1 font-sans">
              Laufende Gebühr ({isYearly ? "jährlich abgerechnet" : "monatlich"})
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              {formatEuro(laufendPrice)}
              <span className="text-xs font-normal font-sans text-neutral-400 ml-1.5 tracking-normal">
                / {isYearly ? "Monat" : "Monat"}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-1 font-sans">
              zzgl. 19% MwSt.
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-400 block mb-1 font-sans">
              Einmalige Bereitstellung
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              {formatEuro(setupPrice)}
            </div>
            <span className="text-[11px] text-neutral-500 block mt-1 font-sans">
              zzgl. 19% MwSt. • einmalig
            </span>
          </div>
        </div>

        {/* Inclusions checklist */}
        <div className="pt-6">
          <h2 className="text-sm font-semibold text-white mb-3.5 font-sans">
            Leistungsumfang:
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans">
                <Check className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* 3. Sign CTA (Stagger 3: delay 0.6s) */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 180, damping: 24, delay: 0.6 }}
        className="relative z-10 mt-16 flex flex-col items-center justify-center text-center space-y-3"
      >
        <button
          onClick={onStartSign}
          id="btn-start-signing"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-sm transition-colors cursor-pointer"
        >
          <span>Jetzt online unterzeichnen</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-neutral-500">
          Rechtsverbindlicher digitaler Abschluss in ca. 2 Minuten
        </p>
      </motion.div>
    </section>
  );
}
