import type { Metadata } from "next";

// Import our newly created WaaS components
import { GrowthHero } from "@/components/products/waas/GrowthHero";
import { RealityCheckSection } from "@/components/products/waas/RealityCheckSection";
import { AntiPortfolioSection } from "@/components/products/waas/AntiPortfolioSection";
import { GrowthParadigm } from "@/components/products/waas/GrowthParadigm";
import { BuildCTA } from "@/components/products/waas/BuildCTA";

export const metadata: Metadata = {
  title: "Website-as-a-Service // Rundum-Sorglos-Websites",
  description:
    "Dein digitaler Maßanzug vollkommen ohne Kopfschmerzen. Keine teuren Einmalzahlungen, kein technisches Kauderwelsch. Wir bauen, hosten und pflegen deine Traum-Website für einen fairen monatlichen Festpreis.",
};

export default function WaasProductsPage() {
  return (
    <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
      {/* 1. Hero from /growth */}
      <GrowthHero />

      {/* 2. RealityCheckSection from main page (/) */}
      <RealityCheckSection />

      {/* 3. AntiPortfolioSection from main page (/) */}
      <AntiPortfolioSection />

      {/* 4. GrowthParadigm from /growth */}
      <GrowthParadigm />

      {/* 5. Contact form from /build */}
      <BuildCTA />
    </main>
  );
}
