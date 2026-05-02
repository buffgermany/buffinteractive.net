import type { Metadata } from "next";
import { BuildHero } from "@/components/build/BuildHero";
import { BuildDiagnosis } from "@/components/build/BuildDiagnosis";
import { BuildCapabilities } from "@/components/build/BuildCapabilities";
import { BuildProcess } from "@/components/build/BuildProcess";
import { BuildStandards } from "@/components/build/BuildStandards";
import { BuildCTA } from "@/components/build/BuildCTA";
import { EngineeringBlueprint } from "@/components/build/EngineeringBlueprint";
import { AntiPortfolioSection } from "@/components/buff/AntiPortfolioSection";
import { FootnotesSection } from "@/components/buff/FootnotesSection";

export const metadata: Metadata = {
  title: "The Build | Enterprise Engineering by Buff",
  description: "Stop renting workarounds. Own your infrastructure. We engineer custom, enterprise-grade platforms and high-performance web apps.",
};

export default function BuildPage() {
  return (
    <main className="relative min-h-screen w-full selection:bg-[#CCFF00] selection:text-[#0A0A0A] pt-16">
      
      <div className="relative z-10 w-full">
        <BuildHero />
        <BuildDiagnosis />
        <BuildCapabilities />
        <AntiPortfolioSection />
        <BuildStandards />
        <BuildCTA />
        <FootnotesSection />
      </div>
    </main>
  );
}
