import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Platform",
  description: "Sign in to your Platform account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
