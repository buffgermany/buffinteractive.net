import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://buffinteractive.net"),
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate the locale from the URL
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Buff Interactive",
            url: "https://buffinteractive.net",
            description:
              "High-End Webdesign & Website-as-a-Service Agentur. Raw Tech. Ruthless Growth.",
            inLanguage: locale,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://buffinteractive.net/{search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
