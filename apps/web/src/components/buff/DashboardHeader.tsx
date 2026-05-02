"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Key, Download, Shield, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth-client";

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}

export function DashboardHeader({ currentPath }: { currentPath: string }) {
  const t = useTranslations('Header');
  const { data: session } = useSession();
  const { scrollY } = useScroll();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolledState, setScrolledState] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
        setScrolledState(latest > 50);
    });
  }, [scrollY]);

  const dashboardLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Licenses", href: "/dashboard/licenses", icon: Key },
    { label: "Downloads", href: "/dashboard/downloads", icon: Download },
  ];

  return (
    <>
    <motion.header
      className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none"
      animate={{
        paddingTop: scrolledState ? 24 : 0,
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div 
        className="flex items-center justify-between relative pointer-events-auto overflow-visible"
        animate={{
            width: scrolledState ? "min(800px, 90%)" : "100%",
            paddingTop: scrolledState ? 12 : 24,
            paddingBottom: scrolledState ? 12 : 24,
            paddingLeft: scrolledState ? 24 : 48,
            paddingRight: scrolledState ? 24 : 48,
            backgroundColor: scrolledState ? "rgba(10, 10, 10, 0.8)" : "rgba(10, 10, 10, 0)",
            backdropFilter: scrolledState ? "blur(24px) saturate(180%)" : "blur(0px) saturate(100%)",
            borderRadius: scrolledState ? 9999 : 0,
            borderBottomWidth: scrolledState ? 1 : 0, 
            borderLeftWidth: scrolledState ? 1 : 0,
            borderRightWidth: scrolledState ? 1 : 0,
            borderTopWidth: scrolledState ? 1 : 0,
            borderColor: scrolledState ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0)",
            boxShadow: scrolledState ? "0 10px 40px rgba(0,0,0,0.5)" : "0 0px 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        layout
      >
        {/* Logo */}
        <Link href="/" className="font-heading font-black text-2xl tracking-tighter hover:text-primary transition-colors z-[60]">
          Buff.
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 z-20">
            {dashboardLinks.map((link) => (
                <div key={link.href}>
                    <Magnetic>
                        <Link 
                            href={link.href} 
                            className={`font-medium transition-colors ${currentPath === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {link.label}
                        </Link>
                    </Magnetic>
                </div>
            ))}
            {((session?.user as any)?.role === "admin" || (session?.user as any)?.role === "ADMIN") && (
                <div>
                    <Magnetic>
                        <Link href="/admin" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Admin
                        </Link>
                    </Magnetic>
                </div>
            )}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4 z-[60]">
            <Magnetic>
                <button 
                    onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/auth"; } } })}
                    className="hidden sm:block font-medium text-muted-foreground hover:text-foreground transition-colors mr-2"
                >
                    Sign Out
                </button>
            </Magnetic>
            <Magnetic>
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 text-xs font-bold text-primary">
                    {session?.user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
            </Magnetic>
            
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-foreground"
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </motion.div>
    </motion.header>

    {/* Mobile Menu Overlay */}
    <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[55] bg-background/95 backdrop-blur-2xl flex flex-col pt-32 px-12 gap-8 md:hidden"
            >
                {dashboardLinks.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link 
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-5xl font-heading font-bold tracking-tighter transition-colors ${currentPath === item.href ? "text-primary" : "text-white/40 hover:text-white"}`}
                        >
                            {item.label}
                        </Link>
                    </motion.div>
                ))}
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-auto mb-12"
                >
                    <button 
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/auth"; } } })}
                        className="text-2xl font-bold text-red-500 flex items-center gap-3"
                    >
                        <LogOut size={24} />
                        Sign Out
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
