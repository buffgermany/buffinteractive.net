import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Impressum" : locale === "es" ? "Aviso Legal" : "Imprint",
    alternates: {
      canonical: `/${locale}/imprint`,
    },
  };
}

export default function ImprintPage() {
  const t = useTranslations('Legal');

  function readLegalFile(filename: string): string {
    const paths = [
      path.join(process.cwd(), "legal", filename),
      path.join(process.cwd(), "..", "..", "legal", filename),
    ];
    for (const p of paths) {
      try {
        if (fs.existsSync(p)) {
          return fs.readFileSync(p, "utf8");
        }
      } catch (e) {
        // ignore
      }
    }
    return `${filename} konnte nicht geladen werden.`;
  }

  const imprintContent = readLegalFile("imprint.md");

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pt-40 pb-32 px-6 md:px-12 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(204,255,0,0.05)_0%,rgba(0,0,0,0)_70%)] pointer-events-none -z-10" />

      <div className="max-w-3xl mx-auto rounded-3xl border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm p-8 md:p-16 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {t('original_language_notice') && (
          <div className="mb-8 p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-amber-200/80 text-[10px] font-mono tracking-widest uppercase flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {t('original_language_notice')}
            </span>
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground-muted leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {imprintContent}
          </ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
