"use client";

import { InfiniteMarquee } from "@/components/premium/organic-ui";

export function ServicesMarquee() {
  const words = [
    "Full-Stack Engineering",
    "Digital Marketing",
    "Creative Direction",
    "Managed Hosting",
    "Strategy Consulting",
    "High-Conversion SEO"
  ];

  return (
    <section className="py-24 mb-10 overflow-hidden relative z-10 w-full">
        <InfiniteMarquee items={words} speed={50} />
    </section>
  );
}
