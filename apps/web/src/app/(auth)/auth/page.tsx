"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Eye, EyeOff, Github, Loader2, AlertCircle } from "lucide-react";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const signupEnabled = false; // Toggle for later switch usage

  // Zod Schemas
  const loginSchema = z.object({
    email: z.string().email({ message: t('error_invalid_email') }),
    password: z.string().min(10, { message: t('error_password_min') }),
  });

  const signupSchema = z.object({
    name: z.string().min(2, { message: t('error_name_min') }),
    company: z.string().optional(),
    email: z.string().email({ message: t('error_invalid_email') }),
    password: z.string().min(10, { message: t('error_password_min') }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;
  type SignupFormValues = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(authMode === 'login' ? loginSchema : signupSchema) as any,
    mode: "onChange",
    defaultValues: {
        email: "",
        password: "",
        name: "",
        company: "",
    } as SignupFormValues
  });

  // Reset states when switching modes
  useEffect(() => {
    reset();
    setServerError(null);
  }, [authMode, reset]);

  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
        if (authMode === 'login') {
            const { error } = await signIn.email({
                email: data.email,
                password: data.password,
                callbackURL: "/dashboard"
            });
            
            if (error) {
                setServerError(error.message || "An error occurred during sign in.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } else {
            const { error } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                callbackURL: "/dashboard"
            });
            
            if (error) {
                setServerError(error.message || "An error occurred during sign up.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        }
    } catch (err: any) {
        setServerError("Failed to connect to authentication server.");
        console.error("Auth Error:", err);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div 
        className="min-h-[130vh] w-full flex flex-col relative overflow-hidden bg-[#0A0A0A]"
      >
        <div className="flex-1 w-full flex items-center justify-center pt-48 pb-[30vh] relative z-10">
          {/* Static Deep Mesh Background */}
          <div 
            className="absolute inset-0 z-0 opacity-60 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(26, 16, 37, 0.8) 0%, rgba(10, 10, 10, 1) 50%)`
            }}
          />
          
          {/* Grain overlay for premium texture */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />

          {/* Auth Card Container */}
          <motion.div 
            layout
            className="relative z-10 max-w-md w-full mx-4 bg-[#2C2C2C]/20 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
          >
            {/* Toggle Controls */}
            <div className="flex bg-[#0A0A0A]/50 p-1.5 rounded-full mb-8 relative border border-white/5">
              <button 
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors duration-300 ${authMode === 'login' ? 'text-black' : 'text-[#A0A0B0] hover:text-white'}`}
              >
                {t('toggle_login')}
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-sm font-bold z-10 transition-colors duration-300 ${authMode === 'signup' ? 'text-black' : 'text-[#A0A0B0] hover:text-white'}`}
              >
                {t('toggle_signup')}
              </button>
              
              <motion.div 
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#CCFF00] rounded-full z-0 shadow-lg"
                initial={false}
                animate={{ 
                  x: authMode === 'login' ? '4px' : 'calc(100% + 4px)' 
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            </div>

            {/* Title */}
            <motion.h1 
              layout="position"
              className="text-3xl font-heading font-bold text-white mb-4 tracking-tight"
            >
              {authMode === 'login' ? t('login_title') : t('signup_title')}
            </motion.h1>

            {/* Content Area (Login vs Signup) */}
            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-5">
                    {/* Server Error Message */}
                    {serverError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{serverError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                        {t('email_label')}
                      </label>
                      <input 
                        {...register("email")}
                        type="email" 
                        placeholder={t('email_placeholder')}
                        className={`w-full bg-[#0A0A0A]/50 border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                      />
                      {errors.email && <span className="text-red-500 text-[10px] ml-1">{errors.email.message as string}</span>}
                    </div>

                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                        {t('password_label')}
                      </label>
                      <div className="relative">
                        <input 
                          {...register("password")}
                          type={showPassword ? "text" : "password"} 
                          placeholder={t('password_placeholder')}
                          className={`w-full bg-[#0A0A0A]/50 border rounded-xl pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-white/10'}`}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
                          title={showPassword ? t('hide_password') : t('show_password')}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <span className="text-red-500 text-[10px] ml-1">{errors.password.message as string}</span>}
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isSubmitting || !isValid}
                        className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submit_login')}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {signupEnabled ? (
                    <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-5">
                       {/* Signup fields */}
                       <div className="flex gap-4">
                          <div className="flex flex-col gap-2 flex-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                              {t('name_label')}
                            </label>
                            <input 
                              {...register("name")}
                              type="text" 
                              placeholder={t('name_placeholder')}
                              className={`w-full bg-[#0A0A0A]/50 border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.name ? 'border-red-500' : 'border-white/10'}`}
                            />
                            {errors.name && <span className="text-red-500 text-[10px] ml-1">{errors.name.message as string}</span>}
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                              {t('company_label')}
                            </label>
                            <input 
                              {...register("company")}
                              type="text" 
                              placeholder={t('company_placeholder')}
                              className={`w-full bg-[#0A0A0A]/50 border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.company ? 'border-red-500' : 'border-white/10'}`}
                            />
                            {errors.company && <span className="text-red-500 text-[10px] ml-1">{errors.company.message as string}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                            {t('email_label')}
                          </label>
                          <input 
                            {...register("email")}
                            type="email" 
                            placeholder={t('email_placeholder')}
                            className={`w-full bg-[#0A0A0A]/50 border rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                          />
                          {errors.email && <span className="text-red-500 text-[10px] ml-1">{errors.email.message as string}</span>}
                        </div>
                        <div className="flex flex-col gap-2 relative">
                          <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
                            {t('password_label')}
                          </label>
                          <div className="relative">
                            <input 
                              {...register("password")}
                              type={showPassword ? "text" : "password"} 
                              placeholder={t('password_placeholder')}
                              className={`w-full bg-[#0A0A0A]/50 border rounded-xl pl-4 sm:pl-5 pr-12 py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-white/10'}`}
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
                              title={showPassword ? t('hide_password') : t('show_password')}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          {errors.password && <span className="text-red-500 text-[10px] ml-1">{errors.password.message as string}</span>}
                        </div>
                        <div className="pt-4">
                          <button 
                            type="submit"
                            disabled={isSubmitting || !isValid}
                            className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('submit_signup')}
                          </button>
                        </div>
                    </form>
                  ) : (
                    <div className="py-8 px-6 bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl flex flex-col items-center text-center gap-4 text-[#CCFF00]">
                      <AlertCircle className="w-10 h-10 opacity-50" />
                      <div className="flex flex-col gap-2">
                        <span className="text-lg font-bold tracking-tight">{t('signup_disabled_title')}</span>
                        <span className="text-sm opacity-80 leading-relaxed max-w-[240px] mx-auto">{t('signup_disabled_description')}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout="position" className="mt-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono">
                  {t('divider')}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-3 bg-transparent border border-white/10 text-white py-3 rounded-xl hover:bg-[#2C2C2C] hover:border-white/20 transition-all duration-300 font-medium text-sm group">
                  <Github className="w-4 h-4 text-[#A0A0B0] group-hover:text-white transition-colors" />
                  GitHub
                </button>
                <button className="flex-1 flex items-center justify-center gap-3 bg-transparent border border-white/10 text-white py-3 rounded-xl hover:bg-[#2C2C2C] hover:border-white/20 transition-all duration-300 font-medium text-sm group">
                  <svg className="w-4 h-4 text-[#A0A0B0] group-hover:opacity-100 opacity-70 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
}
