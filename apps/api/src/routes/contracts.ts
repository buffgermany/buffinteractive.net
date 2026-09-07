import Elysia, { t } from "elysia";
import { Resend } from "resend";
import { dbPlugin } from "../plugins/db.js";
import { contracts, users, contractSigningRequests } from "@platform/db/schema";
import { eq } from "@platform/db";
import { PRICING_CONFIG } from "../config/pricing.js";

import pdfmake from "pdfmake";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const getResend = () => {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return null;
  return new Resend(key);
};

// Use standard fonts to avoid needing TTF files locally
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
pdfmake.setFonts(fonts);

function readLegalFile(filename: string): string {
  const paths = [
    path.join(process.cwd(), "legal", filename),
    path.join(process.cwd(), "..", "..", "legal", filename),
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, "utf8");
      }
    } catch (e) {
      // ignore
    }
  }
  return "";
}

function getBrandingPath(filename: string): string {
  const paths = [
    path.join(process.cwd(), "branding", filename),
    path.join(process.cwd(), "..", "web", "public", "branding", filename),
  ];
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch (e) {
      // ignore
    }
  }
  return path.join(process.cwd(), "branding", filename);
}

function getWebBaseUrl(headers?: Record<string, string | undefined>, bodyOrigin?: string): string {
  // 1. Explicit bodyOrigin sent from frontend client if valid
  if (bodyOrigin && typeof bodyOrigin === "string" && bodyOrigin.startsWith("http")) {
    return bodyOrigin.replace(/\/+$/, "");
  }

  // 2. Request Origin header
  const origin = headers?.["origin"];
  if (origin && typeof origin === "string" && origin.startsWith("http")) {
    return origin.replace(/\/+$/, "");
  }

  // 3. Request Referer header (parse origin)
  const referer = headers?.["referer"];
  if (referer && typeof referer === "string" && referer.startsWith("http")) {
    try {
      const parsed = new URL(referer);
      return parsed.origin;
    } catch {
      // ignore
    }
  }

  // 4. X-Forwarded-Host + X-Forwarded-Proto header
  const forwardedHost = headers?.["x-forwarded-host"] || headers?.["host"];
  if (forwardedHost && !forwardedHost.includes("localhost") && !forwardedHost.includes("127.0.0.1") && !forwardedHost.includes("api")) {
    const proto = headers?.["x-forwarded-proto"] || "https";
    return `${proto}://${forwardedHost}`.replace(/\/+$/, "");
  }

  // 5. Environment variables
  const envUrl =
    process.env["NEXT_PUBLIC_WEB_URL"] ||
    process.env["WEB_URL"] ||
    process.env["NEXT_PUBLIC_APP_URL"] ||
    process.env["APP_URL"] ||
    process.env["BETTER_AUTH_URL"];

  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/+$/, "");
  }

  // 6. In production environment, default to canonical production domain
  if (process.env.NODE_ENV === "production") {
    return "https://buffinteractive.net";
  }

  // 7. Development fallback
  return "http://localhost:3000";
}

function tarifLabel(tarif: string): string {
  return tarif === "marketing" ? "Marketing" : tarif.charAt(0).toUpperCase() + tarif.slice(1);
}

function docLabels(tarif: string) {
  const m = tarif === "marketing";
  return {
    title: m ? "Marketing-Leistungsschein" : "WaaS Bestellformular",
    docName: m ? "Marketing-Leistungsschein" : "Bestellformular",
    fileName: m ? "Marketing-Leistungsschein_Buff_Interactive.pdf" : "Vertrag_Buff_Interactive.pdf",
    setupLabel: m ? "Onboarding-Gebühr" : "Einmalgebühr",
    laufendLabel: m ? "Monatliche Pauschale" : "Laufende Gebühr",
    agbTeile: m ? "Teil A und Teil C" : "Teil A und Teil B",
  };
}

type LeistungsFelder = {
  tarif: string;
  zahlungsrhythmus: string;
  setupPreisBrutto: string | number;
  laufendPreisBrutto: string | number;
  leistungsbeschreibung?: string | null;
  mindestlaufzeitMonate?: number | null;
  stundensatz?: string | number | null;
  werbebudgetRichtwert?: string | number | null;
};

// Abschnitt 2 des PDFs, tarif-abhängig (WaaS-Bestellformular vs. Marketing-Leistungsschein)
function buildLeistungsBlock(f: LeistungsFelder): any[] {
  if (f.tarif !== "marketing") {
    return [
      { text: '2. Leistungsbeschreibung & Vergütung', style: 'subheader', margin: [0, 20, 0, 5] },
      { text: `Tarif: ${tarifLabel(f.tarif)}` },
      { text: `Zahlungsrhythmus: ${f.zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'}` },
      { text: `Einmalgebühr: ${f.setupPreisBrutto} € zzgl. MwSt.` },
      { text: `Laufende Gebühr: ${f.laufendPreisBrutto} € zzgl. MwSt. / ${f.zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}` },
    ];
  }
  return [
    { text: '2. Leistungsschein', style: 'subheader', margin: [0, 20, 0, 5] },
    { text: 'Leistungsbeschreibung:', bold: true, margin: [0, 0, 0, 2] },
    ...String(f.leistungsbeschreibung || '-').split('\n').map((line) => ({ text: line || ' ' })),
    { text: `Onboarding-Gebühr (einmalig): ${f.setupPreisBrutto} € zzgl. MwSt.`, margin: [0, 8, 0, 0] },
    { text: `Monatliche Pauschale: ${f.laufendPreisBrutto} € zzgl. MwSt. / Monat` },
    { text: `Stundensatz für Mehrleistungen: ${f.stundensatz ?? 95} € zzgl. MwSt. / Std.` },
    ...(Number(f.werbebudgetRichtwert) > 0 ? [
      { text: `Werbebudget-Richtwert: ${f.werbebudgetRichtwert} € netto / Monat` },
      { text: 'Das Werbebudget ist nicht Teil der Vergütung; Werbekonten laufen auf den Kunden, der das Budget direkt an die Plattform zahlt (§ 22 AGB Teil C).', fontSize: 9, color: '#333333', margin: [0, 2, 0, 0] },
    ] : []),
    { text: `Mindestlaufzeit: ${f.mindestlaufzeitMonate ?? 6} Monate ab Kick-off, danach unbestimmte Laufzeit mit 1 Monat Frist zum Monatsende (§ 28 AGB Teil C)`, margin: [0, 4, 0, 0] },
  ];
}

export const contractsRoutes = new Elysia({ prefix: "/v1" })
  .use(dbPlugin)
  .post(
    "/contracts/generate",
    async ({ db, body, headers, request, set }) => {
      try {
        const {
          tarif, setupPreisBrutto, laufendPreisBrutto,
          leistungsbeschreibung, mindestlaufzeitMonate, stundensatz, werbebudgetRichtwert,
          firma, rechtsform, ansprechpartner, strasse, plz, ort, email, telefon, ustId,
          iban, bic, bank, kontoinhaber,
          consentB2b, consentAgb, consentAvv, consentMarketing,
          signatureSepaB64, signatureContractB64,
          salesUserId, clientIp, userAgent
        } = body;
        const zahlungsrhythmus = tarif === "marketing" ? "monatlich" : body.zahlungsrhythmus;
        const labels = docLabels(tarif);
        if (tarif === "marketing" && (!leistungsbeschreibung?.trim() || ![3, 6, 12].includes(Number(mindestlaufzeitMonate)))) {
          set.status = 400;
          return { success: false, error: "Leistungsbeschreibung und Mindestlaufzeit (3/6/12 Monate) sind für Marketing erforderlich." };
        }

        let finalSalesUserId = salesUserId;
        const userExists = await db.query.users.findFirst({
          where: (usersTable, { eq }) => eq(usersTable.id, salesUserId)
        });
        if (!userExists) {
          const firstUser = await db.query.users.findFirst();
          if (firstUser) {
            finalSalesUserId = firstUser.id;
          } else {
            // If no users at all, create a dev user to satisfy foreign key constraint
            const insertedUsers = await db.insert(users).values({
              id: salesUserId,
              name: "Dev User",
              email: "dev@buffinteractive.net",
              role: "admin"
            }).returning();
            if (insertedUsers[0]) {
              finalSalesUserId = insertedUsers[0].id;
            }
          }
        }

        const derivedUserAgent = userAgent || headers["user-agent"] || "Unbekannt";
        const derivedClientIp = clientIp || headers["x-forwarded-for"] || "Unbekannt";

        const signedAt = new Date();

        // Load legal texts from legal directory
        const termsMd = readLegalFile("terms.md");
        const avvMd = readLegalFile("avv.md");

        const mandatsreferenz = `${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
        const sepaMd = readLegalFile("sepa_mandat.md").replace("Wird separat mitgeteilt", mandatsreferenz);

        // Load branding logo PNG
        let logoDataUrl = "";
        try {
          const logoPath = getBrandingPath("buff_interactive.acid-lime_white.png");
          if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
          }
        } catch (err) {
          console.error("[contracts] Failed to read branding logo PNG:", err);
        }

        // 1. Generate PDF
        const docDefinition = {
          defaultStyle: { font: 'Helvetica', fontSize: 10 },
          content: [
            logoDataUrl ? {
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      image: logoDataUrl,
                      width: 180,
                      alignment: 'center',
                      margin: [0, 15, 0, 15]
                    }
                  ]
                ]
              },
              layout: 'noBorders',
              fillColor: '#0A0A0A',
              margin: [-40, -40, -40, 20]
            } : undefined,
            { text: labels.title, style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },

            { text: '1. Kundendaten', style: 'subheader', margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Firma', firma],
                  ['Rechtsform', rechtsform],
                  ['Ansprechpartner', ansprechpartner],
                  ['Straße, Hausnummer', strasse],
                  ['PLZ, Ort', `${plz} ${ort}`],
                  ['E-Mail', email],
                  ['Telefon', telefon || '-'],
                  ['USt-ID', ustId || '-']
                ]
              }
            },

            ...buildLeistungsBlock({ tarif, zahlungsrhythmus, setupPreisBrutto, laufendPreisBrutto, leistungsbeschreibung, mindestlaufzeitMonate, stundensatz, werbebudgetRichtwert }),

            { text: '3. SEPA-Lastschriftmandat', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: 'Gläubiger-Identifikationsnummer: DE15WEB00002924152' },
            { text: `Mandatsreferenz: ${mandatsreferenz}` },
            { text: 'Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von der Felix Kinze & Leon Trepesch GbR auf mein Konto gezogenen Lastschriften einzulösen.', margin: [0, 5, 0, 5] },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Kontoinhaber', kontoinhaber || ansprechpartner],
                  ['IBAN', iban],
                  ['BIC', bic || '-'],
                  ['Bank', bank || '-']
                ]
              }
            },
            { text: 'Unterschrift SEPA-Mandat:', margin: [0, 10, 0, 5] },
            { image: signatureSepaB64, width: 200, margin: [0, 0, 0, 5] },
            { text: `${ort}, den ${signedAt.toLocaleDateString("de-DE")} ${signedAt.toLocaleTimeString("de-DE")} UTC`, margin: [0, 0, 0, 20], fontSize: 9 },

            { text: '4. Vertragsabschluss & Einverständniserklärungen', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: `[${consentB2b ? 'X' : ' '}] B2B-Bestätigung` },
            { text: `[${consentAgb ? 'X' : ' '}] AGB akzeptiert (${labels.agbTeile})` },
            { text: `[${consentAvv ? 'X' : ' '}] AVV abgeschlossen` },
            { text: `[${consentMarketing ? 'X' : ' '}] Marketing-Einwilligung` },

            { text: 'Rechtsverbindliche Unterschrift:', margin: [0, 10, 0, 5] },
            { image: signatureContractB64, width: 200, margin: [0, 0, 0, 5] },
            { text: `${ort}, den ${signedAt.toLocaleDateString("de-DE")} ${signedAt.toLocaleTimeString("de-DE")} UTC`, margin: [0, 0, 0, 10], fontSize: 9 },

            { text: 'Audit-Trail', style: 'subheader', margin: [0, 20, 0, 5], fontSize: 8, color: 'gray' },
            { text: `IP-Adresse: ${derivedClientIp}`, fontSize: 8, color: 'gray' },
            { text: `User-Agent: ${derivedUserAgent}`, fontSize: 8, color: 'gray' },
            { text: `Sales User ID: ${finalSalesUserId}`, fontSize: 8, color: 'gray' },
            { text: `Gezeichnet am: ${signedAt.toUTCString()}`, fontSize: 8, color: 'gray' },

            // Anhang 1: AGB
            { text: 'Anhang 1: Allgemeine Geschäftsbedingungen (AGB)', style: 'subheader', pageBreak: 'before', margin: [0, 15, 0, 10] },
            ...parseMarkdownToPdfmake(termsMd),

            // Anhang 2: AVV
            { text: 'Anhang 2: Vertrag zur Auftragsverarbeitung (AVV)', style: 'subheader', pageBreak: 'before', margin: [0, 15, 0, 10] },
            ...parseMarkdownToPdfmake(avvMd)
          ].filter(Boolean),
          styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 14, bold: true }
          }
        };

        const pdfDoc = pdfmake.createPdf(docDefinition);

        // Ensure contracts folder exists
        const contractsDir = path.join(process.cwd(), 'contracts');
        if (!fs.existsSync(contractsDir)) {
          fs.mkdirSync(contractsDir, { recursive: true });
        }

        const pdfFilename = `contract_${Date.now()}.pdf`;
        const pdfPath = path.join(contractsDir, pdfFilename);

        await pdfDoc.write(pdfPath);

        // 2. Insert into DB
        const [newContract] = await db
          .insert(contracts)
          .values({
            tarif: tarif as any,
            zahlungsrhythmus: zahlungsrhythmus as any,
            setupPreisBrutto: String(setupPreisBrutto),
            laufendPreisBrutto: String(laufendPreisBrutto),
            leistungsbeschreibung: leistungsbeschreibung || null,
            mindestlaufzeitMonate: mindestlaufzeitMonate ?? null,
            stundensatz: stundensatz != null ? String(stundensatz) : null,
            werbebudgetRichtwert: werbebudgetRichtwert != null ? String(werbebudgetRichtwert) : null,
            firma,
            rechtsform,
            ansprechpartner,
            strasse,
            plz,
            ort,
            email,
            telefon: telefon || null,
            ustId: ustId || null,
            iban,
            bic: bic || null,
            bank: bank || null,
            kontoinhaber: kontoinhaber || null,
            consentB2b, consentAgb, consentAvv, consentMarketing,
            signatureSepaB64, signatureContractB64,
            salesUserId: finalSalesUserId,
            clientIp: derivedClientIp || null,
            userAgent: derivedUserAgent || null,
            signedAt,
            pdfPath,
            pdfFilename
          })
          .returning();

        // 3. Send email with PDF attachment
        const resend = getResend();
        if (!resend) {
          console.error("[contracts] ❌ RESEND_API_KEY is not set.");
          if (newContract) {
            await db.delete(contracts).where(eq(contracts.id, newContract.id));
          }
          set.status = 500;
          return {
            success: false,
            error: "E-Mail-Server ist nicht konfiguriert (API Key fehlt). Bitte den Support kontaktieren."
          };
        }

        try {
          const pdfBuffer = fs.readFileSync(pdfPath);
          const emailAttachments: any[] = [
            {
              filename: labels.fileName,
              content: pdfBuffer,
            }
          ];

          try {
            const logoPath = getBrandingPath("buff_interactive.acid-lime_white.png");
            if (fs.existsSync(logoPath)) {
              emailAttachments.push({
                filename: 'logo.png',
                content: fs.readFileSync(logoPath),
                contentId: 'logo'
              });
            }
          } catch (e) {
            console.error("[contracts] Could not attach logo, continuing without it.", e);
          }

          const { data, error } = await resend.emails.send({
            from: "Buff <contracts@no-reply.buffinteractive.net>",
            to: email,
            bcc: process.env["ADMIN_EMAIL"] || "hello@flxk.nz",
            subject: `Willkommen bei Buff | Deine Vertragsunterlagen`,
            html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%; text-align: center;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 0 20px; text-align: left;">
                    <div style="margin-bottom: 48px;">
                      <img src="cid:logo" style="height: 28px; display: block;" alt="Buff Interactive" />
                    </div>
                    <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      Willkommen bei Buff
                    </h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 8px 0;">
                      Hallo ${ansprechpartner},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">
                      vielen Dank für Dein Vertrauen. Wir freuen uns sehr auf die Zusammenarbeit mit <strong style="color: #F5F5F7; font-weight: 600;">${firma}</strong>. Anbei erhältst Du Dein rechtskräftig unterzeichnetes ${labels.docName} und alle Vertragsdokumente als PDF.
                    </p>
                
                    <div style="background-color: #111111; border-radius: 16px; padding: 24px; margin-bottom: 40px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868B;">Details zur Buchung</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">Tarif</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${tarifLabel(tarif)} (${zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">${labels.setupLabel}</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${setupPreisBrutto} €</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-size: 15px; color: #A1A1A6;">${labels.laufendLabel}</td>
                          <td style="padding: 12px 0; font-size: 15px; color: #CCFF00; text-align: right; font-weight: 600;">${laufendPreisBrutto} € / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}</td>
                        </tr>
                      </table>
                    </div>
                
                    <p style="font-size: 14px; line-height: 1.5; color: #86868B; margin: 0 0 40px 0;">
                      Bei Fragen wende Dich bitte direkt an <a href="mailto:service@buffinteractive.net" style="color: #CCFF00; text-decoration: none;">service@buffinteractive.net</a>.<br>
                      Bitte antworte nicht auf diese E-Mail.
                    </p>
                
                    <div style="border-top: 1px solid #222222; padding-top: 24px;">
                      <p style="font-size: 14px; font-weight: 500; color: #F5F5F7; margin: 0;">
                        Beste Grüße<br />
                        Das Team von Buff
                      </p>
                    </div>
                  </div>
                </div>
              `,
            attachments: emailAttachments
          });

          if (error) {
            console.error("[contracts] ❌ Failed to send email (Resend API Error):", error);
            if (newContract) {
              await db.delete(contracts).where(eq(contracts.id, newContract.id));
            }
            set.status = 400;
            return {
              success: false,
              error: "E-Mail konnte nicht versendet werden. Bitte prüfe die E-Mail-Adresse."
            };
          } else {
            console.log("[contracts] 📧 Email sent successfully via Resend:", data);
            // update db to mark email as sent
            if (newContract) {
              await db
                .update(contracts)
                .set({ emailSentAt: new Date() })
                .where(eq(contracts.id, newContract.id));
            }
          }
        } catch (err) {
          console.error("[contracts] ❌ Failed to send email:", err);
          if (newContract) {
            await db.delete(contracts).where(eq(contracts.id, newContract.id));
          }
          set.status = 500;
          return {
            success: false,
            error: "Interner Fehler beim E-Mail-Versand."
          };
        }

        return {
          success: true,
          contractId: newContract?.id
        };
      } catch (globalError) {
        console.error("[contracts] ❌ Critical unhandled error in /generate:", globalError);
        set.status = 500;
        return {
          success: false,
          error: "Ein unerwarteter Serverfehler ist aufgetreten (Fehler bei der Vertragserstellung). Bitte den Support kontaktieren."
        };
      }
    },
    {
      body: t.Object({
        tarif: t.String(),
        zahlungsrhythmus: t.String(),
        setupPreisBrutto: t.Numeric(),
        laufendPreisBrutto: t.Numeric(),
        leistungsbeschreibung: t.Optional(t.String()),
        mindestlaufzeitMonate: t.Optional(t.Numeric()),
        stundensatz: t.Optional(t.Numeric()),
        werbebudgetRichtwert: t.Optional(t.Numeric()),
        firma: t.String(),
        rechtsform: t.String(),
        ansprechpartner: t.String(),
        strasse: t.String(),
        plz: t.String(),
        ort: t.String(),
        email: t.String(),
        telefon: t.Optional(t.String()),
        ustId: t.Optional(t.String()),
        iban: t.String(),
        bic: t.Optional(t.String()),
        bank: t.Optional(t.String()),
        kontoinhaber: t.Optional(t.String()),
        consentB2b: t.Boolean(),
        consentAgb: t.Boolean(),
        consentAvv: t.Boolean(),
        consentMarketing: t.Boolean(),
        signatureSepaB64: t.String(),
        signatureContractB64: t.String(),
        salesUserId: t.String(),
        clientIp: t.Optional(t.String()),
        userAgent: t.Optional(t.String())
      })
    }
  )
  .post(
    "/contracts/create-invite",
    async ({ db, body, headers, set }) => {
      try {
        const {
          tarif,
          setupPreisBrutto,
          laufendPreisBrutto,
          leistungsbeschreibung,
          mindestlaufzeitMonate,
          stundensatz,
          werbebudgetRichtwert,
          customerEmail,
          customerName,
          companyName,
          firma,
          rechtsform,
          ansprechpartner,
          strasse,
          plz,
          ort,
          telefon,
          ustId,
          iban,
          bic,
          bank,
          kontoinhaber,
          salesUserId,
          clientOrigin,
          customerUserId,
          loginUrl
        } = body;
        const zahlungsrhythmus = tarif === "marketing" ? "monatlich" : body.zahlungsrhythmus;
        const labels = docLabels(tarif);
        if (tarif === "marketing" && (!leistungsbeschreibung?.trim() || ![3, 6, 12].includes(Number(mindestlaufzeitMonate)))) {
          set.status = 400;
          return { success: false, error: "Leistungsbeschreibung und Mindestlaufzeit (3/6/12 Monate) sind für Marketing erforderlich." };
        }

        let finalSalesUserId = salesUserId;
        const userExists = await db.query.users.findFirst({
          where: (usersTable, { eq }) => eq(usersTable.id, salesUserId)
        });
        if (!userExists) {
          const firstUser = await db.query.users.findFirst();
          if (firstUser) {
            finalSalesUserId = firstUser.id;
          } else {
            const insertedUsers = await db.insert(users).values({
              id: salesUserId,
              name: "Dev User",
              email: "dev@buffinteractive.net",
              role: "admin"
            }).returning();
            if (insertedUsers[0]) {
              finalSalesUserId = insertedUsers[0].id;
            }
          }
        }

        const token = body.token ?? crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

        const finalCompanyName = companyName || firma || null;
        const finalCustomerName = customerName || ansprechpartner || null;

        const [newInvite] = await db
          .insert(contractSigningRequests)
          .values({
            token,
            salesUserId: finalSalesUserId,
            customerUserId: customerUserId ?? null,
            tarif: tarif as any,
            zahlungsrhythmus: zahlungsrhythmus as any,
            setupPreisBrutto: String(setupPreisBrutto),
            laufendPreisBrutto: String(laufendPreisBrutto),
            leistungsbeschreibung: leistungsbeschreibung || null,
            mindestlaufzeitMonate: mindestlaufzeitMonate ?? null,
            stundensatz: stundensatz != null ? String(stundensatz) : null,
            werbebudgetRichtwert: werbebudgetRichtwert != null ? String(werbebudgetRichtwert) : null,
            customerEmail,
            customerName: finalCustomerName,
            companyName: finalCompanyName,
            rechtsform: rechtsform || null,
            strasse: strasse || null,
            plz: plz || null,
            ort: ort || null,
            telefon: telefon || null,
            ustId: ustId || null,
            iban: iban || null,
            bic: bic || null,
            bank: bank || null,
            kontoinhaber: kontoinhaber || null,
            status: "pending",
            expiresAt
          })
          .returning();

        const webUrl = getWebBaseUrl(headers as Record<string, string | undefined>, clientOrigin);
        const signingUrl = `${webUrl}/sales/order/sign/${token}`;

        // When the caller minted a magic link, the email button logs the
        // customer in and lands them on the signing page — one email, not two.
        const emailCtaUrl = loginUrl || signingUrl;

        // Send email via Resend if configured
        const resend = getResend();
        if (resend) {
          try {
            let logoAttachment: any = null;
            try {
              const logoPath = getBrandingPath("buff_interactive.acid-lime_white.png");
              if (fs.existsSync(logoPath)) {
                logoAttachment = {
                  filename: 'logo.png',
                  content: fs.readFileSync(logoPath),
                  contentId: 'logo'
                };
              }
            } catch (e) {
              // ignore logo if missing
            }

            await resend.emails.send({
              from: "Buff <contracts@no-reply.buffinteractive.net>",
              to: customerEmail,
              bcc: process.env["ADMIN_EMAIL"] || "hello@flxk.nz",
              subject: `Dein Angebot von Buff | Online unterschreiben`,
              html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%; text-align: center;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 0 20px; text-align: left;">
                    <div style="margin-bottom: 48px;">
                      ${logoAttachment ? '<img src="cid:logo" style="height: 28px; display: block;" alt="Buff Interactive" />' : '<h2 style="color: #CCFF00; margin: 0;">Buff Interactive</h2>'}
                    </div>
                    <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      Dein Angebot ist bereit!
                    </h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 8px 0;">
                      Hallo ${finalCustomerName || customerEmail},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">
                      Dein digitales Angebot von Buff Interactive liegt für Dich bereit. Über den folgenden Button kannst Du Dein Angebot in wenigen Minuten bequem online einsehen und unterzeichnen.
                    </p>

                    <div style="background-color: #111111; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868B;">Angebotene Konditionen</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">Tarif</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${tarifLabel(tarif)} (${zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">${labels.setupLabel}</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${setupPreisBrutto} €</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-size: 15px; color: #A1A1A6;">${labels.laufendLabel}</td>
                          <td style="padding: 12px 0; font-size: 15px; color: #CCFF00; text-align: right; font-weight: 600;">${laufendPreisBrutto} € / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="text-align: center; margin: 36px 0;">
                      <a href="${emailCtaUrl}" style="display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(204, 255, 0, 0.25);">
                        Angebot jetzt online unterzeichnen ➔
                      </a>
                    </div>

                    <p style="font-size: 13px; line-height: 1.5; color: #86868B; margin: 32px 0 0 0; text-align: center;">
                      Dieser Link ist gültig bis zum ${expiresAt.toLocaleDateString("de-DE")}.<br>
                      Falls der Button nicht funktioniert, kopiere diesen Link in Deinen Browser:<br>
                      <a href="${emailCtaUrl}" style="color: #CCFF00; word-break: break-all;">${emailCtaUrl}</a>
                    </p>
                  </div>
                </div>
              `,
              attachments: logoAttachment ? [logoAttachment] : []
            });
          } catch (e) {
            console.error("[contracts] Failed to send remote signing invitation email:", e);
          }
        }

        return {
          success: true,
          token,
          signingUrl,
          inviteId: newInvite?.id
        };
      } catch (err) {
        console.error("[contracts] Error creating remote signing invite:", err);
        set.status = 500;
        return {
          success: false,
          error: "Fehler beim Erstellen des Signatur-Links."
        };
      }
    },
    {
      body: t.Object({
        tarif: t.String(),
        zahlungsrhythmus: t.String(),
        setupPreisBrutto: t.Numeric(),
        laufendPreisBrutto: t.Numeric(),
        leistungsbeschreibung: t.Optional(t.String()),
        mindestlaufzeitMonate: t.Optional(t.Numeric()),
        stundensatz: t.Optional(t.Numeric()),
        werbebudgetRichtwert: t.Optional(t.Numeric()),
        customerEmail: t.String(),
        customerName: t.Optional(t.String()),
        companyName: t.Optional(t.String()),
        firma: t.Optional(t.String()),
        rechtsform: t.Optional(t.String()),
        ansprechpartner: t.Optional(t.String()),
        strasse: t.Optional(t.String()),
        plz: t.Optional(t.String()),
        ort: t.Optional(t.String()),
        telefon: t.Optional(t.String()),
        ustId: t.Optional(t.String()),
        iban: t.Optional(t.String()),
        bic: t.Optional(t.String()),
        bank: t.Optional(t.String()),
        kontoinhaber: t.Optional(t.String()),
        salesUserId: t.String(),
        clientOrigin: t.Optional(t.String()),
        customerUserId: t.Optional(t.String()),
        loginUrl: t.Optional(t.String()),
        token: t.Optional(t.String())
      })
    }
  )
  .get("/contracts/invite/:token", async ({ db, params, set }) => {
    try {
      const invite = await db.query.contractSigningRequests.findFirst({
        where: (tbl, { eq }) => eq(tbl.token, params.token)
      });

      if (!invite) {
        set.status = 404;
        return { success: false, error: "Signatur-Link nicht gefunden." };
      }

      if (invite.status !== "pending") {
        set.status = 410;
        return { success: false, error: "Dieser Signatur-Link wurde bereits verwendet." };
      }

      if (new Date(invite.expiresAt) < new Date()) {
        set.status = 410;
        return { success: false, error: "Dieser Signatur-Link ist abgelaufen." };
      }

      return {
        success: true,
        invite: {
          token: invite.token,
          tarif: invite.tarif,
          zahlungsrhythmus: invite.zahlungsrhythmus,
          setupPreisBrutto: Number(invite.setupPreisBrutto),
          laufendPreisBrutto: Number(invite.laufendPreisBrutto),
          leistungsbeschreibung: invite.leistungsbeschreibung,
          mindestlaufzeitMonate: invite.mindestlaufzeitMonate,
          stundensatz: invite.stundensatz != null ? Number(invite.stundensatz) : null,
          werbebudgetRichtwert: invite.werbebudgetRichtwert != null ? Number(invite.werbebudgetRichtwert) : null,
          customerEmail: invite.customerEmail,
          customerName: invite.customerName,
          companyName: invite.companyName,
          rechtsform: invite.rechtsform,
          strasse: invite.strasse,
          plz: invite.plz,
          ort: invite.ort,
          telefon: invite.telefon,
          ustId: invite.ustId,
          iban: invite.iban,
          bic: invite.bic,
          bank: invite.bank,
          kontoinhaber: invite.kontoinhaber,
          salesUserId: invite.salesUserId,
          expiresAt: invite.expiresAt
        }
      };
    } catch (err) {
      console.error("[contracts] Error fetching invite:", err);
      set.status = 500;
      return { success: false, error: "Fehler beim Abrufen des Signatur-Links." };
    }
  })
  .post(
    "/contracts/sign-remote",
    async ({ db, body, headers, set }) => {
      try {
        const {
          token,
          firma, rechtsform, ansprechpartner, strasse, plz, ort, email, telefon, ustId,
          iban, bic, bank, kontoinhaber,
          consentB2b, consentAgb, consentAvv, consentMarketing,
          signatureSepaB64, signatureContractB64,
          clientIp, userAgent,
          overrideTarif, overrideZahlungsrhythmus
        } = body;

        const invite = await db.query.contractSigningRequests.findFirst({
          where: (tbl, { eq }) => eq(tbl.token, token)
        });

        if (!invite || invite.status !== "pending" || new Date(invite.expiresAt) < new Date()) {
          set.status = 400;
          return { success: false, error: "Der Signatur-Link ist ungültig oder abgelaufen." };
        }

        let tarif: string = invite.tarif;
        let zahlungsrhythmus: string = invite.zahlungsrhythmus;
        let setupPreisBrutto: string | number = invite.setupPreisBrutto;
        let laufendPreisBrutto: string | number = invite.laufendPreisBrutto;
        const { leistungsbeschreibung, mindestlaufzeitMonate, stundensatz, werbebudgetRichtwert } = invite;

        let finalSalesUserId = invite.salesUserId;
        const userExists = await db.query.users.findFirst({
          where: (usersTable, { eq }) => eq(usersTable.id, invite.salesUserId)
        });
        if (!userExists) {
          const firstUser = await db.query.users.findFirst();
          if (firstUser) {
            finalSalesUserId = firstUser.id;
          }
        }

        // Apply and validate override logic (nicht für marketing: individuelle Preise, kein Upgrade-Pfad)
        if (invite.tarif !== "marketing" && overrideTarif && overrideZahlungsrhythmus) {
          const configKeys = Object.keys(PRICING_CONFIG.plans) as Array<keyof typeof PRICING_CONFIG.plans>;
          const originalIndex = configKeys.indexOf(invite.tarif as any);
          const overrideIndex = configKeys.indexOf(overrideTarif as any);

          if (overrideIndex >= 0 && overrideIndex >= originalIndex) {
            tarif = overrideTarif;
            zahlungsrhythmus = overrideZahlungsrhythmus;
            const selectedPlan = PRICING_CONFIG.plans[overrideTarif as keyof typeof PRICING_CONFIG.plans];
            setupPreisBrutto = selectedPlan.setupFee;
            laufendPreisBrutto = overrideZahlungsrhythmus === "monatlich" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
          }
        }

        const labels = docLabels(tarif);
        const derivedUserAgent = userAgent || headers["user-agent"] || "Unbekannt";
        const derivedClientIp = clientIp || headers["x-forwarded-for"] || "Unbekannt";

        const signedAt = new Date();

        const termsMd = readLegalFile("terms.md");
        const avvMd = readLegalFile("avv.md");
        const mandatsreferenz = `${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
        const sepaMd = readLegalFile("sepa_mandat.md").replace("Wird separat mitgeteilt", mandatsreferenz);

        let logoDataUrl = "";
        try {
          const logoPath = getBrandingPath("buff_interactive.acid-lime_white.png");
          if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
          }
        } catch (err) {
          console.error("[contracts] Failed to read branding logo PNG:", err);
        }

        const docDefinition = {
          defaultStyle: { font: 'Helvetica', fontSize: 10 },
          content: [
            logoDataUrl ? {
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      image: logoDataUrl,
                      width: 180,
                      alignment: 'center',
                      margin: [0, 15, 0, 15]
                    }
                  ]
                ]
              },
              layout: 'noBorders',
              fillColor: '#0A0A0A',
              margin: [-40, -40, -40, 20]
            } : undefined,
            { text: `${labels.title} (Digitaler Online-Fernabschluss)`, style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },

            { text: '1. Kundendaten', style: 'subheader', margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Firma', firma],
                  ['Rechtsform', rechtsform],
                  ['Ansprechpartner', ansprechpartner],
                  ['Straße, Hausnummer', strasse],
                  ['PLZ, Ort', `${plz} ${ort}`],
                  ['E-Mail', email],
                  ['Telefon', telefon || '-'],
                  ['USt-ID', ustId || '-']
                ]
              }
            },

            ...buildLeistungsBlock({ tarif, zahlungsrhythmus, setupPreisBrutto, laufendPreisBrutto, leistungsbeschreibung, mindestlaufzeitMonate, stundensatz, werbebudgetRichtwert }),

            { text: '3. SEPA-Lastschriftmandat', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: 'Gläubiger-Identifikationsnummer: DE15WEB00002924152' },
            { text: `Mandatsreferenz: ${mandatsreferenz}` },
            { text: 'Ich ermächtige die Felix Kinze & Leon Trepesch GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von der Felix Kinze & Leon Trepesch GbR auf mein Konto gezogenen Lastschriften einzulösen.', margin: [0, 5, 0, 5] },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Kontoinhaber', kontoinhaber || ansprechpartner],
                  ['IBAN', iban],
                  ['BIC', bic || '-'],
                  ['Bank', bank || '-']
                ]
              }
            },
            { text: 'Erteilung SEPA-Mandat:', margin: [0, 10, 0, 5] },
            signatureSepaB64 && signatureSepaB64.startsWith("data:image/") ? { image: signatureSepaB64, width: 200, margin: [0, 0, 0, 5] } : { text: '[X] Elektronisch erteiltes SEPA-Lastschriftmandat (Online Mandat gemäß EPC Direct Debit Scheme)', fontSize: 9, bold: true, color: '#059669', margin: [0, 4, 0, 5] },
            { text: `${ort}, den ${signedAt.toLocaleDateString("de-DE")} ${signedAt.toLocaleTimeString("de-DE")} UTC`, margin: [0, 0, 0, 20], fontSize: 9 },

            { text: '4. Vertragsabschluss & Einverständniserklärungen', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: `[${consentB2b ? 'X' : ' '}] B2B-Bestätigung` },
            { text: `[${consentAgb ? 'X' : ' '}] AGB akzeptiert (${labels.agbTeile})` },
            { text: `[${consentAvv ? 'X' : ' '}] AVV abgeschlossen` },
            { text: `[${consentMarketing ? 'X' : ' '}] Marketing-Einwilligung` },

            { text: 'Rechtsverbindlicher Vertragsabschluss:', margin: [0, 10, 0, 5] },
            signatureContractB64 && signatureContractB64.startsWith("data:image/") ? { image: signatureContractB64, width: 200, margin: [0, 0, 0, 5] } : {
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      stack: [
                        { text: 'ELEKTRONISCH GEZEICHNET & VERIFIZIERT', bold: true, fontSize: 9, color: '#059669' },
                        { text: `Simple Electronic Signature (EES) gemäß EU eIDAS-Verordnung (Nr. 910/2014) & § 312j Abs. 3 BGB`, fontSize: 8, color: '#374151', margin: [0, 2, 0, 4] },
                        { text: `Gezeichnet durch: ${ansprechpartner} (${email})`, fontSize: 8 },
                        { text: `Zeitstempel: ${signedAt.toLocaleDateString("de-DE")} ${signedAt.toLocaleTimeString("de-DE")} UTC`, fontSize: 8 },
                        { text: `Signatur-Token: ${token}`, fontSize: 8, color: '#6B7280' }
                      ],
                      fillColor: '#F0FDF4',
                      borderColor: '#10B981',
                      margin: [8, 8, 8, 8]
                    }
                  ]
                ]
              },
              margin: [0, 4, 0, 10]
            },
            { text: `${ort}, den ${signedAt.toLocaleDateString("de-DE")} ${signedAt.toLocaleTimeString("de-DE")} UTC`, margin: [0, 0, 0, 10], fontSize: 9 },


            { text: 'Audit-Trail (Digitaler Online-Fernabschluss)', style: 'subheader', margin: [0, 20, 0, 5], fontSize: 8, color: 'gray' },
            { text: `Signatur-Token: ${token}`, fontSize: 8, color: 'gray' },
            { text: `IP-Adresse: ${derivedClientIp}`, fontSize: 8, color: 'gray' },
            { text: `User-Agent: ${derivedUserAgent}`, fontSize: 8, color: 'gray' },
            { text: `Sales User ID: ${finalSalesUserId}`, fontSize: 8, color: 'gray' },
            { text: `Gezeichnet am: ${signedAt.toUTCString()}`, fontSize: 8, color: 'gray' },

            { text: 'Anhang 1: Allgemeine Geschäftsbedingungen (AGB)', style: 'subheader', pageBreak: 'before', margin: [0, 15, 0, 10] },
            ...parseMarkdownToPdfmake(termsMd),

            { text: 'Anhang 2: Vertrag zur Auftragsverarbeitung (AVV)', style: 'subheader', pageBreak: 'before', margin: [0, 15, 0, 10] },
            ...parseMarkdownToPdfmake(avvMd)
          ].filter(Boolean),
          styles: {
            header: { fontSize: 18, bold: true },
            subheader: { fontSize: 14, bold: true }
          }
        };

        const pdfDoc = pdfmake.createPdf(docDefinition);
        const contractsDir = path.join(process.cwd(), 'contracts');
        if (!fs.existsSync(contractsDir)) {
          fs.mkdirSync(contractsDir, { recursive: true });
        }
        const pdfFilename = `contract_remote_${Date.now()}.pdf`;
        const pdfPath = path.join(contractsDir, pdfFilename);
        await pdfDoc.write(pdfPath);

        const [newContract] = await db
          .insert(contracts)
          .values({
            tarif: tarif as any,
            zahlungsrhythmus: zahlungsrhythmus as any,
            setupPreisBrutto: String(setupPreisBrutto),
            laufendPreisBrutto: String(laufendPreisBrutto),
            leistungsbeschreibung,
            mindestlaufzeitMonate,
            stundensatz,
            werbebudgetRichtwert,
            firma,
            rechtsform,
            ansprechpartner,
            strasse,
            plz,
            ort,
            email,
            telefon: telefon || null,
            ustId: ustId || null,
            iban,
            bic: bic || null,
            bank: bank || null,
            kontoinhaber: kontoinhaber || null,
            consentB2b,
            consentAgb,
            consentAvv,
            consentMarketing: Boolean(consentMarketing),
            signatureSepaB64,
            signatureContractB64,
            salesUserId: finalSalesUserId,
            customerUserId: invite.customerUserId ?? null,
            clientIp: derivedClientIp || null,
            userAgent: derivedUserAgent || null,
            signedAt,
            pdfPath,
            pdfFilename
          })
          .returning();

        // Update invite status
        await db
          .update(contractSigningRequests)
          .set({
            status: "signed",
            contractId: newContract?.id,
            updatedAt: new Date()
          })
          .where(eq(contractSigningRequests.token, token));

        const resend = getResend();
        if (resend) {
          try {
            const pdfBuffer = fs.readFileSync(pdfPath);
            const emailAttachments: any[] = [
              {
                filename: labels.fileName,
                content: pdfBuffer,
              }
            ];

            try {
              const logoPath = getBrandingPath("buff_interactive.acid-lime_white.png");
              if (fs.existsSync(logoPath)) {
                emailAttachments.push({
                  filename: 'logo.png',
                  content: fs.readFileSync(logoPath),
                  contentId: 'logo'
                });
              }
            } catch (e) {
              console.error("[contracts] Could not attach logo.", e);
            }

            await resend.emails.send({
              from: "Buff <contracts@no-reply.buffinteractive.net>",
              to: email,
              bcc: process.env["ADMIN_EMAIL"] || "hello@flxk.nz",
              subject: `Willkommen bei Buff | Deine Vertragsunterlagen`,
              html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%; text-align: center;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 0 20px; text-align: left;">
                    <div style="margin-bottom: 48px;">
                      <img src="cid:logo" style="height: 28px; display: block;" alt="Buff Interactive" />
                    </div>
                    <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      Willkommen bei Buff
                    </h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 8px 0;">
                      Hallo ${ansprechpartner},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">
                      vielen Dank für die digitale Unterzeichnung Deines Vertrags. Wir freuen uns sehr auf die Zusammenarbeit mit <strong style="color: #F5F5F7; font-weight: 600;">${firma}</strong>. Anbei erhältst Du Dein rechtskräftig unterzeichnetes ${labels.docName} und alle Vertragsdokumente als PDF.
                    </p>

                    <div style="background-color: #111111; border-radius: 16px; padding: 24px; margin-bottom: 40px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868B;">Details zur Buchung</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">Tarif</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${tarifLabel(tarif)} (${zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">${labels.setupLabel}</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${setupPreisBrutto} €</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-size: 15px; color: #A1A1A6;">${labels.laufendLabel}</td>
                          <td style="padding: 12px 0; font-size: 15px; color: #CCFF00; text-align: right; font-weight: 600;">${laufendPreisBrutto} € / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size: 14px; line-height: 1.5; color: #86868B; margin: 0 0 40px 0;">
                      Bei Fragen wende Dich bitte direkt an <a href="mailto:service@buffinteractive.net" style="color: #CCFF00; text-decoration: none;">service@buffinteractive.net</a>.
                    </p>

                    <div style="border-top: 1px solid #222222; padding-top: 24px;">
                      <p style="font-size: 14px; font-weight: 500; color: #F5F5F7; margin: 0;">
                        Beste Grüße<br />
                        Das Team von Buff
                      </p>
                    </div>
                  </div>
                </div>
              `,
              attachments: emailAttachments
            });

            if (newContract) {
              await db
                .update(contracts)
                .set({ emailSentAt: new Date() })
                .where(eq(contracts.id, newContract.id));
            }
          } catch (err) {
            console.error("[contracts] Error sending remote completion email:", err);
          }
        }

        return {
          success: true,
          contractId: newContract?.id
        };
      } catch (globalError: any) {
        console.error("[contracts] Error in /sign-remote:", globalError);
        set.status = 500;
        return {
          success: false,
          error: globalError?.message || "Ein Fehler ist bei der digitalen Unterzeichnung aufgetreten."
        };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        firma: t.String(),
        rechtsform: t.String(),
        ansprechpartner: t.String(),
        strasse: t.String(),
        plz: t.String(),
        ort: t.String(),
        email: t.String(),
        telefon: t.Optional(t.String()),
        ustId: t.Optional(t.String()),
        iban: t.String(),
        bic: t.Optional(t.String()),
        bank: t.Optional(t.String()),
        kontoinhaber: t.Optional(t.String()),
        consentB2b: t.Boolean(),
        consentAgb: t.Boolean(),
        consentAvv: t.Boolean(),
        consentMarketing: t.Optional(t.Boolean()),
        signatureSepaB64: t.String(),
        signatureContractB64: t.String(),
        overrideTarif: t.Optional(t.String()),
        overrideZahlungsrhythmus: t.Optional(t.String()),
        clientIp: t.Optional(t.String()),
        userAgent: t.Optional(t.String())
      })
    }
  );

function parseMarkdownToPdfmake(md: string): any[] {
  const content: any[] = [];
  if (!md) return content;

  const lines = md.split(/\r?\n/);
  let currentParagraph = "";

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      content.push({ text: currentParagraph.trim(), margin: [0, 4, 0, 4], fontSize: 9, color: '#333333' });
      currentParagraph = "";
    }
  };

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    // Horizontal divider
    if (line === "---" || line === "***") {
      flushParagraph();
      content.push({
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 500, y2: 5, lineWidth: 0.5, lineColor: '#E2E8F0' }],
        margin: [0, 10, 0, 10]
      });
      continue;
    }

    // Simple cleanups for inline markdown formatting
    line = line
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold marks
      .replace(/\*(.*?)\*/g, "$1")     // Remove italic marks
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)"); // Format links

    // Headers
    if (line.startsWith("#")) {
      flushParagraph();
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, "");
      let fontSize = 10;
      let margin = [0, 6, 0, 3];
      if (level === 1) {
        fontSize = 13;
        margin = [0, 10, 0, 5];
      } else if (level === 2) {
        fontSize = 11;
        margin = [0, 8, 0, 4];
      }
      content.push({ text, bold: true, fontSize, margin });
    }
    // Lists
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      const text = line.replace(/^[-*]\s*/, "");
      content.push({ text, margin: [12, 2, 0, 2], fontSize: 9, color: '#333333', leadingIndent: 8 });
    }
    else if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      content.push({ text: line, margin: [12, 2, 0, 2], fontSize: 9, color: '#333333', leadingIndent: 8 });
    }
    // Regular text
    else {
      if (currentParagraph) {
        currentParagraph += " " + line;
      } else {
        currentParagraph = line;
      }
    }
  }

  flushParagraph();
  return content;
}
