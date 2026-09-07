"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const INPUT =
  "w-full bg-[#0A0A0A]/50 border border-white/10 rounded-xl pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300";

export function SetPasswordForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const tooShort = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 10 && password === confirm && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      setError(data.error ?? "Passwort konnte nicht gesetzt werden.");
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
          Passwort
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Mindestens 10 Zeichen"
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
            title={show ? "Passwort verbergen" : "Passwort anzeigen"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {tooShort && (
          <span className="text-red-500 text-[10px] ml-1">
            Mindestens 10 Zeichen.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
          Passwort bestätigen
        </label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          placeholder="Passwort wiederholen"
          className={INPUT}
        />
        {mismatch && (
          <span className="text-red-500 text-[10px] ml-1">
            Die Passwörter stimmen nicht überein.
          </span>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Passwort speichern"}
        </button>
      </div>
    </form>
  );
}
