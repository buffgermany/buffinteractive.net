import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AlertTriangle } from "lucide-react";

// Import our newly created WaaS components
import { GrowthHero } from "@/components/products/waas/GrowthHero";
import { RealityCheckSection } from "@/components/products/waas/RealityCheckSection";
import { AntiPortfolioSection } from "@/components/products/waas/AntiPortfolioSection";
import { BlueprintFlow } from "@/components/products/waas/BlueprintFlow";
import { GrowthParadigm } from "@/components/products/waas/GrowthParadigm";
import { FaqSection } from "@/components/products/waas/FaqSection";
import { FootnotesSection } from "@/components/buff/FootnotesSection";
import { BuildCTA } from "@/components/products/waas/BuildCTA";

export const metadata: Metadata = {
  title: "Website-as-a-Service // Rundum-Sorglos-Websites",
  description:
    "Dein digitaler Maßanzug vollkommen ohne Kopfschmerzen. Keine teuren Einmalzahlungen, kein technisches Kauderwelsch. Wir bauen, hosten und pflegen deine Traum-Website für einen fairen monatlichen Festpreis.",
  keywords: ["Website-as-a-Service", "WaaS", "Websites auf Autopilot", "Mietwebsites", "Homepage mieten", "Webdesign Chemnitz", "Webentwicklung Flatrate"],
  alternates: {
    canonical: "/products/waas",
  },
  openGraph: {
    title: "Website-as-a-Service // Rundum-Sorglos-Websites",
    description: "Dein digitaler Maßanzug vollkommen ohne Kopfschmerzen. Wir bauen, hosten und pflegen deine Traum-Website für einen fairen monatlichen Festpreis.",
    type: "website",
    locale: "de_DE",
    url: "/products/waas",
  },
};

export default async function WaasProductsPage() {
  const locale = await getLocale();
  const showNotice = locale !== "de";

  const noticeText = locale === "es"
    ? "Aviso: Esta página no se puede traducir y solo está disponible en alemán."
    : "Notice: This page cannot be translated and is only available in German.";

  return (
    <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
      {showNotice && (
        <div className="w-full bg-[#CCFF00]/5 border-y border-[#CCFF00]/10 py-3.5 px-4 text-center text-xs font-mono tracking-wider flex items-center justify-center gap-2 relative z-50 text-[#CCFF00]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#CCFF00]" />
          <span>{noticeText}</span>
        </div>
      )}

      {/* 1. Hero from /growth */}
      <GrowthHero />

      {/* 2. RealityCheckSection from main page (/) */}
      <RealityCheckSection />

      {/* 3. AntiPortfolioSection from main page (/) */}
      <AntiPortfolioSection />

      {/* 4. Blueprint Flow (Apple-style interactive process) */}
      <BlueprintFlow />

      {/* 5. GrowthParadigm from /growth */}
      <GrowthParadigm />

      {/* 6. Objection-Killing FAQ */}
      <FaqSection />

      {/* 7. Contact form from /build */}
      <BuildCTA />

      {/* Footnotes */}
      <FootnotesSection />
    </main>
  );
}
