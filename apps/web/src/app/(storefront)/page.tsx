import type { Metadata } from "next";

// Import our new Buff sections
import { HeroSection } from "@/components/buff/HeroSection";
import { RealityCheckSection } from "@/components/buff/RealityCheckSection";
import { ArsenalSection } from "@/components/buff/ArsenalSection";
import { AntiPortfolioSection } from "@/components/buff/AntiPortfolioSection";
import { MadLibsFooter } from "@/components/buff/MadLibsFooter";
import { FootnotesSection } from "@/components/buff/FootnotesSection";

export const metadata: Metadata = {
  title: "Buff — Provocative Tech & Marketing",
  description:
    "Your digital setup is underperforming. Stop accepting bad code and average marketing. We provide the technical backbone, the creative punch, and the strategic clarity your brand is currently missing.",
};

export default function HomePage() {
  return (
      <main className="min-h-screen bg-transparent text-foreground font-sans">
        <HeroSection />
        <RealityCheckSection />
        <ArsenalSection />
        <AntiPortfolioSection />
        <MadLibsFooter />
        <FootnotesSection />
      </main>
  );
}
