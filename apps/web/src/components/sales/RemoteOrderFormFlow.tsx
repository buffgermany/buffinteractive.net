"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LegalScrollBox } from "@/components/shared/LegalScrollBox";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, FileText, User, CreditCard, ArrowLeft, ArrowRight, ShieldCheck, Lock } from "lucide-react";
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
  consentSepa: z.boolean().refine(v => v === true, "Erteilung des SEPA-Lastschriftmandats ist erforderlich"),

  consentB2b: z.boolean().refine(v => v === true, "B2B-Bestätigung ist erforderlich"),
  consentAgb: z.boolean().refine(v => v === true, "AGB-Zustimmung ist erforderlich"),
  consentAvv: z.boolean().refine(v => v === true, "AVV-Zustimmung ist erforderlich"),
  consentDatenschutz: z.boolean().refine(v => v === true, "Datenschutz-Kenntnisnahme ist erforderlich"),
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
  salesUserId: string;
  expiresAt: string;
}

interface RemoteOrderFormFlowProps {
  invite: RemoteInviteData;
  termsContent: string;
  avvContent: string;
  sepaContent: string;
  overrideTarif?: string;
  overrideZahlungsrhythmus?: string;
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

export function RemoteOrderFormFlow({ invite, termsContent, avvContent, sepaContent, overrideTarif, overrideZahlungsrhythmus }: RemoteOrderFormFlowProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [agbRead, setAgbRead] = useState(false);
  const [avvRead, setAvvRead] = useState(false);

  const getEffectivePrices = () => {
    if (overrideTarif && overrideZahlungsrhythmus) {
      const selectedPlan = PRICING_CONFIG.plans[overrideTarif as keyof typeof PRICING_CONFIG.plans];
      if (selectedPlan) {
        return {
          setupPreis: selectedPlan.setupFee,
          laufendPreis: overrideZahlungsrhythmus === "monatlich" ? selectedPlan.priceMonthly : selectedPlan.priceYearly
        };
      }
    }
    return {
      setupPreis: invite.setupPreisBrutto,
      laufendPreis: invite.laufendPreisBrutto
    };
  };

  const { setupPreis, laufendPreis } = getEffectivePrices();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, success]);

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firma: invite.companyName || "",
      rechtsform: "",
      ansprechpartner: invite.customerName || "",
      strasse: "",
      plz: "",
      ort: "",
      email: invite.customerEmail || "",
      telefon: "",
      ustId: "",
      iban: "",
      bic: "",
      bank: "",
      kontoinhaber: "",
      consentSepa: false,
      consentB2b: false,
      consentAgb: false,
      consentAvv: false,
      consentDatenschutz: false,
      consentMarketing: false,
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ["firma", "rechtsform", "ansprechpartner", "strasse", "plz", "ort", "email"];
    } else if (step === 4) {
      fieldsToValidate = ["iban", "consentSepa"];
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
          overrideZahlungsrhythmus
        })
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
      <Card className="w-full text-center py-16 relative overflow-hidden bg-card border-2 border-emerald-500/40 shadow-2xl animate-in zoom-in-95 duration-500">
        <SparkleCelebration />

        <CardHeader className="relative z-10 space-y-6">
          <div className="relative flex justify-center items-center py-4">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 fill-emerald-950/20" />
            </div>
          </div>

          <CardTitle className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Vielen Dank!
          </CardTitle>

          <CardDescription className="text-lg sm:text-2xl mt-4 font-medium text-foreground max-w-2xl mx-auto leading-relaxed">
            Dein Vertrag wurde erfolgreich & rechtswirksam online abgeschlossen.
            Wir freuen uns auf die Zusammenarbeit mit <span className="text-primary font-bold">{watch("firma")}</span>!
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 relative z-10 max-w-xl mx-auto">
          <div className="bg-background/80 border border-primary/20 p-6 rounded-2xl text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
            <p className="text-foreground text-center leading-relaxed">
              Die vollständigen Vertragsunterlagen inkl. SEPA-Mandat als PDF wurden soeben an <br />
              <span className="font-bold text-primary">{watch("email")}</span> gesendet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Package Header Banner */}
      <div className="bg-card border-2 border-primary/30 p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Offizielles Angebot von Buff Interactive</span>
            </div>
            <h2 className="text-2xl font-extrabold capitalize text-foreground">
              Tarif: {overrideTarif || invite.tarif}
            </h2>
            <p className="text-xs text-muted-foreground">
              Zahlungsrhythmus: <span className="font-semibold text-foreground">{(overrideZahlungsrhythmus || invite.zahlungsrhythmus) === "jaehrlich" ? "Jährlich (-5%)" : "Monatlich"}</span>
            </p>
          </div>

          <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-6 text-right sm:text-left">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Einmalgebühr</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(setupPreis)}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-semibold block">Laufende Gebühr</span>
              <span className="text-lg font-bold text-primary">{formatPrice(laufendPreis)}</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="w-full shadow-lg border border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Digitaler Vertragsabschluss (Schritt {step} von 6)
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  {step === 1 && "Bitte trage Deine Firmendaten ein."}
                  {step === 2 && "Bitte lies und bestätige die AGB."}
                  {step === 3 && "Bitte lies und bestätige den AVV."}
                  {step === 4 && "Bitte erteile das SEPA-Lastschriftmandat."}
                  {step === 5 && "Bitte prüfe Deine Angaben auf Richtigkeit."}
                  {step === 6 && "Bitte bestätige Deine Zustimmung und schließe die Bestellung ab."}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center w-full gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-muted border border-border/50">
                  <div className={`h-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-transparent'}`} />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-4 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* STEP 1: Customer Data */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-medium">1. Deine Unternehmensdaten</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label required>Firma / Unternehmensname</Label>
                    <Input {...register("firma")} placeholder="Muster GmbH" error={errors.firma?.message} />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <Label required>Rechtsform</Label>
                    <select
                      {...register("rechtsform")}
                      className="flex h-10 w-full rounded-lg border border-neutral-600 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  <Label required>Ansprechpartner (Vor- & Nachname)</Label>
                  <Input {...register("ansprechpartner")} placeholder="Max Mustermann" error={errors.ansprechpartner?.message} />
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
                    <p className="text-[11px] text-muted-foreground">An diese Adresse senden wir die finalen Vertragsunterlagen.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Telefonnummer (Optional)</Label>
                    <Input {...register("telefon")} placeholder="+49 170 1234567" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>USt-IdNr. (Optional)</Label>
                  <Input {...register("ustId")} placeholder="DE123456789" />
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button type="button" size="lg" className="w-full sm:w-auto px-8" onClick={nextStep}>
                    Weiter zu den AGB
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: AGB */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-medium">2. Allgemeine Geschäftsbedingungen (AGB)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bitte scroll bis zum Ende des Dokuments, um die AGB freizuschalten.
                </p>

                <LegalScrollBox
                  title="Allgemeine Geschäftsbedingungen (AGB)"
                  content={termsContent}
                  onRead={() => setAgbRead(true)}
                />

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <Button type="button" size="lg" onClick={nextStep} disabled={!agbRead}>
                    Weiter zum AVV
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: AVV */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-medium">3. Vertrag zur Auftragsverarbeitung (AVV)</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bitte scroll bis zum Ende des Dokuments, um den AVV freizuschalten.
                </p>

                <LegalScrollBox
                  title="Vertrag zur Auftragsverarbeitung (AVV)"
                  content={avvContent}
                  onRead={() => setAvvRead(true)}
                />

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                  <Button type="button" variant="ghost" size="lg" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  <Button type="button" size="lg" onClick={nextStep} disabled={!avvRead}>
                    Weiter zum SEPA-Mandat
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SEPA */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-medium">4. SEPA-Lastschriftmandat</h3>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl text-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary/20 text-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg border-l border-b border-primary/30 uppercase tracking-wider">
                    B2B Mandat
                  </div>
                  <p className="text-primary font-bold mb-2">Gläubiger-ID: DE15WEB00002924152</p>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-4 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{sepaContent}</ReactMarkdown>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Kontoinhaber (falls abweichend)</Label>
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

                  {/* SEPA Electronic Authorization Checkbox */}
                  <div
                    onClick={() => setValue("consentSepa", !watch("consentSepa"), { shouldValidate: true })}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer mt-6 ${watch("consentSepa")
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-border bg-card/40 hover:bg-card/80'
                      }`}
                  >
                    <input
                      type="checkbox"
                      id="sepaConsent"
                      {...register("consentSepa")}
                      checked={watch("consentSepa")}
                      readOnly
                      className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                    />
                    <div className="space-y-1 leading-none flex-1">
                      <Label className="cursor-pointer font-medium block">
                        Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die gezogenen Lastschriften einzulösen. *
                      </Label>
                      {errors.consentSepa && <p className="text-xs text-red-500 mt-1">{errors.consentSepa.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep(3)}>
                    ← Zurück
                  </Button>
                  <Button type="button" size="lg" onClick={nextStep} disabled={!watch("consentSepa")}>
                    Weiter zur Zusammenfassung
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Zusammenfassung */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">5. Zusammenfassung & Prüfung</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bitte überprüfe alle Angaben sorgfältig auf Richtigkeit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tarif & Konditionen */}
                  <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                    <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Tarif & Konditionen</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gewählter Tarif:</span>
                        <span className="font-medium capitalize">{overrideTarif || invite.tarif}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zahlungsrhythmus:</span>
                        <span className="font-medium">{(overrideZahlungsrhythmus || invite.zahlungsrhythmus) === "jaehrlich" ? "Jährlich" : "Monatlich"}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/40 pt-2">
                        <span className="text-muted-foreground">Einmalgebühr:</span>
                        <span className="font-semibold text-foreground">{formatPrice(setupPreis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Laufende Gebühr:</span>
                        <span className="font-semibold text-foreground">{formatPrice(laufendPreis)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Firmendaten */}
                  <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                    <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Firmendaten</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Firma:</span>
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

                  {/* Ansprechpartner & Adresse */}
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
                    </div>
                  </div>

                  {/* Zahlungsdaten */}
                  <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-3 shadow-sm">
                    <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Zahlungsdaten</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-medium font-mono text-foreground">{watch("iban")}</span>
                      </div>
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
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep(4)}>
                    ← Zurück
                  </Button>
                  <Button type="button" size="lg" onClick={nextStep}>
                    Angaben prüfen & Weiter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 6: Final (Vertragsabschluss Button-Lösung § 312j BGB) */}
            {step === 6 && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-medium">6. Rechtsverbindlicher Vertragsabschluss</h3>
                </div>

                <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20 space-y-4 shadow-sm">
                  <h4 className="font-bold text-primary flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    Zusammenfassung Ihres Tarifs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
                    <div className="bg-background/40 p-4 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground block uppercase font-semibold">Einmalgebühr</span>
                      <span className="text-xl font-bold text-foreground">{formatPrice(setupPreis)}</span>
                      <span className="text-[10px] text-muted-foreground block mt-1">Zzgl. 19% MwSt.</span>
                    </div>
                    <div className="bg-background/40 p-4 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground block uppercase font-semibold">Laufende Gebühr</span>
                      <span className="text-xl font-bold text-foreground">{formatPrice(laufendPreis)}</span>
                      <span className="text-[10px] text-muted-foreground block mt-1">{(overrideZahlungsrhythmus || invite.zahlungsrhythmus) === "jaehrlich" ? "Jährlich" : "Monatlich"}, zzgl. 19% MwSt.</span>
                    </div>
                  </div>
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
                      {errors.consentAvv && <p className="text-xs text-red-500 mt-1">{errors.consentAvv.message}</p>}
                    </div>
                  </div>

                  {/* Checkbox 4: Datenschutz */}
                  <div
                    onClick={() => setValue("consentDatenschutz", !watch("consentDatenschutz"), { shouldValidate: true })}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${watch("consentDatenschutz")
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-border bg-card/40 hover:bg-card/80'
                      }`}
                  >
                    <input
                      type="checkbox"
                      id="datenschutz"
                      {...register("consentDatenschutz")}
                      checked={watch("consentDatenschutz")}
                      readOnly
                      className="mt-1 h-5 w-5 rounded border-neutral-600 accent-primary pointer-events-none"
                    />
                    <div className="space-y-1 leading-none flex-1">
                      <Label className="cursor-pointer font-medium block">
                        Ich habe die Datenschutzerklärung zur Kenntnis genommen. *
                      </Label>
                      {errors.consentDatenschutz && <p className="text-xs text-red-500 mt-1">{errors.consentDatenschutz.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep(5)} className="w-full sm:w-auto">
                    ← Zurück
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !watch("consentB2b") || !watch("consentAgb") || !watch("consentAvv") || !watch("consentDatenschutz")}
                    className="w-full sm:w-auto px-12 py-6 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    {isSubmitting ? "Wird verarbeitet..." : "Zahlungspflichtig bestellen"}
                  </Button>
                </div>
              </div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
