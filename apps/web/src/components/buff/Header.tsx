"use client";

import { useState, useRef, useEffect } from "react";
import {
	motion,
	useScroll,
	useTransform,
	AnimatePresence,
	useMotionValueEvent
} from "framer-motion";
import {
	Box,
	Code,
	Rocket,
	Zap,
	BarChart,
	Globe,
	Menu,
	X,
	ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

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

const ProductsMenu = ({ onLinkClick }: { onLinkClick?: () => void }) => {
	const t = useTranslations("MegaMenu");
	return (
		<div className="md:w-[500px] p-6 px-10 grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="md:col-span-2 mb-2 px-2">
				<h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
					{t("products_headline")}
				</h4>
			</div>
			{[
				{
					title: t("vault_title"),
					text: t("vault_text"),
					icon: Box,
					href: "#"
				},
				{ title: t("velocity_title"), text: t("velocity_text"), icon: Zap, href: "#" }
			].map((item, i) => (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: i * 0.05 }}
					key={i}
				>
					<Link
						href={item.href}
						prefetch={true}
						onClick={onLinkClick}
						className="flex items-start gap-4 p-4 rounded-[2.5rem] px-6 hover:bg-white/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer group w-full h-full"
					>
						<div className="p-2 bg-white/5 rounded-full group-hover:text-primary transition-colors">
							<item.icon size={20} />
						</div>
						<div>
							<h5 className="font-bold text-foreground group-hover:text-primary transition-colors">
								{item.title}
							</h5>
							<p className="text-xs text-muted-foreground mt-1">{item.text}</p>
						</div>
					</Link>
				</motion.div>
			))}
		</div>
	);
};

const ServicesMenu = ({ onLinkClick }: { onLinkClick?: () => void }) => {
	const t = useTranslations("MegaMenu");
	return (
		<div className="w-full md:w-[720px] p-2 grid grid-cols-1 md:grid-cols-2 gap-2">
			{/* Build Service */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.05 }}
			>
				<Link
					href="/build"
					prefetch={true}
					onClick={onLinkClick}
					className="group h-full flex flex-col gap-4 p-6 md:p-8 px-6 md:px-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 md:bg-transparent hover:bg-[#00F0FF]/5 border border-white/5 md:border-transparent hover:border-[#00F0FF]/25 transition-all outline-none"
				>
					<div className="flex items-center justify-between">
						<div className="p-3 bg-[#00F0FF]/10 text-[#00F0FF] rounded-full group-hover:scale-110 group-hover:bg-[#00F0FF]/20 transition-all">
							<Code size={24} />
						</div>
						<ArrowUpRight
							size={20}
							className="text-white/20 md:text-muted-foreground group-hover:text-[#00F0FF] group-hover:translate-x-1 md:group-hover:-translate-y-1 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 -translate-x-0 translate-y-0 md:-translate-x-2 md:translate-y-2"
						/>
					</div>
					<div>
						<h5 className="font-heading font-bold tracking-tight text-xl text-white group-hover:text-[#00F0FF] transition-colors mt-2">
							{t("build_title")}
						</h5>
						<p className="text-sm text-white/50 md:text-muted-foreground mt-2 leading-relaxed">
							{t("build_text")}
						</p>
					</div>
				</Link>
			</motion.div>

			{/* Growth Service */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Link
					href="/growth"
					prefetch={true}
					onClick={onLinkClick}
					className="group h-full flex flex-col gap-4 p-6 md:p-8 px-6 md:px-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 md:bg-transparent hover:bg-[#CCFF00]/5 border border-white/5 md:border-transparent hover:border-[#CCFF00]/25 transition-all outline-none"
				>
					<div className="flex items-center justify-between">
						<div className="p-3 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full group-hover:scale-110 group-hover:bg-[#CCFF00]/20 transition-all">
							<BarChart size={24} />
						</div>
						<ArrowUpRight
							size={20}
							className="text-white/20 md:text-muted-foreground group-hover:text-[#CCFF00] group-hover:translate-x-1 md:group-hover:-translate-y-1 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 -translate-x-0 translate-y-0 md:-translate-x-2 md:translate-y-2"
						/>
					</div>
					<div>
						<h5 className="font-heading font-bold tracking-tight text-xl text-white group-hover:text-[#CCFF00] transition-colors mt-2">
							{t("growth_title")}
						</h5>
						<p className="text-sm text-white/50 md:text-muted-foreground mt-2 leading-relaxed">
							{t("growth_text")}
						</p>
					</div>
				</Link>
			</motion.div>

			{/* Analyze Needs (Audit) */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.15 }}
				className="md:col-span-2"
			>
				<Link
					href="/audit"
					prefetch={true}
					onClick={onLinkClick}
					className="group flex items-center gap-6 p-6 md:p-8 px-6 md:px-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all outline-none"
				>
					<div className="flex-1">
						<div className="flex items-center justify-between mb-1">
							<h5 className="font-heading font-bold tracking-tight text-xl text-white group-hover:text-primary transition-colors">
								{t("audit_title")}
							</h5>
						</div>
						<p className="text-sm text-white/40 md:text-muted-foreground leading-relaxed">
							{t("audit_text")}
						</p>
					</div>
					<ArrowUpRight
						size={24}
						className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
					/>
                    <div className="p-3 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full group-hover:scale-110 group-hover:bg-[#CCFF00]/20 transition-all">
						<Zap size={24} />
					</div>
				</Link>
			</motion.div>
		</div>
	);
};

const MENUS: Record<string, React.FC<{ onLinkClick?: () => void }>> = {
	Products: ProductsMenu,
	Services: ServicesMenu
};

export function Header() {
	const t = useTranslations("Header");
	const { data: session } = useSession();
	const pathname = usePathname();
	const { scrollY } = useScroll();
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const isHome = pathname === "/" || pathname === "/de" || pathname === "/en" || pathname === "/es";

	const [scrolledState, setScrolledState] = useState(false);

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolledState(latest > 50);
	});

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

	const ActiveComponent =
		activeMenu && MENUS[activeMenu] ? MENUS[activeMenu] : null;

	return (
		<>
			<motion.header
				className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none"
				animate={{
					paddingTop: scrolledState ? 24 : 0
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
						backgroundColor: scrolledState
							? "rgba(10, 10, 10, 0.8)"
							: "rgba(10, 10, 10, 0)",
						backdropFilter: scrolledState
							? "blur(24px) saturate(180%)"
							: "blur(0px) saturate(100%)",
						borderRadius: scrolledState ? 9999 : 0,
						borderBottomWidth: scrolledState ? 1 : 0,
						borderLeftWidth: scrolledState ? 1 : 0,
						borderRightWidth: scrolledState ? 1 : 0,
						borderTopWidth: scrolledState ? 1 : 0,
						borderColor: scrolledState
							? "rgba(255, 255, 255, 0.15)"
							: "rgba(255, 255, 255, 0)",
						boxShadow: scrolledState
							? "0 10px 40px rgba(0,0,0,0.5)"
							: "0 0px 0px rgba(0,0,0,0)"
					}}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
					layout
				>
					{/* Logo */}
					<Link
						href="/"
						prefetch={true}
						className="font-heading font-black text-2xl tracking-tighter hover:text-primary transition-colors z-[60]"
					>
						Buff.
					</Link>

					{/* Desktop Navigation */}
					<nav
						className="hidden md:flex items-center gap-8 z-20"
						onMouseLeave={handleMouseLeave}
					>
						{!isHome && (
							<div onMouseEnter={() => handleMouseEnter("None")}>
								<Magnetic>
									<Link
										href="/"
										prefetch={true}
										className="font-medium text-muted-foreground hover:text-foreground transition-colors"
									>
										{t("nav_home")}
									</Link>
								</Magnetic>
							</div>
						)}
						<div onMouseEnter={() => handleMouseEnter("Services")}>
							<Magnetic>
								<button
									className={`font-medium transition-colors ${activeMenu === "Services" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
								>
									{t("nav_services")}
								</button>
							</Magnetic>
						</div>
						<div onMouseEnter={() => handleMouseEnter("None")}>
							<Magnetic>
								<Link
									href="/#about"
									prefetch={true}
									className="font-medium text-muted-foreground hover:text-foreground transition-colors"
								>
									{t("nav_about")}
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
										exit={{
											opacity: 0,
											scale: 0.95,
											transition: { duration: 0.2 }
										}}
										transition={{ type: "spring", stiffness: 300, damping: 30 }}
										className="rounded-[3rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative bg-[#0A0A0A]/98 backdrop-blur-[24px] saturate-[180%] border border-white/15"
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
											{ActiveComponent && (
												<ActiveComponent
													onLinkClick={() => setActiveMenu(null)}
												/>
											)}
										</motion.div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</nav>

					{/* CTA & Mobile Toggle */}
					<div className="flex items-center gap-4 z-[60]">
						<Magnetic>
							<Link
								href={session ? "/dashboard" : "/auth"}
								prefetch={true}
								className="hidden sm:block font-medium text-muted-foreground hover:text-foreground transition-colors mr-2"
							>
								{session ? t("nav_dashboard") : t("nav_login")}
							</Link>
						</Magnetic>
						<Magnetic>
							<Link href="#contact" prefetch={true} className="hidden sm:block">
								<div className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full text-sm hover:scale-105 transition-transform">
									{t("cta")}
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
						initial={{
							opacity: 0,
							x: "100%",
							borderTopLeftRadius: "50%",
							borderBottomLeftRadius: "50%"
						}}
						animate={{
							opacity: 1,
							x: 0,
							borderTopLeftRadius: "0%",
							borderBottomLeftRadius: "0%"
						}}
						exit={{
							opacity: 0,
							x: "100%",
							borderTopLeftRadius: "50%",
							borderBottomLeftRadius: "50%",
							transition: { duration: 0.3 }
						}}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="fixed inset-0 z-[55] bg-[#050505]/98 backdrop-blur-3xl flex flex-col px-4 md:hidden overflow-y-auto pb-12"
					>
						{/* Mobile Menu Header */}
						<div className="flex items-center justify-between py-8 px-8">
							<Link
								href="/"
								onClick={() => setIsMobileMenuOpen(false)}
								className="font-heading font-black text-2xl tracking-tighter hover:text-primary transition-colors"
							>
								Buff.
							</Link>
							<button
								onClick={() => setIsMobileMenuOpen(false)}
								className="p-2 text-foreground"
							>
								<X size={28} />
							</button>
						</div>

						{/* Services Section */}
						<div className="flex flex-col mb-8 mt-4 pt-4">
							<h4 className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-4 px-8">
								{t("mobile_services_headline")}
							</h4>
							<div className="px-4">
								<ServicesMenu onLinkClick={() => setIsMobileMenuOpen(false)} />
							</div>
						</div>

						{/* Main Links */}
						<div className="flex flex-col gap-6 px-8">
							<h4 className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-2">
								{t("mobile_menu_headline")}
							</h4>
							{[
								...(!isHome ? [{ label: t("nav_home"), href: "/" }] : []),
								{ label: t("mobile_about"), href: "/#about" },
								{ label: t("mobile_contact"), href: "/#contact" },
								{
									label: session ? t("nav_dashboard") : t("nav_login"),
									href: session ? "/dashboard" : "/auth"
								}
							].map((item, i) => (
								<motion.div
									key={item.label}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 + i * 0.1 }}
								>
									<Link
										href={item.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="text-3xl font-heading font-bold tracking-tighter text-white hover:text-primary transition-colors flex items-center justify-between"
									>
										{item.label}
										<ArrowUpRight size={24} className="text-white/20" />
									</Link>
								</motion.div>
							))}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="mt-4"
							>
								<Link
									href="/#contact"
									onClick={() => setIsMobileMenuOpen(false)}
									className="w-full flex items-center justify-center py-4 rounded-full bg-primary text-primary-foreground font-heading font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform"
								>
									{t("cta")}
								</Link>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
