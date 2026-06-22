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
import { CheckCircle2, FileText, User, CreditCard, PenTool, Heart } from "lucide-react";

const formSchema = z.object({
  tarif: z.enum(["essential", "growth", "enterprise"]),
  zahlungsrhythmus: z.enum(["monatlich", "jaehrlich"]),
  setupPreisNetto: z.number().min(0),
  laufendPreisNetto: z.number().min(0),

  firma: z.string().min(2, "Firma ist erforderlich"),
  ansprechpartner: z.string().min(2, "Ansprechpartner ist erforderlich"),
  strasse: z.string().min(2, "Straße ist erforderlich"),
  plz: z.string().min(4, "PLZ ist erforderlich"),
  ort: z.string().min(2, "Ort ist erforderlich"),
  email: z.string().email("Ungültige E-Mail Adresse"),
  telefon: z.string().optional(),
  ustId: z.string().optional(),

  iban: z.string().min(15, "Ungültige IBAN"),
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

interface HeartParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const colors = ["#CCFF00", "#FF2D55", "#FF9500", "#4CD964", "#5AC8FA"];
    const newHearts = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 24 + 12,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 3,
      color: colors[Math.floor(Math.random() * colors.length)] || "#CCFF00",
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <style>{`
        @keyframes floatHeart {
          0% {
            transform: translateY(10vh) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-heart {
          animation-name: floatHeart;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-0 animate-float-heart opacity-0"
          style={{
            left: `${h.x}%`,
            fontSize: `${h.size}px`,
            color: h.color,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
}

export function OrderFormFlow({ termsContent, avvContent, sepaContent, salesUserId }: { termsContent: string, avvContent: string, sepaContent: string, salesUserId: string }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Track scroll status for step 2
  const [agbRead, setAgbRead] = useState(false);
  const [avvRead, setAvvRead] = useState(false);

  const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tarif: "growth",
      zahlungsrhythmus: "monatlich",
      setupPreisNetto: 379.99,
      laufendPreisNetto: 89.00,
      consentB2b: false,
      consentAgb: false,
      consentAvv: false,
      consentMarketing: false,
    }
  });

  const currentTarif = watch("tarif");
  const currentZahlungsrhythmus = watch("zahlungsrhythmus");

  const handleTarifChange = (t: "essential" | "growth" | "enterprise", z: "monatlich" | "jaehrlich") => {
    setValue("tarif", t);
    setValue("zahlungsrhythmus", z);

    if (t === "essential") {
      setValue("setupPreisNetto", 359.99);
      setValue("laufendPreisNetto", z === "monatlich" ? 75.00 : 71.25);
    } else if (t === "growth") {
      setValue("setupPreisNetto", 379.99);
      setValue("laufendPreisNetto", z === "monatlich" ? 89.00 : 84.55);
    } else {
      // Enterprise default values, but allow manual input in the UI
      setValue("setupPreisNetto", 0);
      setValue("laufendPreisNetto", 0);
    }
  };

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 0) {
      fieldsToValidate = ["tarif", "zahlungsrhythmus", "setupPreisNetto", "laufendPreisNetto"];
    } else if (step === 1) {
      fieldsToValidate = ["firma", "ansprechpartner", "strasse", "plz", "ort", "email"];
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
      const apiUrl = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/v1/contracts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          salesUserId
        })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Ein Fehler ist aufgetreten. Bitte prüfen Sie die Verbindung.");
      }
    } catch (err) {
      console.error(err);
      alert("Netzwerkfehler.");
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <Card className="w-full text-center py-16 relative overflow-hidden bg-card border-2 border-primary/40 shadow-2xl animate-in zoom-in-95 duration-500">
        <FloatingHearts />

        {/* Style for the pulsing heart */}
        <style>{`
          @keyframes heartPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          .animate-heart-pulse {
            animation: heartPulse 2s infinite ease-in-out;
          }
        `}</style>

        <CardHeader className="relative z-10 space-y-6">
          <div className="relative flex justify-center items-center py-4">
            <Heart className="w-24 h-24 text-[#FF2D55] fill-[#FF2D55] animate-heart-pulse z-10" />
          </div>

          <CardTitle className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Vielen Dank
          </CardTitle>

          <CardDescription className="text-xl sm:text-2xl mt-4 font-medium text-foreground max-w-2xl mx-auto leading-relaxed">
            Du hast den Vertrag rechtskräftig unterschrieben.
            Wir freuen uns riesig auf die Partnerschaft mit <span className="text-primary font-bold">{watch("firma")}</span>!
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 relative z-10 max-w-xl mx-auto">
          <div className="bg-primary/5 border-2 border-[#CCFF00] p-6 rounded-2xl text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
            <p className="text-foreground text-center leading-relaxed">
              Die vollständigen Vertragsunterlagen als PDF wurden soeben sicher an <br />
              <span className="font-bold text-[#CCFF00] text-base underline decoration-dotted">{watch("email")}</span> versendet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" /> Digitaler Vertragsabschluss
              </CardTitle>
              <CardDescription className="mt-1">
                {step === 0 ? "Schritt 0: Tarifauswahl (Nur Vertrieb)" : `Schritt ${step} von 5`}
              </CardDescription>
            </div>
            <div className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
              Buff Interactive
            </div>
          </div>

          {step > 0 && (
            <div className="flex items-center w-full gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-muted">
                  <div className={`h-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* STEP 0: Sales Rep Selection */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["essential", "growth", "enterprise"].map((t) => (
                  <div
                    key={t}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${currentTarif === t ? 'border-primary bg-primary/5' : 'border-border'}`}
                    onClick={() => handleTarifChange(t as any, currentZahlungsrhythmus)}
                  >
                    <h3 className="font-bold text-lg capitalize">{t}</h3>
                    {t !== "enterprise" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Standard WaaS Paket
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex bg-muted p-1 rounded-lg w-full mt-4 border border-border">
                <button
                  type="button"
                  onClick={() => handleTarifChange(currentTarif, "monatlich")}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${currentZahlungsrhythmus === "monatlich" ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                >
                  Monatlich
                </button>
                <button
                  type="button"
                  onClick={() => handleTarifChange(currentTarif, "jaehrlich")}
                  className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${currentZahlungsrhythmus === "jaehrlich" ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}
                >
                  Jährlich (-5%)
                </button>
              </div>

              {currentTarif === "enterprise" && (
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg mt-4 border border-border">
                  <div>
                    <Label>Individueller Setup-Preis (Netto €)</Label>
                    <Input type="number" step="0.01" {...register("setupPreisNetto", { valueAsNumber: true })} />
                  </div>
                  <div>
                    <Label>Individuelle Laufende Pauschale (Netto €)</Label>
                    <Input type="number" step="0.01" {...register("laufendPreisNetto", { valueAsNumber: true })} />
                  </div>
                </div>
              )}

              <Button type="button" className="w-full mt-8" onClick={nextStep}>
                Tablet an Kunden übergeben ➔
              </Button>
            </div>
          )}

          {/* STEP 1: Customer Data */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">1. Kundendaten</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firma *</Label>
                  <Input {...register("firma")} placeholder="Muster GmbH" />
                  {errors.firma && <p className="text-xs text-red-500">{errors.firma.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Ansprechpartner *</Label>
                  <Input {...register("ansprechpartner")} placeholder="Max Mustermann" />
                  {errors.ansprechpartner && <p className="text-xs text-red-500">{errors.ansprechpartner.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Straße & Hausnummer *</Label>
                <Input {...register("strasse")} />
                {errors.strasse && <p className="text-xs text-red-500">{errors.strasse.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>PLZ *</Label>
                  <Input {...register("plz")} />
                  {errors.plz && <p className="text-xs text-red-500">{errors.plz.message}</p>}
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Ort *</Label>
                  <Input {...register("ort")} />
                  {errors.ort && <p className="text-xs text-red-500">{errors.ort.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-Mail-Adresse *</Label>
                  <Input type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telefonnummer</Label>
                  <Input {...register("telefon")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Umsatzsteuer-ID (Optional)</Label>
                <Input {...register("ustId")} placeholder="DE..." />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep}>Weiter</Button>
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
                Bitte nehmen Sie sich einen Moment Zeit, die AGB zu lesen und zum Ende zu scrollen.
              </p>

              <LegalScrollBox
                title="Allgemeine Geschäftsbedingungen (AGB)"
                content={termsContent}
                onRead={() => setAgbRead(true)}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep} disabled={!agbRead}>
                  Weiter zur AVV
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: AVV */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">3. Vertrag zur Auftragsverarbeitung</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bitte nehmen Sie sich einen Moment Zeit, die AVV zu lesen und zum Ende zu scrollen.
              </p>

              <LegalScrollBox
                title="Vertrag zur Auftragsverarbeitung (AVV)"
                content={avvContent}
                onRead={() => setAvvRead(true)}
              />

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep} disabled={!avvRead}>
                  Weiter zur Zahlungsart
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
              <div className="bg-background border-2 border-primary/20 p-6 rounded-xl text-sm prose prose-sm dark:prose-invert max-w-none shadow-inner">
                <p className="text-primary font-bold mb-4">Gläubiger-Identifikationsnummer: DE15WEB00002924152</p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{sepaContent}</ReactMarkdown>
              </div>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kontoinhaber (falls abweichend)</Label>
                    <Input {...register("kontoinhaber")} placeholder="Max Mustermann" />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank (Optional)</Label>
                    <Input {...register("bank")} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>IBAN *</Label>
                    <Input {...register("iban")} placeholder="DE..." />
                    {errors.iban && <p className="text-xs text-red-500">{errors.iban.message}</p>}
                  </div>
                  <div className="space-y-2 col-span-1">
                    <Label>BIC (Optional)</Label>
                    <Input {...register("bic")} />
                  </div>
                </div>

                <div className="mt-8">
                  <Controller
                    name="signatureSepaB64"
                    control={control}
                    render={({ field }) => (
                      <SignaturePad
                        label="Unterschrift SEPA-Mandat"
                        onSave={field.onChange}
                      />
                    )}
                  />
                  {errors.signatureSepaB64 && <p className="text-xs text-red-500 mt-1">{errors.signatureSepaB64.message}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={nextStep}>
                  Weiter zum Vertragsabschluss
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Final */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 border-b pb-2">
                <PenTool className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-medium">5. Vertragsabschluss</h3>
              </div>

              <div className="bg-primary/10 p-6 rounded-xl border-2 border-primary/30 space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Ihre Buchung: Tarif {currentTarif.toUpperCase()}
                </h4>
                <p className="text-sm">Setup: {watch("setupPreisNetto")} € netto</p>
                <p className="text-sm">Laufend: {watch("laufendPreisNetto")} € netto ({currentZahlungsrhythmus})</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentB2b"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="b2b"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="b2b">Ich bestätige, dass ich ausschließlich gewerblich/selbstständig handle (B2B).</Label>
                    {errors.consentB2b && <p className="text-xs text-red-500">{errors.consentB2b.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentAgb"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="agb"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="agb">Ich habe die AGB zur Kenntnis genommen und akzeptiere diese.</Label>
                    {errors.consentAgb && <p className="text-xs text-red-500">{errors.consentAgb.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Controller
                    name="consentAvv"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="avv"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="avv">Ich schließe den Vertrag zur Auftragsverarbeitung (AVV) ab.</Label>
                    {errors.consentAvv && <p className="text-xs text-red-500">{errors.consentAvv.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-4 border-t border-border">
                  <Controller
                    name="consentMarketing"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                    )}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="marketing" className="text-muted-foreground">
                      (Optional) Ich möchte gelegentlich Infos zu Optimierungen erhalten.
                    </Label>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Controller
                  name="signatureContractB64"
                  control={control}
                  render={({ field }) => (
                    <SignaturePad
                      label="Rechtsverbindliche Vertragsunterschrift"
                      onSave={field.onChange}
                    />
                  )}
                />
                {errors.signatureContractB64 && <p className="text-xs text-red-500 mt-1">{errors.signatureContractB64.message}</p>}
              </div>

              <div className="flex justify-end pt-8">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
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
