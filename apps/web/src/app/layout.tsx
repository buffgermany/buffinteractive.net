import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { LanguagePopup } from "@/components/buff/LanguagePopup";
import { LoadingScreen } from "@/components/buff/LoadingScreen";
import { Prefetcher } from "@/components/buff/Prefetcher";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buffinteractive.net"),
  title: {
    default: "Raw Tech. Ruthless Growth.",
    template: "%s | Buff",
  },
  description:
    "We provide the technical backbone, the creative punch, and the strategic clarity your brand is currently missing.",
  keywords: ["agency", "software", "marketing", "SaaS", "growth"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Buff",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <LanguagePopup />
            <LoadingScreen />
            <Prefetcher />
          </ThemeProvider>
          <Script
            src="https://analytics.buffinteractive.net/api/script.js"
            data-site-id="74c5bb7ba5a7"
            strategy="afterInteractive"
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
