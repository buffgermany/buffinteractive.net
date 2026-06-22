import { Resend } from "resend";

async function testEmail() {
  const key = process.env.RESEND_API_KEY;
  console.log("Resend API Key exists?", !!key);
  console.log("Resend API Key length:", key ? key.length : 0);
  console.log("Resend API Key starting with:", key ? key.substring(0, 5) : "none");

  if (!key) {
    console.error("RESEND_API_KEY not defined in process.env!");
    return;
  }

  const resend = new Resend(key);
  console.log("Sending email via Resend...");
  try {
    const result = await resend.emails.send({
      from: "Buff <contracts@no-reply.buffinteractive.net>",
      to: "tona4a+testbuff@gmail.com",
      subject: "Test Email from Buff API",
      html: "<p>This is a test email.</p>"
    });
    console.log("Result:", result);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

testEmail();
