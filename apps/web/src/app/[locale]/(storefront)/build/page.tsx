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

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = {
    de: {
      title: "The Build | Enterprise Webentwicklung & Software",
      description: "Custom Software, High-Performance Hosting und SaaS-Infrastrukturen, die nicht sofort einknicken, wenn der Traffic durch die Decke geht.",
    },
    en: {
      title: "The Build | Enterprise Engineering & Software",
      description: "Stop renting workarounds. Own your infrastructure. We engineer custom, enterprise-grade platforms and high-performance web apps.",
    },
    es: {
      title: "The Build | Ingeniería y Software Corporativo",
      description: "Crea tu propia infraestructura. Desarrollamos software a medida de nivel corporativo y aplicaciones web de alto rendimiento.",
    },
  };
  const t = translations[locale as keyof typeof translations] || translations.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${locale}/build`,
    },
  };
}

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
