import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { captureMagicLink } from "@/lib/magic-link-capture";
import {
  requireAdmin,
  resolveOrCreateCustomer,
  AdminRequiredError,
} from "@/lib/account";

export const dynamic = "force-dynamic";

/**
 * Orchestrates an offer send:
 *   1. resolve or create the customer account
 *   2. mint a magic link that lands on the signing page
 *   3. hand both to apps/api, which stores the invite and sends ONE email
 */
export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    if (err instanceof AdminRequiredError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    throw err;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ungültige Anfrage." },
      { status: 400 }
    );
  }
  const customerEmail: string = (body.customerEmail ?? "").trim();

  if (!customerEmail.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Bitte gib eine gültige Kunden-E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  let customer;
  let accountCreated = false;
  try {
    const resolved = await resolveOrCreateCustomer({
      email: customerEmail,
      name: body.ansprechpartner || body.customerName || null,
      company: body.firma || body.companyName || null,
      phone: body.telefon || null,
    });
    customer = resolved.user;
    accountCreated = resolved.created;
  } catch (err) {
    console.error("[sales/invite] account resolution failed:", err);
    return NextResponse.json(
      { success: false, error: "Kundenkonto konnte nicht angelegt werden." },
      { status: 500 }
    );
  }

  const apiUrl = process.env["API_URL"] ?? process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  const origin = process.env["NEXT_PUBLIC_WEB_URL"] ?? new URL(request.url).origin;

  // Generate the token here so the magic link can point at the signing page
  // before the invite row exists.
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const signingUrl = `${origin}/sales/order/sign/${token}`;

  let loginUrl: string;
  try {
    loginUrl = await captureMagicLink(async () =>
      auth.api.signInMagicLink({
        body: { email: customer.email, callbackURL: signingUrl },
        headers: await headers(),
      })
    );
  } catch (err) {
    console.error("[sales/invite] magic link mint failed:", err);
    return NextResponse.json(
      { success: false, error: "Login-Link konnte nicht erzeugt werden." },
      { status: 500 }
    );
  }

  const inviteRes = await fetch(`${apiUrl}/v1/contracts/create-invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      token,
      customerEmail,
      customerUserId: customer.id,
      salesUserId: admin.id,
      loginUrl,
      clientOrigin: origin,
    }),
  });

  const invite = await inviteRes.json();
  if (!inviteRes.ok || !invite.success) {
    return NextResponse.json(
      { success: false, error: invite.error ?? "Fehler beim Erstellen des Signatur-Links." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    token: invite.token,
    signingUrl: invite.signingUrl ?? signingUrl,
    customerUserId: customer.id,
    accountCreated,
  });
}
