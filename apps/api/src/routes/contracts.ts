import Elysia, { t } from "elysia";
import { Resend } from "resend";
import { dbPlugin } from "../plugins/db.js";
import { contracts, users } from "@platform/db/schema"; // need to import the schema
import { eq } from "@platform/db";
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

export const contractsRoutes = new Elysia({ prefix: "/v1" })
  .use(dbPlugin)
  .post(
    "/contracts/generate",
    async ({ db, body, headers, request, set }) => {
      try {
        const {
          tarif, zahlungsrhythmus, setupPreisBrutto, laufendPreisBrutto,
          firma, ansprechpartner, strasse, plz, ort, email, telefon, ustId,
          iban, bic, bank, kontoinhaber,
          consentB2b, consentAgb, consentAvv, consentMarketing,
          signatureSepaB64, signatureContractB64,
          salesUserId, clientIp, userAgent
        } = body;

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

        const mandatsreferenz = `MANDAT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
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
            { text: 'WaaS Bestellformular', style: 'header', alignment: 'center', margin: [0, 10, 0, 20] },

            { text: '1. Kundendaten', style: 'subheader', margin: [0, 10, 0, 5] },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Firma', firma],
                  ['Ansprechpartner', ansprechpartner],
                  ['Straße, Hausnummer', strasse],
                  ['PLZ, Ort', `${plz} ${ort}`],
                  ['E-Mail', email],
                  ['Telefon', telefon || '-'],
                  ['USt-ID', ustId || '-']
                ]
              }
            },

            { text: '2. Leistungsbeschreibung & Vergütung', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: `Tarif: ${tarif.charAt(0).toUpperCase() + tarif.slice(1)}` },
            { text: `Zahlungsrhythmus: ${zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'}` },
            { text: `Einmalgebühr: ${setupPreisBrutto} € inkl. MwSt.` },
            { text: `Laufende Gebühr: ${laufendPreisBrutto} € inkl. MwSt. / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}` },

            { text: '3. SEPA-Lastschriftmandat', style: 'subheader', margin: [0, 20, 0, 5] },
            { text: 'Gläubiger-Identifikationsnummer: DE15WEB00002924152' },
            { text: `Mandatsreferenz: ${mandatsreferenz}` },
            { text: 'Ich ermächtige die Buff Interactive GbR, Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von der Buff Interactive GbR auf mein Konto gezogenen Lastschriften einzulösen.', margin: [0, 5, 0, 5] },
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
            { text: `[${consentAgb ? 'X' : ' '}] AGB akzeptiert` },
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
            firma, ansprechpartner, strasse, plz, ort, email,
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
        if (resend) {
          try {
            const pdfBuffer = fs.readFileSync(pdfPath);
            const emailAttachments: any[] = [
              {
                filename: 'Vertrag_Buff_Interactive.pdf',
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
              subject: `Ihre Vertragsunterlagen - Buff Interactive`,
              html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%; text-align: center;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 0 20px; text-align: left;">
                    <div style="margin-bottom: 48px;">
                      <img src="cid:logo" style="height: 28px; display: block;" alt="Buff Interactive" />
                    </div>
                    <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">
                      Willkommen bei Buff.
                    </h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 8px 0;">
                      Hallo ${ansprechpartner},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">
                      vielen Dank für Dein Vertrauen. Wir freuen uns sehr auf die Zusammenarbeit mit <strong style="color: #F5F5F7; font-weight: 600;">${firma}</strong>. Anbei erhältst Du Dein rechtskräftig unterzeichnetes WaaS-Bestellformular als PDF.
                    </p>
                
                    <div style="background-color: #111111; border-radius: 16px; padding: 24px; margin-bottom: 40px;">
                      <h3 style="margin: 0 0 16px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #86868B;">Details zur Buchung</h3>
                      
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">Tarif</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${tarif.charAt(0).toUpperCase() + tarif.slice(1)} (${zahlungsrhythmus === 'jaehrlich' ? 'Jährlich' : 'Monatlich'})</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #A1A1A6;">Einmalgebühr</td>
                          <td style="padding: 12px 0; border-bottom: 1px solid #222222; font-size: 15px; color: #F5F5F7; text-align: right; font-weight: 500;">${setupPreisBrutto} €</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-size: 15px; color: #A1A1A6;">Laufende Gebühr</td>
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
        firma: t.String(),
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
