import { redirect } from "next/navigation";
import { needsPassword } from "@/lib/account";
import { getPortalUser } from "@/lib/portal";
import { PortalNavigation } from "@/components/portal/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getPortalUser();
  if (await needsPassword(user.id)) redirect("/auth/set-password?next=/dashboard");
  return <div className="min-h-screen bg-background text-foreground lg:flex"><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-background focus:p-4">Skip to content</a><PortalNavigation name={user.name} canAdmin={user.role === "admin"} /><main id="main-content" className="mx-auto w-full min-w-0 max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main></div>;
}
