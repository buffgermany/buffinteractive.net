import { Resend } from "resend";

// Web sends AUTH mail (magic link, password). apps/api sends CONTRACT mail.
// Two senders, two concerns — deliberately not a shared abstraction.

const FROM = "Buff <login@no-reply.buffinteractive.net>";

let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env["RESEND_API_KEY"];
  cached = key ? new Resend(key) : null;
  if (!cached) {
    console.warn("[mail] RESEND_API_KEY not set — auth email will be logged, not sent.");
  }
  return cached;
}

export type AuthEmail = {
  to: string;
  subject: string;
  heading: string;
  bodyHtml: string;
  ctaLabel: string;
  ctaUrl: string;
};

function shell(e: AuthEmail): string {
  return `
  <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #F5F5F7; padding: 60px 0; width: 100%;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #000000; padding: 40px 24px; text-align: left; border-radius: 20px;">
      <h2 style="color: #CCFF00; margin: 0 0 40px 0; font-size: 20px;">Buff Interactive</h2>
      <h1 style="font-size: 26px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 16px 0; color: #FFFFFF;">${e.heading}</h1>
      <div style="font-size: 16px; line-height: 1.6; color: #A1A1A6; margin: 0 0 32px 0;">${e.bodyHtml}</div>
      <div style="text-align: center; margin: 36px 0;">
        <a href="${e.ctaUrl}" style="display: inline-block; background-color: #CCFF00; color: #000000; font-weight: 700; font-size: 16px; padding: 16px 36px; border-radius: 12px; text-decoration: none;">${e.ctaLabel}</a>
      </div>
      <p style="font-size: 13px; line-height: 1.5; color: #86868B; margin: 32px 0 0 0; text-align: center;">
        Falls der Button nicht funktioniert, kopiere diesen Link in Deinen Browser:<br>
        <a href="${e.ctaUrl}" style="color: #CCFF00; word-break: break-all;">${e.ctaUrl}</a>
      </p>
    </div>
  </div>`;
}

export async function sendAuthEmail(e: AuthEmail): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.log(`[mail] would send "${e.subject}" to ${e.to}: ${e.ctaUrl}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: e.to,
      subject: e.subject,
      html: shell(e),
    });
  } catch (err) {
    // Matches the existing contract-mail behaviour: a send failure must not
    // roll back the action that triggered it.
    console.error("[mail] send failed:", err);
  }
}
