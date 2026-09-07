import fs from "fs";
import path from "path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { needsPassword } from "@/lib/account";
import { RemoteInviteData } from "@/components/sales/RemoteOrderFormFlow";
import { RemoteSignClientWrapper } from "@/components/sales/RemoteSignClientWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import { AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

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
  return `${filename} konnte nicht geladen werden.`;
}

export default async function RemoteSignOrderPage({ params }: PageProps) {
  const { token } = await params;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  let inviteData: RemoteInviteData | null = null;
  let errorMessage = "";

  try {
    const res = await fetch(`${apiUrl}/v1/contracts/invite/${token}`, {
      cache: "no-store"
    });
    const json = await res.json();

    if (res.ok && json.success) {
      inviteData = json.invite;
    } else {
      errorMessage = json.error || "Dieser Signatur-Link ist ungültig oder abgelaufen.";
    }
  } catch (err) {
    console.error("[RemoteSignOrderPage] Fetch error:", err);
    errorMessage = "Verbindungsfehler beim Laden des Angebots.";
  }

  if (!inviteData) {
    return (
      <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
        <div className="w-full max-w-2xl mx-auto py-12 px-4 relative z-10">
          <Card className="border-2 border-destructive/40 shadow-xl text-center py-8">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Link ungültig oder abgelaufen</CardTitle>
              <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="bg-muted/50 p-4 rounded-xl text-xs text-muted-foreground max-w-md mx-auto">
                Falls Du Fragen hast oder einen neuen Signatur-Link benötigst, kontaktiere bitte Deinen Ansprechpartner oder schreibe uns an:
                <a href="mailto:service@buffinteractive.net" className="font-semibold text-primary block mt-1 underline">
                  service@buffinteractive.net
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Invites minted before account-backed offers have no customerUserId and
  // keep the old anonymous token behaviour so nothing in flight breaks.
  if (inviteData.customerUserId) {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);

    const signingPath = `/sales/order/sign/${token}`;

    if (!session?.user) {
      redirect(`/auth?from=${encodeURIComponent(signingPath)}`);
    }

    if (session.user.id !== inviteData.customerUserId) {
      return (
        <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
          <div className="w-full max-w-2xl mx-auto py-12 px-4 relative z-10">
            <Card className="border-2 border-destructive/40 shadow-xl text-center py-8">
              <CardHeader className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold">Dieses Angebot gehört zu einem anderen Konto</CardTitle>
                <CardDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                  Du bist als <span className="text-foreground font-medium">{session.user.email}</span> angemeldet.
                  Melde Dich mit dem Konto an, an das dieses Angebot geschickt wurde.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <a
                  href={`/auth?from=${encodeURIComponent(signingPath)}`}
                  className="inline-block bg-primary text-primary-foreground font-bold uppercase tracking-wider px-6 py-3 rounded-xl"
                >
                  Konto wechseln
                </a>
              </CardContent>
            </Card>
          </div>
        </main>
      );
    }

    if (await needsPassword(session.user.id)) {
      redirect(`/auth/set-password?next=${encodeURIComponent(signingPath)}`);
    }
  }

  const termsContent = readLegalFile("terms.md");
  const avvContent = readLegalFile("avv.md");
  const sepaContent = readLegalFile("sepa_mandat.md");

  return (
    <main className="min-h-screen bg-[#050505] text-foreground font-sans">
      <RemoteSignClientWrapper
        inviteData={inviteData}
        termsContent={termsContent}
        avvContent={avvContent}
        sepaContent={sepaContent}
      />
    </main>
  );
}
