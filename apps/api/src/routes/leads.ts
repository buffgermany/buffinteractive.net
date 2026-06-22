import Elysia, { t } from "elysia";
import { Resend } from "resend";
import { dbPlugin } from "../plugins/db.js";
import { leads } from "@platform/db";

// ============================================================
// Leads / Contact Routes
// Handles the "Mad Libs" contact form submissions.
// ============================================================

// Lazy-init Resend only if key exists
const getResend = () => {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return null;
  return new Resend(key);
};

export const leadsRoutes = new Elysia({ prefix: "/v1" })
  .use(dbPlugin)

  // ----------------------------------------------------------
  // POST /v1/leads — Submit a contact form
  // ----------------------------------------------------------
  .post(
    "/leads",
    async ({ db, body, set }) => {
      const { name, company, problemArea, action, email } = body;

      // 1. Store in database
      const [newLead] = await db
        .insert(leads)
        .values({
          name,
          company,
          problemArea,
          action,
          email,
        })
        .returning();

      // 2. Send email notification (async - don't block response)
      // We wrap it in a try-catch to ensure lead creation still succeeds if email fails.
      const resend = getResend();
      if (resend) {
        resend.emails.send({
          from: "Buff <contracts@no-reply.buffinteractive.net>", // Or a verified domain
          to: process.env["ADMIN_EMAIL"] || "hello@flxk.nz",
          subject: `New Lead: ${name} from ${company}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
              <h2>New Lead Received</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Problem Area:</strong> ${problemArea}</p>
              <p><strong>Required Action:</strong> ${action}</p>
              <hr />
              <p><small>Submitted at ${new Date().toLocaleString()}</small></p>
            </div>
          `,
        }).catch(err => {
          console.error("[leads] ❌ Failed to send email notification:", err);
        });
      } else {
        console.warn("[leads] ⚠️ RESEND_API_KEY missing, skipping email notification.");
      }

      return {
        success: true,
        data: newLead,
      };
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        company: t.String({ minLength: 1 }),
        problemArea: t.String({ minLength: 1 }),
        action: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  );
