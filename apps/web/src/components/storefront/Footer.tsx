"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-16 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex flex-col mb-6 sm:mb-0 gap-2">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 transition-all group-hover:bg-primary/20">
                <Zap className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-bold tracking-tight text-xl">Platform</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
               Crafting premium digital experiences from infrastructure to interface.
            </p>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-3">
             <div className="flex gap-8 text-sm font-medium text-muted-foreground">
               <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
             </div>
             <p className="text-xs text-muted-foreground opacity-60">
               © {new Date().getFullYear()} Platform Digital. All rights reserved.
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
