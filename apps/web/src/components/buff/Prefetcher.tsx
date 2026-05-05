"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function Prefetcher() {
  const router = useRouter();

  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target || typeof target.closest !== 'function') return;
      
      const link = target.closest("a");
      
      if (link && link.href && link.origin === window.location.origin) {
        const url = new URL(link.href);
        // Don't prefetch anchors on the same page
        if (url.pathname !== window.location.pathname) {
          router.prefetch(url.pathname);
        }
      }
    };

    document.addEventListener("mouseenter", handleMouseEnter, true);
    return () => document.removeEventListener("mouseenter", handleMouseEnter, true);
  }, [router]);

  return null;
}
