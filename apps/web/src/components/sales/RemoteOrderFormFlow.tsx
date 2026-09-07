"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/components/ui/primitives";
import {
  CheckCircle2,
  FileText,
  User,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Lock,
  Edit3,
  Building2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { validateIBAN } from "@/lib/utils";
import { PRICING_CONFIG } from "@/config/pricing";

const formSchema = z.object({
  firma: z.string().min(2, "Firma ist erforderlich"),
  rechtsform: z.string().min(1, "Rechtsform ist erforderlich"),
  ansprechpartner: z.string().min(2, "Ansprechpartner ist erforderlich"),
  strasse: z.string().min(2, "Straße & Hausnummer ist erforderlich"),
  plz: z.string().min(4, "Ungültige PLZ"),
  ort: z.string().min(2, "Ort ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  telefon: z.string().optional(),
  ustId: z.string().optional(),

  iban: z.string().refine((val) => validateIBAN(val), {
    message: "Ungültige IBAN. Bitte überprüfe das Format und die Prüfziffer.",
  }),
  bic: z.string().optional(),
  bank: z.string().optional(),
  kontoinhaber: z.string().optional(),
  consentSepa: z.boolean().refine((v) => v === true, "Erteilung des SEPA-Lastschriftmandats ist erforderlich"),

  consentB2b: z.boolean().refine((v) => v === true, "B2B-Bestätigung ist erforderlich"),
  consentAgb: z.boolean().refine((v) => v === true, "AGB-Zustimmung ist erforderlich"),
  consentAvv: z.boolean().refine((v) => v === true, "AVV-Zustimmung ist erforderlich"),
  consentDatenschutz: z.boolean().refine((v) => v === true, "Datenschutz-Kenntnisnahme ist erforderlich"),
  consentMarketing: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export interface RemoteInviteData {
  token: string;
  tarif: string;
  zahlungsrhythmus: string;
  setupPreisBrutto: number;
  laufendPreisBrutto: number;
  customerEmail: string;
  customerName?: string | null;
  companyName?: string | null;
  rechtsform?: string | null;
  strasse?: string | null;
  plz?: string | null;
  ort?: string | null;
  telefon?: string | null;
  ustId?: string | null;
  iban?: string | null;
  bic?: string | null;
  bank?: string | null;
  kontoinhaber?: string | null;
  leistungsbeschreibung?: string | null;
  mindestlaufzeitMonate?: number | null;
  stundensatz?: number | null;
  werbebudgetRichtwert?: number | null;
  salesUserId: string;
  customerUserId?: string | null;
  expiresAt: string;
}

interface RemoteOrderFormFlowProps {
  invite: RemoteInviteData;
  termsContent: string;
  avvContent: string;
  sepaContent: string;
  overrideTarif?: string;
  overrideZahlungsrhythmus?: string;
  onBackToOverview?: () => void;
}

function SparkleCelebration() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ["#CCFF00", "#FFFFFF", "#A0A0B0", "#1C1C1C"];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: 50,
      y: 40,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.4,
      duration: Math.random() * 2 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)] || "#CCFF00",
      angle: Math.random() * 360,
      velocity: Math.random() * 140 + 60,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-transparent to-emerald-950/5">
      <style>{`
        @keyframes particleBurst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
        .animate-burst-particle {
          animation-name: particleBurst;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
      `}</style>
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.velocity;
        const ty = Math.sin(rad) * p.velocity;

        return (
          <span
            key={p.id}
            className="absolute rounded-full animate-burst-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--tx": `${tx}px`,
              "--ty": `${ty}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

export function RemoteOrderFormFlow({
  invite,
  termsContent,
  avvContent,
  sepaContent,
  overrideTarif,
  overrideZahlungsrhythmus,
  onBackToOverview,
}: RemoteOrderFormFlowProps) {
  const hasCorePrefill = Boolean(
    invite.companyName &&
    invite.customerName &&
    invite.strasse &&
    invite.plz &&
    invite.ort &&
    invite.customerEmail
  );

  const [viewMode, setViewMode] = useState<"express" | "step_by_step">(
    hasCorePrefill ? "express" : "step_by_step"
  );
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Edit toggles
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [agbRead, setAgbRead] = useState(false);
  const [avvRead, setAvvRead] = useState(false);

  const isMarketing = invite.tarif === "marketing";

  const getEffectivePrices = () => {
    // marketing prices are individual; never look them up in PRICING_CONFIG
    if (!isMarketing && overrideTarif && overrideZahlungsrhythmus) {
      const selectedPlan =
        PRICING_CONFIG.plans[overrideTarif as keyof typeof PRICING_CONFIG.plans];
      if (selectedPlan) {
        return {
          setupPreis: selectedPlan.setupFee,
          laufendPreis:
            overrideZahlungsrhythmus === "monatlich"
              ? selectedPlan.priceMonthly
              : selectedPlan.priceYearly,
        };
      }
    }
    return {
      setupPreis: invite.setupPreisBrutto,
      laufendPreis: invite.laufendPreisBrutto,
    };
  };

  const { setupPreis, laufendPreis } = getEffectivePrices();
  const currentTarif = isMarketing ? "Marketing" : overrideTarif || invite.tarif;
  const agbTeile = isMarketing ? "(Teil A und Teil C)" : "(Teil A und Teil B)";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, success, viewMode]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firma: invite.companyName || "",
      rechtsform: invite.rechtsform || "",
      ansprechpartner: invite.customerName || "",
      strasse: invite.strasse || "",
      plz: invite.plz || "",
      ort: invite.ort || "",
      email: invite.customerEmail || "",
      telefon: invite.telefon || "",
      ustId: invite.ustId || "",
      iban: invite.iban || "",
      bic: invite.bic || "",
      bank: invite.bank || "",
      kontoinhaber: invite.kontoinhaber || invite.customerName || "",
      consentSepa: false,
      consentB2b: false,
      consentAgb: false,
      consentAvv: false,
      consentDatenschutz: true,
      consentMarketing: false,
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAcceptAllConsents = () => {
    setValue("consentB2b", true, { shouldValidate: true });
    setValue("consentAgb", true, { shouldValidate: true });
    setValue("consentAvv", true, { shouldValidate: true });
    setValue("consentSepa", true, { shouldValidate: true });
    setValue("consentDatenschutz", true, { shouldValidate: true });
    setAgbRead(true);
    setAvvRead(true);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = [
        "firma",
        "rechtsform",
        "ansprechpartner",
        "strasse",
        "plz",
        "ort",
        "email",
      ];
    } else if (step === 4) {
      fieldsToValidate = ["iban", "consentSepa"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setStep((s) => s + 1);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/v1/contracts/sign-remote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: invite.token,
          ...data,
          iban: data.iban.replace(/\s/g, ""),
          signatureSepaB64: "DIGITAL_SEPA_CONSENT",
          signatureContractB64: "DIGITAL_EES_CONSENT",
          overrideTarif,
          overrideZahlungsrhythmus,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        try {
          const json = await res.json();
          alert(json.error || "Ein Fehler ist bei der Übermittlung aufgetreten.");
        } catch {
          alert("Ein Fehler ist aufgetreten. Bitte prüfe Deine Internetverbindung.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Netzwerkfehler.");
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="w-full text-center py-16 relative overflow-hidden bg-[#0D0D0E] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500 p-8">
        <SparkleCelebration />

        <div className="relative z-10 space-y-6">
          <div className="relative flex justify-center items-center py-2">
            <div className="w-20 h-20 rounded-full bg-[#CCFF00]/10 border-2 border-[#CCFF00] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#CCFF00]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Vielen Dank!
          </h1>

          <p className="text-base sm:text-lg font-sans text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Dein Vertrag wurde erfolgreich abgeschlossen. Wir freuen uns auf die Zusammenarbeit mit{" "}
            <span className="text-[#CCFF00] font-bold">{watch("firma")}</span>.
          </p>

          <div className="bg-[#141416] border border-white/10 p-5 rounded-xl text-xs text-neutral-400 max-w-md mx-auto">
            Die Vertragsdokumente inkl. SEPA-Mandat wurden an{" "}
            <span className="font-semibold text-white">{watch("email")}</span> gesendet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {onBackToOverview && (
        <button
          type="button"
          onClick={onBackToOverview}
          className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer group mb-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Zurück zur Übersicht</span>
        </button>
      )}

      {/* 1. Top Tariff & Price Summary (Minimalistic & High-Contrast) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D0D0E] border border-white/10 shadow-lg">
        <div>
          <span className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight capitalize">
            {currentTarif}-Tarif
          </span>
        </div>

        <div className="flex items-baseline gap-4 sm:gap-6">
          <div>
            <span className="font-heading font-extrabold text-2xl sm:text-3xl text-[#CCFF00] tracking-tight">
              {formatPrice(laufendPreis)}
            </span>
            <span className="text-xs font-sans text-neutral-400 ml-1.5">
              {isMarketing ? "/ Monat (Monatliche Pauschale)" : "/ Monat"}
            </span>
          </div>

          <div>
            <span className="font-heading font-bold text-lg sm:text-xl text-neutral-300 tracking-tight">
              {formatPrice(setupPreis)}
            </span>
            <span className="text-xs font-sans text-neutral-400 ml-1.5">
              {isMarketing ? "Onboarding-Gebühr (einmalig)" : "einmalig"}
            </span>
          </div>
        </div>
      </div>

      {/* Marketing: Leistungsschein (shown in express and step-by-step mode) */}
      {isMarketing && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0D0E] border border-white/10 shadow-lg space-y-3 text-xs font-sans">
          <span className="font-bold text-[#CCFF00] uppercase tracking-wider block">Leistungsschein</span>
          {invite.leistungsbeschreibung && (
            <div className="text-neutral-200 whitespace-pre-line leading-relaxed border-b border-white/5 pb-3">
              {invite.leistungsbeschreibung}
            </div>
          )}
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-neutral-400">Mindestlaufzeit:</span>
            <span className="font-semibold text-white text-right">
              {invite.mindestlaufzeitMonate ?? 6} Monate ab Kick-off, danach unbestimmte Laufzeit mit 1 Monat Frist zum Monatsende (§ 28 AGB Teil C)
            </span>
          </div>
          <div className={`flex justify-between ${invite.werbebudgetRichtwert != null ? "border-b border-white/5 pb-2" : ""}`}>
            <span className="text-neutral-400">Stundensatz für Mehrleistungen:</span>
            <span className="font-semibold text-white">{formatPrice(invite.stundensatz ?? 95)} / Std. netto</span>
          </div>
          {invite.werbebudgetRichtwert != null && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Werbebudget-Richtwert:</span>
                <span className="font-semibold text-white">{formatPrice(invite.werbebudgetRichtwert)} / Monat netto</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Das Werbebudget ist nicht Teil der Vergütung; Werbekonten laufen auf den Kunden, der das Budget direkt an die Plattform zahlt (§ 22 AGB Teil C).
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1-KLICK EXPRESS MODE */}
      {/* ========================================================================= */}
      {viewMode === "express" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-300">
          <div className="w-full rounded-2xl border border-white/10 bg-[#0D0D0E] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header: Clear Title & Subtext */}
            <div className="border-b border-white/10 pb-5">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                Angaben prüfen
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-sans">
                Bitte kontrolliere deine Daten und schließe die Bestellung direkt ab.
              </p>
            </div>

            {/* Bento Grid: High-Contrast Data Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Company & Contact Card */}
              <div className="bg-[#141416] border border-white/10 rounded-xl p-5 space-y-3 shadow-sm hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider font-sans">
                    <Building2 className="w-4 h-4" />
                    <span>Unternehmensdaten</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingCompany(!isEditingCompany)}
                    className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingCompany ? "Fertig" : "Bearbeiten"}</span>
                  </button>
                </div>

                {isEditingCompany ? (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <Label className="text-xs text-neutral-300">Firma</Label>
                      <Input
                        {...register("firma")}
                        placeholder="Muster GmbH"
                        error={errors.firma?.message}
                        className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-300">Rechtsform</Label>
                        <select
                          {...register("rechtsform")}
                          className="flex h-10 w-full rounded-lg border border-white/15 bg-[#1A1A1E] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                        >
                          <option value="">Bitte wählen...</option>
                          <option value="GmbH">GmbH</option>
                          <option value="GbR">GbR</option>
                          <option value="GmbH & Co. KG">GmbH & Co. KG</option>
                          <option value="Einzelunternehmen">Einzelunternehmen</option>
                          <option value="UG (haftungsbeschränkt)">UG (haftungsbeschränkt)</option>
                          <option value="AG">AG</option>
                          <option value="e.K.">e.K.</option>
                          <option value="Andere">Andere / Sonstige</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-neutral-300">USt-IdNr.</Label>
                        <Input
                          {...register("ustId")}
                          placeholder="DE123456789"
                          className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-neutral-300">Ansprechpartner</Label>
                      <Input
                        {...register("ansprechpartner")}
                        placeholder="Max Mustermann"
                        error={errors.ansprechpartner?.message}
                        className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-neutral-300">E-Mail</Label>
                      <Input
                        type="email"
                        {...register("email")}
                        placeholder="name@firma.de"
                        error={errors.email?.message}
                        className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-neutral-300">Telefon</Label>
                      <Input
                        {...register("telefon")}
                        placeholder="+49 170 1234567"
                        className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs font-sans pt-1">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">Firma:</span>
                      <span className="font-semibold text-white">{watch("firma") || "–"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">Rechtsform:</span>
                      <span className="font-semibold text-white">{watch("rechtsform") || "–"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">Ansprechpartner:</span>
                      <span className="font-semibold text-white">{watch("ansprechpartner") || "–"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">E-Mail:</span>
                      <span className="font-semibold text-white">{watch("email") || "–"}</span>
                    </div>
                    {watch("telefon") && (
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-neutral-400">Telefon:</span>
                        <span className="font-semibold text-white">{watch("telefon")}</span>
                      </div>
                    )}
                    {watch("ustId") && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">USt-IdNr.:</span>
                        <span className="font-semibold text-white">{watch("ustId")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Address Card */}
              <div className="bg-[#141416] border border-white/10 rounded-xl p-5 space-y-3 shadow-sm hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider font-sans">
                    <MapPin className="w-4 h-4" />
                    <span>Rechnungsadresse</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingAddress ? "Fertig" : "Bearbeiten"}</span>
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <Label className="text-xs text-neutral-300">Straße & Hausnummer</Label>
                      <Input
                        {...register("strasse")}
                        placeholder="Musterstraße 12"
                        error={errors.strasse?.message}
                        className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1 col-span-1">
                        <Label className="text-xs text-neutral-300">PLZ</Label>
                        <Input
                          {...register("plz")}
                          placeholder="80331"
                          error={errors.plz?.message}
                          className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs text-neutral-300">Ort</Label>
                        <Input
                          {...register("ort")}
                          placeholder="München"
                          error={errors.ort?.message}
                          className="bg-[#1A1A1E] border-white/15 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs font-sans pt-1">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">Straße & Nr.:</span>
                      <span className="font-semibold text-white">{watch("strasse") || "–"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-neutral-400">PLZ & Ort:</span>
                      <span className="font-semibold text-white">
                        {watch("plz")} {watch("ort")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Land:</span>
                      <span className="font-semibold text-white">Deutschland</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Payment / SEPA Card */}
              <div className="md:col-span-2 bg-[#141416] border border-white/10 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider font-sans">
                    <CreditCard className="w-4 h-4" />
                    <span>Zahlungsdaten & SEPA-Mandat</span>
                  </div>
                  <a
                    href="/de/sepa-mandat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#CCFF00] hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
                  >
                    <span>Mandatstext ansehen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Label required className="text-xs text-neutral-300">
                      IBAN für den Lastschrifteinzug
                    </Label>
                    <Input
                      {...register("iban", {
                        onChange: (e) => {
                          const raw = e.target.value.toUpperCase().replace(/\s/g, "");
                          e.target.value = raw.replace(/(.{4})/g, "$1 ").trim();
                        },
                      })}
                      placeholder="DE12 3456 7890 1234 5678 90"
                      error={errors.iban?.message}
                      className="font-mono text-sm bg-[#1A1A1E] border-white/15 text-white focus:border-[#CCFF00]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-neutral-300">Kontoinhaber</Label>
                    <Input
                      {...register("kontoinhaber")}
                      placeholder={watch("firma") || watch("ansprechpartner") || "Name des Kontoinhabers"}
                      className="text-xs bg-[#1A1A1E] border-white/15 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Documents Overview */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div>
                <span className="font-semibold text-xs text-neutral-400 uppercase tracking-wider font-sans">
                  Vertragsdokumente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* AGB Card */}
                <div className="border border-white/10 rounded-xl bg-[#141416] p-4 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#CCFF00] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Allgemeine Geschäftsbedingungen (AGB)</div>
                      <div className="text-[11px] text-neutral-400">Rechtliche Vertragsgrundlage</div>
                    </div>
                  </div>
                  <a
                    href="/de/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    <span>Öffnen</span>
                    <ExternalLink className="w-3 h-3 text-[#CCFF00]" />
                  </a>
                </div>

                {/* AVV Card */}
                <div className="border border-white/10 rounded-xl bg-[#141416] p-4 flex items-center justify-between hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#CCFF00] shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">Auftragsverarbeitung (AVV)</div>
                      <div className="text-[11px] text-neutral-400">DSGVO-Datenschutzvereinbarung</div>
                    </div>
                  </div>
                  <a
                    href="/de/avv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-colors"
                  >
                    <span>Öffnen</span>
                    <ExternalLink className="w-3 h-3 text-[#CCFF00]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Mandatory Consents */}
            <div className="space-y-2.5 pt-1">
              {/* 1. B2B */}
              <div
                onClick={() => setValue("consentB2b", !watch("consentB2b"), { shouldValidate: true })}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentB2b")
                  ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                  : "border-white/10 bg-[#141416] hover:border-white/20"
                  }`}
              >
                <input
                  type="checkbox"
                  {...register("consentB2b")}
                  checked={watch("consentB2b")}
                  readOnly
                  className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                />
                <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                  <span>Ich bestätige, dass ich ausschließlich als Unternehmer / Gewerbetreibender (B2B) handle. *</span>
                  {errors.consentB2b && <p className="text-xs text-red-400 mt-1">{errors.consentB2b.message}</p>}
                </div>
              </div>

              {/* 2. AGB & AVV */}
              <div
                onClick={() => {
                  const nextVal = !(watch("consentAgb") && watch("consentAvv"));
                  setValue("consentAgb", nextVal, { shouldValidate: true });
                  setValue("consentAvv", nextVal, { shouldValidate: true });
                }}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentAgb") && watch("consentAvv")
                  ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                  : "border-white/10 bg-[#141416] hover:border-white/20"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={watch("consentAgb") && watch("consentAvv")}
                  readOnly
                  className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                />
                <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                  <span>
                    Ich habe die{" "}
                    <a
                      href="/de/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#CCFF00] underline underline-offset-2 hover:text-[#b8e600] font-semibold"
                    >
                      AGB
                    </a>{" "}
                    {agbTeile} und den{" "}
                    <a
                      href="/de/avv"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#CCFF00] underline underline-offset-2 hover:text-[#b8e600] font-semibold"
                    >
                      Auftragsverarbeitungsvertrag (AVV)
                    </a>{" "}
                    gelesen und akzeptiere diese. *
                  </span>
                  {(errors.consentAgb || errors.consentAvv) && (
                    <p className="text-xs text-red-400 mt-1">Zustimmung zu AGB & AVV ist erforderlich.</p>
                  )}
                </div>
              </div>

              {/* 3. SEPA Mandate */}
              <div
                onClick={() => setValue("consentSepa", !watch("consentSepa"), { shouldValidate: true })}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentSepa")
                  ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                  : "border-white/10 bg-[#141416] hover:border-white/20"
                  }`}
              >
                <input
                  type="checkbox"
                  {...register("consentSepa")}
                  checked={watch("consentSepa")}
                  readOnly
                  className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                />
                <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                  <span>
                    Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen, und weise mein Kreditinstitut an, die gezogenen Lastschriften einzulösen (
                    <a
                      href="/de/sepa-mandat"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#CCFF00] underline underline-offset-2 hover:text-[#b8e600] font-semibold"
                    >
                      Details zum SEPA-Mandat
                    </a>
                    ). *
                  </span>
                  {errors.consentSepa && <p className="text-xs text-red-400 mt-1">{errors.consentSepa.message}</p>}
                </div>
              </div>
            </div>

            {/* High-Converting 1-Click Order Button */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-heading font-bold text-base tracking-wide transition-all shadow-[0_0_25px_rgba(204,255,0,0.25)] hover:shadow-[0_0_35px_rgba(204,255,0,0.4)] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? "Vertrag wird abgeschlossen..." : "Kostenpflichtig bestellen"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-neutral-500 text-center">
                Alle Unterlagen erhältst Du sofort per E-Mail als PDF.
              </p>
            </div>
          </div>

          {/* Moved switch to Schritt-für-Schritt to the bottom */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setViewMode("step_by_step")}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
            >
              Zu den Einzelschritten wechseln →
            </button>
          </div>
        </form>
      ) : (
        /* ========================================================================= */
        /* STEP-BY-STEP WIZARD MODE */
        /* ========================================================================= */
        <div className="w-full rounded-2xl border border-white/10 bg-[#0D0D0E] p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-white/10 pb-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold font-heading text-white tracking-tight">
                  Schritt {step} von 6
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {step === 1 && "Bitte trage Deine Firmendaten ein."}
                  {step === 2 && "Bitte lies und bestätige die AGB."}
                  {step === 3 && "Bitte lies und bestätige den AVV."}
                  {step === 4 && "Bitte erteile das SEPA-Lastschriftmandat."}
                  {step === 5 && "Bitte prüfe Deine Angaben auf Richtigkeit."}
                  {step === 6 && "Bitte bestätige Deine Zustimmung und schließe die Bestellung ab."}
                </p>
              </div>
              {hasCorePrefill && (
                <button
                  type="button"
                  className="text-xs font-medium text-[#CCFF00] hover:underline cursor-pointer"
                  onClick={() => setViewMode("express")}
                >
                  Zur 1-Klick Übersicht →
                </button>
              )}
            </div>

            <div className="flex items-center w-full gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10"
                >
                  <div
                    className={`h-full transition-all duration-300 ${step >= s ? "bg-[#CCFF00]" : "bg-transparent"
                      }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* STEP 1: Customer Data */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>1. Deine Unternehmensdaten</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label required className="text-xs text-neutral-300">Firma / Unternehmensname</Label>
                    <Input {...register("firma")} placeholder="Muster GmbH" error={errors.firma?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label required className="text-xs text-neutral-300">Rechtsform</Label>
                    <select
                      {...register("rechtsform")}
                      className="flex h-10 w-full rounded-lg border border-white/15 bg-[#1A1A1E] px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00]"
                    >
                      <option value="" disabled>Bitte wählen...</option>
                      <option value="GmbH">GmbH</option>
                      <option value="GbR">GbR</option>
                      <option value="GmbH & Co. KG">GmbH & Co. KG</option>
                      <option value="Einzelunternehmen">Einzelunternehmen</option>
                      <option value="UG (haftungsbeschränkt)">UG (haftungsbeschränkt)</option>
                      <option value="AG">AG</option>
                      <option value="e.K.">e.K.</option>
                      <option value="Andere">Andere / Sonstige</option>
                    </select>
                    {errors.rechtsform && <p className="mt-1 text-xs text-red-400">{errors.rechtsform.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label required className="text-xs text-neutral-300">Ansprechpartner (Vor- & Nachname)</Label>
                  <Input {...register("ansprechpartner")} placeholder="Max Mustermann" error={errors.ansprechpartner?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                </div>

                <div className="space-y-1.5">
                  <Label required className="text-xs text-neutral-300">Straße & Hausnummer</Label>
                  <Input {...register("strasse")} placeholder="Hauptstraße 12" error={errors.strasse?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label required className="text-xs text-neutral-300">PLZ</Label>
                    <Input {...register("plz")} placeholder="12345" error={errors.plz?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label required className="text-xs text-neutral-300">Ort</Label>
                    <Input {...register("ort")} placeholder="Musterstadt" error={errors.ort?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label required className="text-xs text-neutral-300">E-Mail-Adresse</Label>
                    <Input type="email" {...register("email")} placeholder="name@firma.de" error={errors.email?.message} className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-neutral-300">Telefonnummer (Optional)</Label>
                    <Input {...register("telefon")} placeholder="+49 170 1234567" className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-neutral-300">USt-IdNr. (Optional)</Label>
                  <Input {...register("ustId")} placeholder="DE123456789" className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <Button type="button" size="lg" className="w-full sm:w-auto px-8 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-xs" onClick={nextStep}>
                    Weiter zu den AGB
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: AGB */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>2. Allgemeine Geschäftsbedingungen (AGB)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Die AGB bilden die rechtliche Grundlage unserer Zusammenarbeit.
                </p>

                <div className="border border-white/10 rounded-xl bg-[#141416] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white">Allgemeine Geschäftsbedingungen</h3>
                      <p className="text-xs text-neutral-400">Felix Kinze & Leon Trepesch GbR (Buff Interactive)</p>
                    </div>
                    <a
                      href="/de/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <span>AGB in neuem Tab öffnen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div
                    onClick={() => {
                      const next = !watch("consentAgb");
                      setValue("consentAgb", next, { shouldValidate: true });
                      setAgbRead(next);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentAgb")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#1A1A1E] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={watch("consentAgb")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>Ich habe die AGB {agbTeile} gelesen und erkläre mich damit einverstanden. *</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="text-neutral-400 hover:text-white text-xs">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <Button type="button" size="sm" onClick={nextStep} disabled={!watch("consentAgb")} className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-xs">
                    Weiter zum AVV
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: AVV */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>3. Vertrag zur Auftragsverarbeitung (AVV)</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Der AVV regelt den datenschutzkonformen Umgang mit personenbezogenen Daten gemäß Art. 28 DSGVO.
                </p>

                <div className="border border-white/10 rounded-xl bg-[#141416] p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div>
                      <h3 className="text-sm font-bold text-white">Auftragsverarbeitungsvertrag (AVV)</h3>
                      <p className="text-xs text-neutral-400">Gemäß Art. 28 Abs. 3 Datenschutz-Grundverordnung (DSGVO)</p>
                    </div>
                    <a
                      href="/de/avv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#CCFF00]/10 hover:bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 font-semibold text-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <span>AVV in neuem Tab öffnen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div
                    onClick={() => {
                      const next = !watch("consentAvv");
                      setValue("consentAvv", next, { shouldValidate: true });
                      setAvvRead(next);
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentAvv")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#1A1A1E] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={watch("consentAvv")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>Ich habe den AVV zur Kenntnis genommen und schließe diesen hiermit ab. *</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(2)} className="text-neutral-400 hover:text-white text-xs">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <Button type="button" size="sm" onClick={nextStep} disabled={!watch("consentAvv")} className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-xs">
                    Weiter zum SEPA-Mandat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SEPA */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>4. SEPA-Lastschriftmandat</span>
                </div>

                <div className="bg-[#141416] border border-white/10 p-5 rounded-xl text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="font-mono font-bold text-[#CCFF00]">Gläubiger-ID: DE15WEB00002924152</p>
                    <a
                      href="/de/sepa-mandat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CCFF00] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Vollständigen Mandatstext ansehen</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die gezogenen Lastschriften einzulösen.
                  </p>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-300">Kontoinhaber (falls abweichend)</Label>
                      <Input {...register("kontoinhaber")} placeholder="Max Mustermann" className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-300">Kreditinstitut / Bank (Optional)</Label>
                      <Input {...register("bank")} placeholder="Musterbank" className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label required className="text-xs text-neutral-300">IBAN</Label>
                      <Input
                        {...register("iban", {
                          onChange: (e) => {
                            const raw = e.target.value.toUpperCase().replace(/\s/g, "");
                            e.target.value = raw.replace(/(.{4})/g, "$1 ").trim();
                          },
                        })}
                        placeholder="DE12 3456 7890 ..."
                        error={errors.iban?.message}
                        className="font-mono text-sm bg-[#1A1A1E] border-white/15 text-white"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-1">
                      <Label className="text-xs text-neutral-300">BIC (Optional)</Label>
                      <Input {...register("bic")} placeholder="GENODEM1MUB" className="bg-[#1A1A1E] border-white/15 text-white text-xs" />
                    </div>
                  </div>

                  <div
                    onClick={() => setValue("consentSepa", !watch("consentSepa"), { shouldValidate: true })}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer mt-4 ${watch("consentSepa")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#141416] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      {...register("consentSepa")}
                      checked={watch("consentSepa")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. *</span>
                      {errors.consentSepa && <p className="text-xs text-red-400 mt-1">{errors.consentSepa.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(3)} className="text-neutral-400 hover:text-white text-xs">
                    ← Zurück
                  </Button>
                  <Button type="button" size="sm" onClick={nextStep} disabled={!watch("consentSepa")} className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-xs">
                    Weiter zur Zusammenfassung
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Summary */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>5. Zusammenfassung & Prüfung</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-white/10 rounded-xl p-5 bg-[#141416] space-y-3">
                    <span className="font-bold text-[#CCFF00] text-xs uppercase tracking-wider block">Tarif & Konditionen</span>
                    <div className="space-y-2 text-xs font-sans">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-neutral-400">Tarif:</span>
                        <span className="font-semibold text-white capitalize">{currentTarif}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-neutral-400">{isMarketing ? "Onboarding-Gebühr:" : "Einmalgebühr:"}</span>
                        <span className="font-semibold text-white">{formatPrice(setupPreis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">{isMarketing ? "Monatliche Pauschale:" : "Laufende Gebühr:"}</span>
                        <span className="font-semibold text-[#CCFF00]">{formatPrice(laufendPreis)} / Monat</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-white/10 rounded-xl p-5 bg-[#141416] space-y-3">
                    <span className="font-bold text-[#CCFF00] text-xs uppercase tracking-wider block">Firmendaten</span>
                    <div className="space-y-2 text-xs font-sans">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-neutral-400">Firma:</span>
                        <span className="font-semibold text-white">{watch("firma")}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-neutral-400">Rechtsform:</span>
                        <span className="font-semibold text-white">{watch("rechtsform")}</span>
                      </div>
                      {watch("ustId") && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">USt-IdNr.:</span>
                          <span className="font-semibold text-white">{watch("ustId")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(4)} className="text-neutral-400 hover:text-white text-xs">
                    ← Zurück
                  </Button>
                  <Button type="button" size="sm" onClick={nextStep} className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-semibold text-xs">
                    Angaben prüfen & Weiter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 6: Final Abschluss */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-[#CCFF00] font-bold text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>6. Rechtsverbindlicher Vertragsabschluss</span>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setValue("consentB2b", !watch("consentB2b"), { shouldValidate: true })}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentB2b")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#141416] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      {...register("consentB2b")}
                      checked={watch("consentB2b")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>Ich bestätige, dass ich ausschließlich gewerblich/selbstständig handle (B2B). *</span>
                      {errors.consentB2b && <p className="text-xs text-red-400 mt-1">{errors.consentB2b.message}</p>}
                    </div>
                  </div>

                  <div
                    onClick={() => setValue("consentAgb", !watch("consentAgb"), { shouldValidate: true })}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentAgb")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#141416] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      {...register("consentAgb")}
                      checked={watch("consentAgb")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>
                        Ich habe die{" "}
                        <a
                          href="/de/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#CCFF00] underline underline-offset-2 hover:text-[#b8e600] font-semibold"
                        >
                          AGB
                        </a>{" "}
                        {agbTeile} gelesen und erkläre mich damit einverstanden. *
                      </span>
                      {errors.consentAgb && <p className="text-xs text-red-400 mt-1">{errors.consentAgb.message}</p>}
                    </div>
                  </div>

                  <div
                    onClick={() => setValue("consentAvv", !watch("consentAvv"), { shouldValidate: true })}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${watch("consentAvv")
                      ? "border-[#CCFF00]/40 bg-[#CCFF00]/5"
                      : "border-white/10 bg-[#141416] hover:border-white/20"
                      }`}
                  >
                    <input
                      type="checkbox"
                      {...register("consentAvv")}
                      checked={watch("consentAvv")}
                      readOnly
                      className="mt-0.5 h-4 w-4 rounded border-neutral-600 accent-[#CCFF00] pointer-events-none shrink-0"
                    />
                    <div className="flex-1 text-xs text-neutral-200 leading-relaxed font-normal">
                      <span>
                        Ich schließe den{" "}
                        <a
                          href="/de/avv"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#CCFF00] underline underline-offset-2 hover:text-[#b8e600] font-semibold"
                        >
                          Vertrag zur Auftragsverarbeitung (AVV)
                        </a>{" "}
                        ab. *
                      </span>
                      {errors.consentAvv && <p className="text-xs text-red-400 mt-1">{errors.consentAvv.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStep(5)} className="text-neutral-400 hover:text-white text-xs">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-bold text-sm text-black bg-[#CCFF00] hover:bg-[#b8e600] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? "Wird abgeschlossen..." : "Kostenpflichtig bestellen"}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
