import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthHero } from "@/components/products/waas/GrowthHero";
import { LocalCityConnection } from "@/components/products/waas/LocalCityConnection";
import { RealityCheckSection } from "@/components/products/waas/RealityCheckSection";
import { BlueprintFlow } from "@/components/products/waas/BlueprintFlow";
import { GrowthParadigm } from "@/components/products/waas/GrowthParadigm";
import { FaqSection } from "@/components/products/waas/FaqSection";
import { BuildCTA } from "@/components/products/waas/BuildCTA";
import { FootnotesSection } from "@/components/buff/FootnotesSection";
import { PRICING_CONFIG } from "@/config/pricing";

type Props = {
  params: Promise<{ locale: string }>;
};

// This page is German-only — only pre-render the 'de' locale
export function generateStaticParams() {
  return [{ locale: 'de' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  // This page is German-only
  if (locale !== "de") return {};

  const minPrice = PRICING_CONFIG.plans.essential.priceMonthly;

  return {
    title: "Webdesign Chemnitz – Professionelle Homepage erstellen lassen | Buff",
    description:
      `Rundum-Sorglos statt teurer Einmalzahlung. Wir gestalten, hosten und pflegen deine neue Homepage direkt vor Ort in Chemnitz ab ${minPrice}€/Monat.`,
    keywords: [
      "Webdesign Chemnitz",
      "Homepage erstellen lassen Chemnitz",
      "Website mieten Chemnitz",
      "Website für Restaurant Chemnitz",
      "Speisekarte online Chemnitz",
      "Website für Bar Chemnitz",
      "Gastro Homepage Chemnitz",
      "Website für Handwerker Chemnitz",
      "Website für Ärzte Chemnitz",
      "Internetauftritt Chemnitz",
      "Webpräsenz erstellen Chemnitz",
      "Online-Auftritt Chemnitz",
      "Firmen-Website Chemnitz",
      "Webdesigner Chemnitz",
    ],
    alternates: {
      canonical: "/de/webdesign-chemnitz",
    },
    openGraph: {
      title: "Webdesign Chemnitz – Professionelle Homepage erstellen lassen | Buff",
      description:
        `Rundum-Sorglos statt teurer Einmalzahlung. Wir gestalten, hosten und pflegen deine neue Firmen-Homepage direkt vor Ort in Chemnitz ab ${minPrice}€/Monat. Ideal für Handwerk, Ärzte & KMUs.`,
      type: "website",
      locale: "de_DE",
      url: "https://buffinteractive.net/de/webdesign-chemnitz",
    },
  };
}

export default async function WebdesignChemnitzPage({ params }: Props) {
  const { locale } = await params;

  // This page is German-only — 404 for other locales
  if (locale !== "de") {
    notFound();
  }

  const basePlan = PRICING_CONFIG.plans.essential;

  const localSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Buff Interactive",
    url: "https://buffinteractive.net",
    email: "service@buffinteractive.net",
    telephone: "+4915678692146",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chemnitz",
      addressRegion: "Sachsen",
      postalCode: "09111",
      addressCountry: "DE",
    },
    areaServed: [
      { "@type": "City", name: "Chemnitz" },
      { "@type": "City", name: "Dresden" },
      { "@type": "City", name: "Leipzig" },
      { "@type": "State", name: "Sachsen" },
    ],
    priceRange: "€€",
    description:
      `Buff entwirft, hostet und pflegt deine neue Firmen-Homepage in Sachsen zum fairen monatlichen Festpreis. Kein Entwickler-Stress, keine hohen Einmalkosten – ideal für Unternehmen in Chemnitz, Dresden und Leipzig.`,
    knowsLanguage: ["de", "en", "es"],
    serviceType: [
      "Webdesign",
      "Webentwicklung",
      "Website-as-a-Service",
      "SEO",
      "Online Marketing",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Website-as-a-Service Chemnitz",
      itemListElement: [
        {
          "@type": "Offer",
          name: `Starter-Website (${basePlan.name}) Chemnitz`,
          description:
            `Professionelle Homepage für Chemnitzer Unternehmen und Selbstständige. Komplettes Rundum-Sorglos-Paket inklusive Design, Highspeed-Hosting, DSGVO-Rechtssicherheit und Änderungen per WhatsApp.`,
          price: `${basePlan.priceMonthly}`,
          priceCurrency: "EUR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: `${basePlan.priceMonthly}`,
            priceCurrency: "EUR",
            unitText: "Monat",
          },
        },
      ],
    },
    sameAs: ["https://buffinteractive.net"],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie finde ich einen zuverlässigen Webdesigner in Chemnitz mit Rundum-Betreuung?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Bei Buff kannst du deine neue, schlüsselfertige Homepage in Chemnitz mieten – bereits ab ${basePlan.priceMonthly}€ im Monat. Wir übernehmen die komplette Gestaltung, das Highspeed-Hosting, Sicherheits-Backups und alle Text- oder Bildänderungen im laufenden Betrieb. Keine versteckten Kosten.`
        }
      },
      {
        "@type": "Question",
        name: "Erstellt Buff auch Internetseiten für Handwerker, Gastronomen oder Ärzte in Chemnitz?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, absolut. Wir gestalten maßgeschneiderte, verkaufsstarke Webseiten für lokale Branchen in Chemnitz – von Handwerksbetrieben über Arztpraxen, Kanzleien und Kosmetikstudios bis hin zu Gastronomiebetrieben."
        }
      },
      {
        "@type": "Question",
        name: "Ist der DSGVO-Datenschutz für meine Chemnitzer Firmenwebsite im Preis inklusive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, jede von uns erstellte Website in Chemnitz ist von Tag 1 an rechtssicher aufgebaut. Wir integrieren ein DSGVO-konformes Consent-Tool (Cookie-Banner), erstellen rechtssichere Texte für Impressum und Datenschutzerklärung und hosten alles datenschutzkonform auf deutschen Servern."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
      {/* Local SEO & AEO schemas — Chemnitz */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* WaaS components — customized with German Chemnitz locale context */}
      <GrowthHero
        city="chemnitz"
        title={
          <>
            <span className="text-primary font-extrabold">Websites auf Autopilot</span>. Für Macher aus Chemnitz, <span className="text-primary font-extrabold">wie dich.</span>
          </>
        }
        description={`Rundum-Sorglos statt teurer Einmalzahlung oder unvorhergesehenen Wartungskosten. Wir gestalten, hosten und pflegen deine neue Homepage direkt hier vor Ort in Chemnitz ab ${basePlan.priceMonthly}€ im Monat. Damit du dich voll auf dein Geschäft konzentrieren kannst.`}
      />
      <RealityCheckSection />
      <BlueprintFlow />
      <LocalCityConnection city="chemnitz" />
      <GrowthParadigm />
      <FaqSection city="chemnitz" />
      <BuildCTA />
      <FootnotesSection />
    </main>
  );
}
