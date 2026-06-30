import type { Metadata } from "next";

// Import our new Buff sections
import { HeroSection } from "@/components/buff/HeroSection";
import { RealityCheckSection } from "@/components/buff/RealityCheckSection";
import { ArsenalSection } from "@/components/buff/ArsenalSection";
import { AntiPortfolioSection } from "@/components/buff/AntiPortfolioSection";
import { MadLibsFooter } from "@/components/buff/MadLibsFooter";
import { FootnotesSection } from "@/components/buff/FootnotesSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const translations = {
    de: {
      title: "Raw Tech. Ruthless Growth.",
      description: "Hör auf, schlechten Code und durchschnittliches Marketing zu akzeptieren. Wir liefern das technische Fundament und die strategische Skalierung für deine Brand.",
      canonical: "/de",
    },
    en: {
      title: "Raw Tech. Ruthless Growth.",
      description: "Stop accepting bad code and average marketing. We provide the technical backbone, creative punch, and strategic scaling your brand is missing.",
      canonical: "/en",
    },
    es: {
      title: "Raw Tech. Ruthless Growth.",
      description: "Deja de aceptar código deficiente y marketing promedio. Proporcionamos la infraestructura técnica, el impacto creativo y la estrategia que tu marca necesita.",
      canonical: "/es",
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.de;

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: t.canonical,
    },
  };
}

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
