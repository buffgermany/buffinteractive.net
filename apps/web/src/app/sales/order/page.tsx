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

  const legalDir = path.join(process.cwd(), "..", "..", "legal");
  
  let termsContent = "AGB konnten nicht geladen werden.";
  let avvContent = "AVV konnte nicht geladen werden.";
  let sepaContent = "SEPA-Mandat konnte nicht geladen werden.";

  try {
    termsContent = fs.readFileSync(path.join(legalDir, "terms.md"), "utf8");
    avvContent = fs.readFileSync(path.join(legalDir, "avv.md"), "utf8");
    sepaContent = fs.readFileSync(path.join(legalDir, "sepa_mandat.md"), "utf8");
  } catch (err) {
    console.error("Failed to read legal documents", err);
  }

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
