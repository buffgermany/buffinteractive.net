import fs from "fs";
import path from "path";
import { OrderFormFlow } from "./OrderFormFlow";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // assuming auth exists here
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function SalesOrderPage() {
  const reqHeaders = await headers();
  // Protect route
  const session = await auth.api.getSession({
    headers: reqHeaders
  }).catch(() => null);

  if (!session?.user) {
    redirect("/auth");
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
        // ignore and try next
      }
    }
    return `${filename} konnte nicht geladen werden.`;
  }

  const termsContent = readLegalFile("terms.md");
  const avvContent = readLegalFile("avv.md");
  const sepaContent = readLegalFile("sepa_mandat.md");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/buff_interactive.acid-lime_white.svg"
              alt="Buff Interactive Logo"
              width={140}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </div>
          <h1 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Digitaler Vertragsabschluss
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start py-8 px-4 sm:px-6 md:px-8 max-w-4xl w-full mx-auto">
        <div className="w-full max-w-4xl mx-auto">
          <OrderFormFlow 
            termsContent={termsContent} 
            avvContent={avvContent} 
            sepaContent={sepaContent} 
            salesUserId={session?.user?.id || "dev-user-id"} 
          />
        </div>
      </main>
    </div>
  );
}
