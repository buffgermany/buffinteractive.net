import fs from "fs";
import path from "path";
import { OrderFormFlow } from "./OrderFormFlow";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // assuming auth exists here
import { redirect } from "next/navigation";

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
    <div className="w-full max-w-4xl mx-auto">
      <OrderFormFlow 
        termsContent={termsContent} 
        avvContent={avvContent} 
        sepaContent={sepaContent} 
        salesUserId={session?.user?.id || "dev-user-id"} 
      />
    </div>
  );
}
