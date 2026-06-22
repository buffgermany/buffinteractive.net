import Elysia, { t } from "elysia";
import { Resend } from "resend";
import { dbPlugin } from "../plugins/db.js";
import { contracts, users } from "@platform/db/schema"; // need to import the schema
import { eq } from "@platform/db";
import pdfmake from "pdfmake";
import fs from "fs";
import path from "path";

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
    async ({ db, body, headers, request }) => {
      const {
        tarif, zahlungsrhythmus, setupPreisNetto, laufendPreisNetto,
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
          { text: `Tarif: ${tarif.toUpperCase()}` },
          { text: `Zahlungsrhythmus: ${zahlungsrhythmus}` },
          { text: `Einmalige Setup-Gebühr: ${setupPreisNetto} € netto` },
          { text: `Laufende Pauschale: ${laufendPreisNetto} € netto / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}` },

          { text: '3. SEPA-Lastschriftmandat', style: 'subheader', margin: [0, 20, 0, 5] },
          { text: 'Gläubiger-Identifikationsnummer: DE15WEB00002924152' },
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
          { image: signatureSepaB64, width: 200, margin: [0, 0, 0, 20] },

          { text: '4. Vertragsabschluss & Einverständniserklärungen', style: 'subheader', margin: [0, 20, 0, 5] },
          { text: `[${consentB2b ? 'X' : ' '}] B2B-Bestätigung` },
          { text: `[${consentAgb ? 'X' : ' '}] AGB akzeptiert` },
          { text: `[${consentAvv ? 'X' : ' '}] AVV abgeschlossen` },
          { text: `[${consentMarketing ? 'X' : ' '}] Marketing-Einwilligung` },

          { text: 'Rechtsverbindliche Unterschrift:', margin: [0, 10, 0, 5] },
          { image: signatureContractB64, width: 200, margin: [0, 0, 0, 10] },

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
          setupPreisNetto: String(setupPreisNetto),
          laufendPreisNetto: String(laufendPreisNetto),
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
          const { data, error } = await resend.emails.send({
            from: "Buff <no-reply@buffinteractive.net>",
            to: email,
            bcc: process.env["ADMIN_EMAIL"] || "hello@flxk.nz",
            subject: `Ihre Vertragsunterlagen - Buff Interactive`,
            html: `
              <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #0A0A0A; color: #FFFFFF; padding: 40px 20px; text-align: center;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1A1A1A; border: 1px solid #2C2C2C; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                  <div style="margin-bottom: 32px;">
                    <img src="cid:logo" style="height: 32px;" alt="Buff Interactive" />
                  </div>
                  <h2 style="font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px; color: #FFFFFF; border-bottom: 2px solid #CCFF00; padding-bottom: 12px;">Willkommen bei Buff Interactive!</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #D1D1D6; margin-bottom: 24px;">Hallo ${ansprechpartner},</p>
                  <p style="font-size: 16px; line-height: 1.6; color: #D1D1D6; margin-bottom: 24px;">vielen Dank für Ihr Vertrauen. Wir freuen uns sehr auf die Zusammenarbeit mit der <strong>${firma}</strong>!</p>
                  <p style="font-size: 15px; line-height: 1.6; color: #A0A0B0; margin-bottom: 32px;">Anbei finden Sie das rechtskräftig unterzeichnete Bestellformular für Ihren Web-as-a-Service (WaaS) Tarif als PDF-Dokument im Anhang zu Ihrer bequemen Ablage.</p>
                  <div style="background: rgba(204, 255, 0, 0.05); border: 1px solid rgba(204, 255, 0, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                    <h4 style="margin: 0 0 10px 0; color: #CCFF00; font-size: 14px; text-transform: uppercase; tracking-wider: 0.1em; font-family: sans-serif;">Details Ihrer Buchung</h4>
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #FFFFFF;"><strong>Tarif:</strong> ${tarif.toUpperCase()} (${zahlungsrhythmus})</p>
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #FFFFFF;"><strong>Einmaliges Setup:</strong> ${setupPreisNetto} € netto</p>
                    <p style="margin: 0; font-size: 14px; color: #FFFFFF;"><strong>Laufende Gebühr:</strong> ${laufendPreisNetto} € netto / ${zahlungsrhythmus === 'monatlich' ? 'Monat' : 'Jahr'}</p>
                  </div>
                  <div style="border-top: 1px solid #2C2C2C; padding-top: 24px; font-size: 14px; color: #8E8E93;">
                    Mit freundlichen Grüßen<br/>
                    <span style="color: #CCFF00; font-weight: 700;">Ihr Team von Buff Interactive</span>
                  </div>
                </div>
              </div>
            `,
            attachments: [
              {
                filename: 'Vertrag_Buff_Interactive.pdf',
                content: pdfBuffer,
              },
              {
                filename: 'logo.png',
                content: fs.readFileSync(getBrandingPath("buff_interactive.acid-lime_white.png")),
                contentId: 'logo'
              }
            ]
          });

          if (error) {
            console.error("[contracts] ❌ Failed to send email (Resend API Error):", error);
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
        }
      }

      return {
        success: true,
        contractId: newContract?.id
      };
    },
    {
      body: t.Object({
        tarif: t.String(),
        zahlungsrhythmus: t.String(),
        setupPreisNetto: t.Numeric(),
        laufendPreisNetto: t.Numeric(),
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
