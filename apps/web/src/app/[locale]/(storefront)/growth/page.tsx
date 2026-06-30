import { Metadata } from 'next';
import { GrowthClient } from '@/components/growth/GrowthClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const translations = {
    de: {
      title: "The Growth | Strategie & Marketing",
      description: "Wir optimieren eure Funnels, analysieren die Unit Economics und bauen einen maßgeschneiderten Growth-Blueprint. Kein Raten, nur Mathe.",
    },
    en: {
      title: "The Growth | Strategy & Marketing",
      description: "We tear down your funnels, analyze unit economics, and build a customized growth blueprint. No guessing, just math.",
    },
    es: {
      title: "The Growth | Estrategia y Marketing",
      description: "Analizamos tus funnels, estudiamos tus unit economics y creamos un plan de crecimiento a medida. Sin adivinanzas, solo matemáticas.",
    },
  };
  const t = translations[locale as keyof typeof translations] || translations.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${locale}/growth`,
    },
  };
}

export default function GrowthPage() {
  return <GrowthClient />;
}
