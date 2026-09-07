import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders }).catch(() => null);

  if (!session?.user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { password } = await request.json();

  if (typeof password !== "string" || password.length < 10) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 10 Zeichen lang sein." },
      { status: 400 }
    );
  }

  try {
    await auth.api.setPassword({
      body: { newPassword: password },
      headers: requestHeaders,
    });
  } catch (err) {
    console.error("[set-password] failed:", err);
    return NextResponse.json(
      { error: "Passwort konnte nicht gesetzt werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
