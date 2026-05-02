import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/buff/DashboardHeader";
import { headers as nextHeaders } from "next/headers";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth?from=/dashboard");
  }

  const headersList = await nextHeaders();
  const pathname = headersList.get("x-pathname") ?? "/dashboard";

  return (
    <div className="flex min-h-screen w-full flex-col relative overflow-hidden bg-[#0A0A0A]">
      {/* Static Deep Mesh Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(204, 255, 0, 0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(26, 16, 37, 0.6) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(14, 14, 20, 1) 0%, rgba(10, 10, 10, 1) 100%)`
        }}
      />

      {/* Subtle grain */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Top navigation rail */}
      <DashboardHeader currentPath={pathname} />

      {/* Page content */}
      <main className="relative z-10 flex-1 overflow-y-auto pt-24 md:pt-32 pb-20">
        {children}
      </main>
    </div>
  );
}
