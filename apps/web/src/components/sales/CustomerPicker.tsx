"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/primitives";

export type CustomerHit = {
  id: string;
  email: string;
  name: string;
  company: string | null;
};

/**
 * Type an email to search existing accounts. Picking one reuses it;
 * typing an unknown address falls through to creating an account
 * when the invite is sent.
 */
export function CustomerPicker({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (email: string) => void;
  onSelect?: (customer: CustomerHit | null) => void;
}) {
  const [hits, setHits] = useState<CustomerHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<CustomerHit | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (picked && picked.email === value) return;
    if (value.trim().length < 2) {
      setHits([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/sales/customers?q=${encodeURIComponent(value.trim())}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setHits(res.ok ? (data.customers ?? []) : []);
        setOpen(true);
      } catch {
        // aborted or offline — leave the last result set alone
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, picked]);

  function choose(hit: CustomerHit) {
    setPicked(hit);
    setOpen(false);
    onChange(hit.email);
    onSelect?.(hit);
  }

  const isNew = value.trim().length > 2 && value.includes("@") && !picked;

  return (
    <div className="relative">
      <Input
        type="email"
        value={value}
        placeholder="kunde@firma.de"
        onChange={(e) => {
          setPicked(null);
          onSelect?.(null);
          onChange(e.target.value);
        }}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      />

      {loading && (
        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      )}

      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-border bg-[#141414] shadow-2xl">
          {hits.map((hit) => (
            <li key={hit.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(hit)}
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="text-sm text-white">{hit.email}</div>
                <div className="text-xs text-[#A0A0B0]">
                  {[hit.name, hit.company].filter(Boolean).join(" · ") || "Kein Name hinterlegt"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked && (
        <p className="mt-2 text-xs text-primary flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          Bestehendes Konto: {picked.name || picked.email}
        </p>
      )}

      {isNew && (
        <p className="mt-2 text-xs text-[#A0A0B0] flex items-center gap-1.5">
          <UserPlus className="w-3.5 h-3.5" />
          Neues Konto wird beim Versand angelegt.
        </p>
      )}
    </div>
  );
}
