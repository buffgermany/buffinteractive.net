import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { needsPassword } from "@/lib/account";
import { safeNext } from "@/lib/safe-next";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Passwort festlegen" };


export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(rawNext);

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect(`/auth?from=${encodeURIComponent(next)}`);

  // Already has a password — nothing to do here.
  if (!(await needsPassword(session.user.id))) redirect(next);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A] px-4 py-24">
      <div
        className="absolute inset-0 z-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(26, 16, 37, 0.8) 0%, rgba(10, 10, 10, 1) 50%)",
        }}
      />
      <div className="relative z-10 max-w-md w-full bg-[#2C2C2C]/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-3xl font-heading font-bold text-white mb-3 tracking-tight">
          Leg Dein Passwort fest
        </h1>
        <p className="text-sm text-[#A0A0B0] leading-relaxed mb-8">
          Du bist angemeldet als <span className="text-white">{session.user.email}</span>.
          Bevor es weitergeht, vergib bitte ein Passwort für Dein Konto.
        </p>
        <SetPasswordForm next={next} />
      </div>
    </div>
  );
}
