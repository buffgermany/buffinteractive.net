"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Box, Code, Rocket, Zap, BarChart, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";

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

const ProductsMenu = () => {
    return (
        <div className="md:w-[500px] p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 mb-2">
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Our Platforms</h4>
            </div>
            {[
                { title: "Vault", text: "Secure infrastructure.", icon: Box, href: "#" },
                { title: "Velocity", text: "Edge deployment.", icon: Zap, href: "#" },
            ].map((item, i) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                >
                    <Link href={item.href} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group w-full h-full">
                        <div className="p-2 bg-white/5 rounded-md group-hover:text-primary transition-colors">
                            <item.icon size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}

const ServicesMenu = () => {
    return (
        <div className="md:w-[600px] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 mb-2 flex items-center justify-between">
                <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Agency Services</h4>
            </div>
            {[
                { title: "Engineering", text: "Custom builds.", icon: Code, href: "/services/engineering" },
                { title: "Growth", text: "Marketing ops.", icon: BarChart, href: "/services/growth" },
                { title: "Branding", text: "Identity push.", icon: Globe, href: "/services/branding" }
            ].map((item, i) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i} 
                >
                    <Link href={item.href} className="flex flex-col items-start gap-3 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group w-full h-full">
                        <div className="p-2 bg-white/5 rounded-md group-hover:text-primary transition-colors">
                            <item.icon size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{item.text}</p>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}

const MENUS: Record<string, React.FC> = {
    Products: ProductsMenu,
    Services: ServicesMenu,
};

export function Header() {
  const t = useTranslations('Header');
  const { data: session } = useSession();
  const { scrollY } = useScroll();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [scrolledState, setScrolledState] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
        setScrolledState(latest > 50);
    });
  }, [scrollY]);

  const handleMouseEnter = (menu: string) => {
    if (window.innerWidth < 768) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 768) return;
    timeoutRef.current = setTimeout(() => {
        setActiveMenu(null);
    }, 300);
  };

  const ActiveComponent = activeMenu && MENUS[activeMenu] ? MENUS[activeMenu] : null;

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
        <nav 
            className="hidden md:flex items-center gap-8 z-20"
            onMouseLeave={handleMouseLeave}
        >
            <div onMouseEnter={() => handleMouseEnter("Products")}>
                <Magnetic>
                    <button className={`font-medium transition-colors ${activeMenu === "Products" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        {t('nav_products')}
                    </button>
                </Magnetic>
            </div>
            <div onMouseEnter={() => handleMouseEnter("Services")}>
                <Magnetic>
                    <button className={`font-medium transition-colors ${activeMenu === "Services" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        {t('nav_services')}
                    </button>
                </Magnetic>
            </div>
            <div onMouseEnter={() => handleMouseEnter("None")}>
                <Magnetic>
                    <Link href="#about" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                        {t('nav_about')}
                    </Link>
                </Magnetic>
            </div>

            {/* Absolute Dropdown Wrapper */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                <AnimatePresence mode="wait">
                    {activeMenu && MENUS[activeMenu] && (
                        <motion.div
                            key="dropdown"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="glass rounded-2xl overflow-hidden shadow-2xl relative"
                            onMouseEnter={() => {
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                            }}
                            onMouseLeave={handleMouseLeave}
                            layout
                        >
                            <motion.div
                                key={activeMenu}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {ActiveComponent && <ActiveComponent />}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4 z-[60]">
            <Magnetic>
                <Link href={session ? "/dashboard" : "/auth"} className="hidden sm:block font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
                    {session ? t('nav_dashboard') : t('nav_login')}
                </Link>
            </Magnetic>
            <Magnetic>
                <Link href="#contact" className="hidden sm:block">
                    <div className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full text-sm hover:scale-105 transition-transform">
                        {t('cta')}
                    </div>
                </Link>
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
                {[
                { label: t('mobile_products'), href: '#products' },
                { label: t('mobile_services'), href: '#services' },
                { label: t('mobile_about'),    href: '#about'    },
                { label: t('mobile_contact'),  href: '#contact'  },
                { label: session ? t('nav_dashboard') : t('nav_login'), href: session ? '/dashboard' : '/auth' },
            ].map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link 
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-5xl font-heading font-black tracking-tighter hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}
