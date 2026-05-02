"use client";

import { useTranslations } from "next-intl";

export function FootnotesSection() {
  const t = useTranslations("Footnotes");

  return (
    <section className="bg-transparent py-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="flex gap-3">
            <span className="text-[10px] text-muted-foreground/40 shrink-0 mt-0.5">1.</span>
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed tracking-tight">
              {t("note1")}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-[10px] text-muted-foreground/40 shrink-0 mt-0.5">2.</span>
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed tracking-tight">
              {t("note2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
