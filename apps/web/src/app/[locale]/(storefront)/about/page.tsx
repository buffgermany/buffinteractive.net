import type { Metadata } from "next";

import { AboutHero } from "@/components/buff/AboutHero";
import { AboutManifesto } from "@/components/buff/AboutManifesto";
import { AboutRoots } from "@/components/buff/AboutRoots";
import { AboutTeam } from "@/components/buff/AboutTeam";
import { AboutTimeline } from "@/components/buff/AboutTimeline";
import { AboutEcosystem } from "@/components/buff/AboutEcosystem";
import { MadLibsFooter } from "@/components/buff/MadLibsFooter";
import { FootnotesSection } from "@/components/buff/FootnotesSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const translations = {
    de: {
      title: "Über uns | Buff",
      description: "Wir liefern das technische Fundament, die kreative Durchschlagskraft und die strategische Klarheit, die deiner Marke derzeit fehlt.",
      canonical: "/de/about",
    },
    en: {
      title: "About Us | Buff",
      description: "We provide the technical backbone, creative punch, and strategic clarity your brand is currently missing.",
      canonical: "/en/about",
    },
    es: {
      title: "Quiénes somos | Buff",
      description: "Proporcionamos la infraestructura técnica, el impacto creativo y la claridad estratégica que tu marca necesita.",
      canonical: "/es/about",
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

export default function AboutPage() {
  return (
      <main className="min-h-screen bg-transparent text-foreground font-sans pt-12">
        <AboutHero />
        <AboutManifesto />
        <AboutRoots />
        <AboutTeam />
        <AboutTimeline />
        <AboutEcosystem />
        <MadLibsFooter />
        <FootnotesSection />
      </main>
  );
}
