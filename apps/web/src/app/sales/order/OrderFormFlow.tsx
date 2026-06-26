"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SignaturePad } from "@/components/shared/SignaturePad";
import { LegalScrollBox } from "@/components/shared/LegalScrollBox";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, FileText, User, CreditCard, PenTool, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { validateIBAN } from "@/lib/utils";

const formSchema = z.object({
  tarif: z.enum(["essential", "growth", "enterprise"]),
  zahlungsrhythmus: z.enum(["monatlich", "jaehrlich"]),
  setupPreisBrutto: z.number().min(0, "Setup-Preis muss mindestens 0 sein"),
  laufendPreisBrutto: z.number().min(0, "Laufende Gebühr muss mindestens 0 sein"),

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

  consentB2b: z.boolean().refine(v => v === true, "B2B-Bestätigung ist erforderlich"),
  consentAgb: z.boolean().refine(v => v === true, "AGB-Zustimmung ist erforderlich"),
  consentAvv: z.boolean().refine(v => v === true, "AVV-Zustimmung ist erforderlich"),
  consentMarketing: z.boolean(),

  signatureSepaB64: z.string().min(10, "SEPA-Unterschrift ist erforderlich"),
  signatureContractB64: z.string().min(10, "Vertragsunterschrift ist erforderlich"),
});

type FormValues = z.infer<typeof formSchema>;

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  angle: number;
  velocity: number;
}

function SparkleCelebration() {
  const [particles, setParticles] = useState<SparkleParticle[]>([]);

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
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0.2);
            opacity: 0;
          }
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

interface HeartParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  swayDistance: number;
  swayDuration: number;
}

function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    // Smooth, slow, elegant floating
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5, // 5% to 95%
      size: Math.random() * 24 + 16, // 16 to 40
      delay: Math.random() * 4, // staggered start
      duration: Math.random() * 6 + 6, // 6s to 12s float up
      opacity: Math.random() * 0.4 + 0.3, // 0.3 to 0.7 opacity
      swayDistance: (Math.random() * 40 + 20) * (Math.random() > 0.5 ? 1 : -1), // -60 to 60px sway
      swayDuration: Math.random() * 3 + 4, // 4s to 7s sway cycle
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes floatUp {
          0% { top: 110%; opacity: 0; }
          10% { opacity: var(--max-opacity); }
          80% { opacity: var(--max-opacity); }
          100% { top: -20%; opacity: 0; }
        }
        @keyframes sway {
          0%, 100% { transform: translateX(0) rotate(-5deg); }
          50% { transform: translateX(var(--sway)) rotate(5deg); }
        }
        .animate-float-heart {
          animation: floatUp var(--duration) linear infinite,
                     sway var(--sway-duration) ease-in-out infinite alternate;
          animation-delay: var(--delay), 0s;
        }
      `}</style>
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-float-heart text-red-500 drop-shadow-lg"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            '--delay': `${h.delay}s`,
            '--duration': `${h.duration}s`,
            '--max-opacity': h.opacity,
            '--sway': `${h.swayDistance}px`,
            '--sway-duration': `${h.swayDuration}s`,
            opacity: 0,
          } as React.CSSProperties}
        >
          <Heart className="w-full h-full fill-red-500/50 stroke-[1.5]" />
        </div>
      ))}
    </div>
  );
}

export function OrderFormFlow({ termsContent, avvContent, sepaContent, salesUserId }: { termsContent: string, avvContent: string, sepaContent: string, salesUserId: string }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [agbRead, setAgbRead] = useState(false);
  const [avvRead, setAvvRead] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, success]);

  const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tarif: "growth",
      zahlungsrhythmus: "monatlich",
      setupPreisBrutto: 379.99,
      laufendPreisBrutto: 89.00,
      firma: "",
      rechtsform: "",
      ansprechpartner: "",
      strasse: "",
      plz: "",
      ort: "",
      email: "",
      iban: "",
      signatureSepaB64: "",
      signatureContractB64: "",
      consentB2b: false,
      consentAgb: false,
      consentAvv: false,
      consentMarketing: false,
    }
  });

  const currentTarif = watch("tarif");
  const currentZahlungsrhythmus = watch("zahlungsrhythmus");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleTarifChange = (t: "essential" | "growth" | "enterprise", z: "monatlich" | "jaehrlich") => {
    setValue("tarif", t);
    setValue("zahlungsrhythmus", z);

    if (t === "essential") {
      setValue("setupPreisBrutto", 359.99);
      setValue("laufendPreisBrutto", z === "monatlich" ? 75.00 : 71.25);
    } else if (t === "growth") {
      setValue("setupPreisBrutto", 379.99);
      setValue("laufendPreisBrutto", z === "monatlich" ? 89.00 : 84.55);
    } else {
      setValue("setupPreisBrutto", 0);
      setValue("laufendPreisBrutto", 0);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 0) {
      fieldsToValidate = ["tarif", "zahlungsrhythmus", "setupPreisBrutto", "laufendPreisBrutto"];
    } else if (step === 1) {
      fieldsToValidate = ["firma", "rechtsform", "ansprechpartner", "strasse", "plz", "ort", "email"];
    } else if (step === 4) {
      fieldsToValidate = ["iban", "signatureSepaB64"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setStep(s => s + 1);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/v1/contracts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          iban: data.iban.replace(/\s/g, ""),
          salesUserId
        })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        try {
          const json = await res.json();
          alert(json.error || "Ein Fehler ist aufgetreten. Bitte prüfe die Verbindung.");
        } catch (e) {
          alert("Ein Fehler ist aufgetreten. Bitte prüfe die Verbindung.");
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
      <Card className="w-full text-center py-16 relative overflow-hidden bg-card border-2 border-emerald-500/40 shadow-2xl animate-in zoom-in-95 duration-500">
        <SparkleCelebration />
        <FloatingHearts />

        <style>{`
          @keyframes checkPulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .animate-check-pulse {
            animation: checkPulse 2s infinite ease-in-out;
          }
        `}</style>

        <CardHeader className="relative z-10 space-y-6">
          <div className="relative flex justify-center items-center py-4">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center animate-check-pulse">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 fill-emerald-950/20" />
            </div>
          </div>

          <CardTitle className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Vielen Dank
          </CardTitle>

          <CardDescription className="text-xl sm:text-2xl mt-4 font-medium text-foreground max-w-2xl mx-auto leading-relaxed">
            Der Vertrag wurde erfolgreich und rechtskräftig unterzeichnet.
            Wir freuen uns riesig auf die Zusammenarbeit mit <span className="text-primary font-bold">{watch("firma")}</span>!
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 relative z-10 max-w-xl mx-auto">
          <div className="bg-background/80 border border-primary/20 p-6 rounded-2xl text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
            <p className="text-foreground text-center leading-relaxed">
              Die vollständigen Vertragsunterlagen als PDF wurden soeben an <br />
              <span className="font-bold text-primary">{watch("email")}</span> gesendet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border border-border">
      <CardHeader className="border-b border-border bg-muted/30">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {step === 0 ? "Tarif-Konfiguration" : `Schritt ${step} von 6`}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {step === 1 && "Bitte trag Deine Firmendaten ein."}
                {step === 2 && "Bitte lies und bestätige die AGB."}
                {step === 3 && "Bitte lies und bestätige den AVV."}
                {step === 4 && "Bitte erteile uns Dein SEPA-Lastschriftmandat."}
                {step === 5 && "Bitte prüfe Deine Angaben auf Fehler."}
                {step === 6 && "Bitte bestätige Deine Zustimmung und unterschreibe."}
              </CardDescription>
            </div>
          </div>

          {step > 0 && (
            <div className="flex items-center w-full gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-muted border border-border/50">
                  <div className={`h-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-4 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* STEP 0: Sales Rep Selection */}
          {step === 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["essential", "growth", "enterprise"].map((t) => {
                  let priceInfo = "";
                  if (t === "essential") {
                    priceInfo = `Einmalgebühr: ${formatPrice(359.99)} | Laufende Gebühr: ${formatPrice(75.00)} / Monat (oder ${formatPrice(71.25)} / Monat bei jährlicher Zahlung)`;
                  } else if (t === "growth") {
                    priceInfo = `Einmalgebühr: ${formatPrice(379.99)} | Laufende Gebühr: ${formatPrice(89.00)} / Monat (oder ${formatPrice(84.55)} / Monat bei jährlicher Zahlung)`;
                  } else {
                    priceInfo = "Einmalgebühr & Laufende Gebühr individuell verhandelbar";
                  }
                  return (
                    <div
                      key={t}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between ${currentTarif === t
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card/50 hover:border-neutral-500 hover:bg-card'
                        }`}
                      onClick={() => handleTarifChange(t as any, currentZahlungsrhythmus)}
                    >
                      <div>
                        <h3 className="font-bold text-lg capitalize">{t}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t === "enterprise" ? "Individuelles High-End Paket" : "Standard WaaS-Paket"}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-border/40 text-xs font-semibold text-primary">
                        {priceInfo}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex bg-muted p-1 rounded-lg w-full mt-4 border border-border">
                <button
                  type="button"
                  onClick={() => handleTarifChange(currentTarif, "monatlich")}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${currentZahlungsrhythmus === "monatlich" ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                >
                  Monatlich
                </button>
                <button
                  type="button"
                  onClick={() => handleTarifChange(currentTarif, "jaehrlich")}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${currentZahlungsrhythmus === "jaehrlich" ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                >
                  Jährlich (-5%)
                </button>
              </div>

              {currentTarif === "enterprise" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/50 p-6 rounded-xl mt-4 border border-border">
                  <div className="space-y-2">
                    <Label required>Individuelle Einmalgebühr (inkl. MwSt., einmalig in €)</Label>
                    <Input type="number" step="0.01" {...register("setupPreisBrutto", { valueAsNumber: true })} error={errors.setupPreisBrutto?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label required>Individuelle Laufende Gebühr (inkl. MwSt., laufend in €)</Label>
                    <Input type="number" step="0.01" {...register("laufendPreisBrutto", { valueAsNumber: true })} error={errors.laufendPreisBrutto?.message} />
                  </div>
                </div>
              )}

              <div className="mt-8 bg-primary/5 p-4 rounded-xl border border-primary/20 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-muted-foreground text-center sm:text-left">
                  Konfiguration abgeschlossen. Bitte übergib das Tablet nun an den Kunden.
                </span>
                <Button type="button" size="lg" className="w-full sm:w-auto shrink-0" onClick={nextStep}>
                  Tablet an Kunden übergeben ➔
                </Button>
              </div>
            </div>
          )}

          {/* STEP 1: Customer Data */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">Deine Daten</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <Label required>Firma / Unternehmensname</Label>
                  <Input {...register("firma")} placeholder="Muster" error={errors.firma?.message} />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label required>Rechtsform</Label>
                  <select
                    {...register("rechtsform")}
                    className="flex h-10 w-full rounded-lg border border-neutral-600 bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
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
                  {errors.rechtsform && <p className="mt-1 text-xs text-destructive">{errors.rechtsform.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label required>Ansprechpartner</Label>
                <Input {...register("ansprechpartner")} placeholder="Max Mustermann (Vor- & Nachname)" error={errors.ansprechpartner?.message} />
              </div>
              <div className="space-y-2">
                <Label required>Straße & Hausnummer</Label>
                <Input {...register("strasse")} placeholder="Hauptstraße 12" error={errors.strasse?.message} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2 sm:col-span-1">
                  <Label required>PLZ</Label>
                  <Input {...register("plz")} placeholder="12345" error={errors.plz?.message} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label required>Ort</Label>
                  <Input {...register("ort")} placeholder="Musterstadt" error={errors.ort?.message} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label required>E-Mail-Adresse</Label>
                  <Input type="email" {...register("email")} placeholder="name@firma.de" error={errors.email?.message} />
                  <p className="text-[11px] text-muted-foreground">An diese Adresse werden die unterzeichneten Vertragsunterlagen gesendet.</p>
                </div>
                <div className="space-y-2">
                  <Label>Telefonnummer (Optional)</Label>
                  <Input {...register("telefon")} placeholder="+49 170 1234567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Umsatzsteuer-Identifikationsnummer (USt-IdNr.) (Optional)</Label>
                <Input {...register("ustId")} placeholder="DE123456789" />
              </div>

              <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" size="lg" className="w-full sm:w-auto" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={nextStep}>Weiter
                  <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </div>
          )}

          {/* STEP 2: AGB */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">2. Allgemeine Geschäftsbedingungen</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bitte nimm Dir einen Moment Zeit, die AGB zu lesen. Scroll dazu bitte bis zum Ende des Dokuments.
              </p>

              <LegalScrollBox
                title="Allgemeine Geschäftsbedingungen (AGB)"
                content={termsContent}
                onRead={() => setAgbRead(true)}
              />

              <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" size="lg" className="w-full sm:w-auto" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={nextStep} disabled={!agbRead}>
                  Weiter zum AVV
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: AVV */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Vertrag zur Auftragsverarbeitung</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bitte nimm Dir einen Moment Zeit, die AVV zu lesen. Scroll dazu bitte bis zum Ende des Dokuments.
              </p>

              <LegalScrollBox
                title="Vertrag zur Auftragsverarbeitung (AVV)"
                content={avvContent}
                onRead={() => setAvvRead(true)}
              />

              <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" size="lg" className="w-full sm:w-auto" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={nextStep} disabled={!avvRead}>
                  Weiter zur Zahlungsart
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: SEPA */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">4. SEPA-Lastschriftmandat</h3>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl text-sm shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary/20 text-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg border-l border-b border-primary/30 uppercase tracking-wider">
                  B2B Mandat
                </div>
                <p className="text-primary font-bold mb-2">Gläubiger-Identifikationsnummer: DE15WEB00002924152</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-4 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{sepaContent}</ReactMarkdown>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Kontoinhaber (falls abweichend von Firma)</Label>
                    <Input {...register("kontoinhaber")} placeholder="Max Mustermann" />
                  </div>
                  <div className="space-y-2">
                    <Label>Kreditinstitut / Bank (Optional)</Label>
                    <Input {...register("bank")} placeholder="Musterbank" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label required>IBAN</Label>
                    <Input
                      {...register("iban", {
                        onChange: (e) => {
                          const raw = e.target.value.toUpperCase().replace(/\s/g, "");
                          e.target.value = raw.replace(/(.{4})/g, "$1 ").trim();
                        }
                      })}
                      placeholder="DE12 3456 7890 ..."
                      error={errors.iban?.message}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label>BIC (Optional)</Label>
                    <Input {...register("bic")} placeholder="GENODEM1MUB" />
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/40">
                  <Controller
                    name="signatureSepaB64"
                    control={control}
                    render={({ field }) => (
                      <SignaturePad
                        label="Unterschrift für SEPA-Lastschriftmandat"
                        onSave={(val) => {
                          field.onChange(val);
                          trigger("signatureSepaB64");
                        }}
                      />
                    )}
                  />
                  {errors.signatureSepaB64 && <p className="text-xs text-red-500 mt-1">{errors.signatureSepaB64.message}</p>}
                </div>
              </div>

              <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => setStep(3)}>
                  ← Zurück
                </Button>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={nextStep}>
                  Weiter zur Zusammenfassung
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Zusammenfassung / Review */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium font-bold">5. Zusammenfassung & Prüfung</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bitte überprüfe alle Angaben sorgfältig auf Fehler, bevor Du den Vertrag unterzeichnest.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Tarif & Konditionen */}
                <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Tarif & Konditionen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gewählter Tarif:</span>
                      <span className="font-medium capitalize">{currentTarif}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zahlungsrhythmus:</span>
                      <span className="font-medium">{currentZahlungsrhythmus === "jaehrlich" ? "Jährlich" : "Monatlich"}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted-foreground">Einmalgebühr:</span>
                      <span className="font-semibold text-foreground">{formatPrice(watch("setupPreisBrutto"))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Laufende Gebühr:</span>
                      <span className="font-semibold text-foreground">{formatPrice(watch("laufendPreisBrutto"))}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Firmendaten */}
                <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Firmendaten</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Firma / Name:</span>
                      <span className="font-medium text-foreground">{watch("firma")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rechtsform:</span>
                      <span className="font-medium text-foreground">{watch("rechtsform")}</span>
                    </div>
                    {watch("ustId") && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USt-IdNr.:</span>
                        <span className="font-medium text-foreground">{watch("ustId")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Ansprechpartner & Adresse */}
                <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Ansprechpartner & Adresse</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">{watch("ansprechpartner")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Straße & Hausnummer:</span>
                      <span className="font-medium text-foreground">{watch("strasse")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PLZ & Ort:</span>
                      <span className="font-medium text-foreground">{watch("plz")} {watch("ort")}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted-foreground">E-Mail:</span>
                      <span className="font-medium text-foreground">{watch("email")}</span>
                    </div>
                    {watch("telefon") && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span className="font-medium text-foreground">{watch("telefon")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Zahlungsdaten */}
                <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Zahlungsdaten</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IBAN:</span>
                      <span className="font-medium font-mono text-foreground">{watch("iban")}</span>
                    </div>
                    {watch("bic") && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BIC:</span>
                        <span className="font-medium font-mono text-foreground">{watch("bic")}</span>
                      </div>
                    )}
                    {watch("bank") && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank:</span>
                        <span className="font-medium text-foreground">{watch("bank")}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border/40 pt-2">
                      <span className="text-muted-foreground">Kontoinhaber:</span>
                      <span className="font-medium text-foreground">{watch("kontoinhaber") || watch("ansprechpartner")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between items-center gap-4 pt-6 border-t border-border/40">
                <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => setStep(4)}>
                  ← Zurück
                </Button>
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={nextStep}>
                  Angaben prüfen & Weiter
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Final (Vertragsabschluss) */}
          {step === 6 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <PenTool className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">6. Vertragsabschluss</h3>
              </div>

              <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20 space-y-4 shadow-sm">
                <h4 className="font-bold text-primary flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  Dein neuer Tarif wird: {currentTarif.charAt(0).toUpperCase() + currentTarif.slice(1).toLowerCase()}                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
                  <div className="bg-background/40 p-4 rounded-lg border border-border">
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Einmalgebühr</span>
                    <span className="text-xl font-bold text-foreground">{formatPrice(watch("setupPreisBrutto"))}</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">Inkl. 19% MwSt.</span>
                  </div>
                  <div className="bg-background/40 p-4 rounded-lg border border-border">
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Laufende Gebühr</span>
                    <span className="text-xl font-bold text-foreground">{formatPrice(watch("laufendPreisBrutto"))}</span>
                    <span className="text-[10px] text-muted-foreground block mt-1">{currentZahlungsrhythmus === "jaehrlich" ? "Jährlich" : "Monatlich"}, inkl. 19% MwSt.</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alle Preise verstehen sich Brutto, also inkl. der gesetzlichen Umsatzsteuer (19%) und sind absetzbar.
                </p>
              </div>

              <div className="space-y-4">
                {/* Checkbox 1: B2B */}
                <div
                  onClick={() => setValue("consentB2b", !watch("consentB2b"), { shouldValidate: true })}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${watch("consentB2b")
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border bg-card/40 hover:bg-card/80'
                    }`}
                >
                  <input
                    type="checkbox"
                    id="b2b"
                    {...register("consentB2b")}
                    checked={watch("consentB2b")}
                    readOnly
                    className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label className="cursor-pointer font-medium block">
                      Ich bestätige, dass ich ausschließlich gewerblich/selbstständig handle (B2B). *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Dieser Vertrag gilt ausschließlich für Geschäftskunden.</p>
                    {errors.consentB2b && <p className="text-xs text-red-500 mt-1">{errors.consentB2b.message}</p>}
                  </div>
                </div>

                {/* Checkbox 2: AGB */}
                <div
                  onClick={() => setValue("consentAgb", !watch("consentAgb"), { shouldValidate: true })}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${watch("consentAgb")
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border bg-card/40 hover:bg-card/80'
                    }`}
                >
                  <input
                    type="checkbox"
                    id="agb"
                    {...register("consentAgb")}
                    checked={watch("consentAgb")}
                    readOnly
                    className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label className="cursor-pointer font-medium block">
                      Ich habe die Allgemeinen Geschäftsbedingungen (AGB) zur Kenntnis genommen und akzeptiere diese. *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Das Dokument wird Dir später erneut zugesandt.</p>
                    {errors.consentAgb && <p className="text-xs text-red-500 mt-1">{errors.consentAgb.message}</p>}
                  </div>
                </div>

                {/* Checkbox 3: AVV */}
                <div
                  onClick={() => setValue("consentAvv", !watch("consentAvv"), { shouldValidate: true })}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${watch("consentAvv")
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-border bg-card/40 hover:bg-card/80'
                    }`}
                >
                  <input
                    type="checkbox"
                    id="avv"
                    {...register("consentAvv")}
                    checked={watch("consentAvv")}
                    readOnly
                    className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label className="cursor-pointer font-medium block">
                      Ich schließe den Vertrag zur Auftragsverarbeitung (AVV) ab. *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Erforderlich für datenschutzkonformes Website-Hosting.</p>
                    {errors.consentAvv && <p className="text-xs text-red-500 mt-1">{errors.consentAvv.message}</p>}
                  </div>
                </div>

                {/* Checkbox 4: Marketing (Optional) */}
                <div
                  onClick={() => setValue("consentMarketing", !watch("consentMarketing"), { shouldValidate: true })}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${watch("consentMarketing")
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-border bg-card/40 hover:bg-card/80'
                    }`}
                >
                  <input
                    type="checkbox"
                    id="marketing"
                    {...register("consentMarketing")}
                    checked={watch("consentMarketing")}
                    readOnly
                    className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label className="cursor-pointer text-muted-foreground block font-medium">
                      Ich möchte gelegentlich Infos zu Optimierungen und Angeboten erhalten.
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Erhalten Sie nützliche Tipps zur Webseiten-Optimierung und exklusive Angebote (jederzeit widerrufbar & optional).</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border/40">
                <Controller
                  name="signatureContractB64"
                  control={control}
                  render={({ field }) => (
                    <SignaturePad
                      label="Rechtsverbindliche Vertragsunterschrift"
                      onSave={(val) => {
                        field.onChange(val);
                        trigger("signatureContractB64");
                      }}
                    />
                  )}
                />
                {errors.signatureContractB64 && <p className="text-xs text-red-500 mt-1">{errors.signatureContractB64.message}</p>}
              </div>

              <div className="flex flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
                <Button type="button" variant="secondary" size="lg" className="w-full sm:w-auto px-8" onClick={() => setStep(5)}>
                  ← Zurück
                </Button>
                <Button type="submit" size="lg" disabled={isSubmitting || !watch("consentB2b") || !watch("consentAgb") || !watch("consentAvv") || !watch("signatureContractB64") || watch("signatureContractB64").length < 10} className="w-full sm:w-auto px-12 py-6 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  {isSubmitting ? "Wird verarbeitet..." : "Zahlungspflichtig bestellen"}
                </Button>
              </div>
            </div>
          )}

        </form>
      </CardContent>
    </Card>
  );
}

