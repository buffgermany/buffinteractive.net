import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguagePopup } from "@/components/buff/LanguagePopup";
import { LoadingScreen } from "@/components/buff/LoadingScreen";

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
  title: {
    default: "Buff — Provocative Tech & Marketing",
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`} suppressHydrationWarning>
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
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
