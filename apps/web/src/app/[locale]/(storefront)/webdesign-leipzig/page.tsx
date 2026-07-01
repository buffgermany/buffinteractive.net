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
    title: "Webdesign Leipzig – Professionelle Homepage erstellen lassen | Buff",
    description:
      `Rundum-Sorglos statt teurer Einmalzahlung. Wir gestalten, hosten und pflegen deine neue Homepage direkt vor Ort in Leipzig ab ${minPrice}€/Monat.`,
    keywords: [
      "Webdesign Leipzig",
      "Homepage erstellen lassen Leipzig",
      "Website mieten Leipzig",
      "Website für Restaurant Leipzig",
      "Speisekarte online Leipzig",
      "Website für Bar Leipzig",
      "Gastro Homepage Leipzig",
      "Website für Handwerker Leipzig",
      "Website für Ärzte Leipzig",
      "Internetauftritt Leipzig",
      "Webpräsenz erstellen Leipzig",
      "Online-Auftritt Leipzig",
      "Firmen-Website Leipzig",
      "Webdesigner Leipzig",
    ],
    alternates: {
      canonical: "/de/webdesign-leipzig",
    },
    openGraph: {
      title: "Webdesign Leipzig – Professionelle Homepage erstellen lassen | Buff",
      description:
        `Rundum-Sorglos statt teurer Einmalzahlung. Wir gestalten, hosten und pflegen deine neue Firmen-Homepage direkt vor Ort in Leipzig ab ${minPrice}€/Monat. Ideal für Handwerk, Ärzte & KMUs.`,
      type: "website",
      locale: "de_DE",
      url: "https://buffinteractive.net/de/webdesign-leipzig",
    },
  };
}

export default async function WebdesignLeipzigPage({ params }: Props) {
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
      addressLocality: "Leipzig",
      addressRegion: "Sachsen",
      postalCode: "04103",
      addressCountry: "DE",
    },
    areaServed: [
      { "@type": "City", name: "Leipzig" },
      { "@type": "City", name: "Chemnitz" },
      { "@type": "City", name: "Dresden" },
      { "@type": "State", name: "Sachsen" },
    ],
    priceRange: "€€",
    description:
      `Buff entwirft, hostet und pflegt deine neue Firmen-Homepage in Sachsen zum fairen monatlichen Festpreis. Kein Entwickler-Stress, keine hohen Einmalkosten – ideal für Unternehmen in Leipzig, Chemnitz und Dresden.`,
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
      name: "Website-as-a-Service Leipzig",
      itemListElement: [
        {
          "@type": "Offer",
          name: `Starter-Website (${basePlan.name}) Leipzig`,
          description:
            `Professionelle Homepage für Leipziger Unternehmen und Selbstständige. Komplettes Rundum-Sorglos-Paket inklusive Design, Highspeed-Hosting, DSGVO-Rechtssicherheit und Änderungen per WhatsApp.`,
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
        name: "Wie finde ich einen zuverlässigen Webdesigner in Leipzig mit Rundum-Betreuung?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Bei Buff kannst du deine neue, schlüsselfertige Homepage in Leipzig mieten – bereits ab ${basePlan.priceMonthly}€ im Monat. Wir übernehmen die komplette Gestaltung, das Highspeed-Hosting, Sicherheits-Backups und alle Text- oder Bildänderungen im laufenden Betrieb. Keine versteckten Kosten.`
        }
      },
      {
        "@type": "Question",
        name: "Erstellt Buff auch Internetseiten für Handwerker, Gastronomen oder Ärzte in Leipzig?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, absolut. Wir gestalten maßgeschneiderte, verkaufsstarke Webseiten für lokale Branchen in Leipzig – von Handwerksbetrieben über Arztpraxen, Kanzleien und Kosmetikstudios bis hin zu Gastronomiebetrieben."
        }
      },
      {
        "@type": "Question",
        name: "Ist der DSGVO-Datenschutz für meine Leipziger Firmenwebsite im Preis inklusive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, jede von uns erstellte Website in Leipzig ist von Tag 1 an rechtssicher aufgebaut. Wir integrieren ein DSGVO-konformes Consent-Tool (Cookie-Banner), erstellen rechtssichere Texte für Impressum und Datenschutzerklärung und hosten alles datenschutzkonform auf deutschen Servern."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground font-sans pt-16">
      {/* Local SEO & AEO schemas — Leipzig */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* WaaS components — customized with German Leipzig locale context */}
      <GrowthHero
        city="leipzig"
        title={
          <>
            <span className="text-primary font-extrabold">Websites auf Autopilot</span>. Für Macher aus Leipzig, <span className="text-primary font-extrabold">wie dich.</span>
          </>
        }
        description={`Websites auf Autopilot: Rundum-Sorglos statt teurer Einmalzahlung. Wir gestalten, hosten und pflegen deine neue Homepage direkt hier vor Ort in Leipzig ab ${basePlan.priceMonthly}€ im Monat. Damit du dich als Macher voll auf dein Geschäft konzentrieren kannst.`}
      />
      <RealityCheckSection />
      <BlueprintFlow />
      <LocalCityConnection city="leipzig" />
      <GrowthParadigm />
      <FaqSection city="leipzig" />
      <BuildCTA />
      <FootnotesSection />
    </main>
  );
}
