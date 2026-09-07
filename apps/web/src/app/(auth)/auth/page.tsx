"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Github } from "lucide-react";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, signUp } from "@/lib/auth-client";
import { safeNext } from "@/lib/safe-next";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, PasswordField, ServerError, SubmitButton } from "./_components/AuthFields";

export default function AuthPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  // Every one of these lands in router.push and in magic-link callbackURL, so
  // an unchecked value is an open redirect on the page the signing gate sends
  // denied visitors to.
  const redirectTo = safeNext(
    searchParams.get('from') || searchParams.get('callbackUrl') || searchParams.get('redirectTo')
  );

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'link'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);

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

  const linkSchema = z.object({
    email: z.string().email({ message: t('error_invalid_email') }),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;
  type SignupFormValues = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(
      authMode === 'login' ? loginSchema : authMode === 'signup' ? signupSchema : linkSchema
    ) as any,
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
    setLinkSent(false);
  }, [authMode, reset]);

  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
        if (authMode === 'login') {
            const { error } = await signIn.email({
                email: data.email,
                password: data.password,
                callbackURL: redirectTo
            });

            if (error) {
                setServerError(error.message || "An error occurred during sign in.");
            } else {
                router.push(redirectTo);
                router.refresh();
            }
        } else {
            const { error } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                company: data.company || undefined,
                callbackURL: redirectTo
            });

            if (error) {
                setServerError(error.message || "An error occurred during sign up.");
            } else {
                router.push(redirectTo);
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
              {(['login', 'signup', 'link'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold z-10 transition-colors duration-300 ${
                    authMode === mode ? 'text-black' : 'text-[#A0A0B0] hover:text-white'
                  }`}
                >
                  {mode === 'login' ? t('toggle_login') : mode === 'signup' ? t('toggle_signup') : t('toggle_link')}
                </button>
              ))}

              <motion.div
                className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-[#CCFF00] rounded-full z-0 shadow-lg"
                initial={false}
                animate={{
                  x: authMode === 'login' ? '4px' : authMode === 'signup' ? 'calc(100% + 4px)' : 'calc(200% + 4px)',
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            </div>

            {/* Title */}
            <motion.h1
              layout="position"
              className="text-3xl font-heading font-bold text-white mb-4 tracking-tight"
            >
              {authMode === 'login' ? t('login_title') : authMode === 'signup' ? t('signup_title') : t('link_title')}
            </motion.h1>

            {/* Content Area (Login vs Signup vs Link) */}
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
                    {serverError && <ServerError message={serverError} />}

                    <TextField
                      label={t('email_label')}
                      type="email"
                      placeholder={t('email_placeholder')}
                      register={register("email")}
                      error={errors.email?.message as string | undefined}
                    />

                    <PasswordField
                      label={t('password_label')}
                      placeholder={t('password_placeholder')}
                      register={register("password")}
                      error={errors.password?.message as string | undefined}
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                    />

                    <div className="pt-4">
                      <SubmitButton disabled={isSubmitting || !isValid} loading={isSubmitting}>
                        {t('submit_login')}
                      </SubmitButton>
                    </div>
                  </form>
                </motion.div>
              ) : authMode === 'signup' ? (
                <motion.div
                  key="signup-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-5">
                     {/* Server Error Message */}
                     {serverError && <ServerError message={serverError} />}

                     {/* Signup fields */}
                     <div className="flex gap-4">
                        <div className="flex-1">
                          <TextField
                            label={t('name_label')}
                            placeholder={t('name_placeholder')}
                            register={register("name")}
                            error={errors.name?.message as string | undefined}
                          />
                        </div>
                        <div className="flex-1">
                          <TextField
                            label={t('company_label')}
                            placeholder={t('company_placeholder')}
                            register={register("company")}
                            error={errors.company?.message as string | undefined}
                          />
                        </div>
                      </div>

                      <TextField
                        label={t('email_label')}
                        type="email"
                        placeholder={t('email_placeholder')}
                        register={register("email")}
                        error={errors.email?.message as string | undefined}
                      />

                      <PasswordField
                        label={t('password_label')}
                        placeholder={t('password_placeholder')}
                        register={register("password")}
                        error={errors.password?.message as string | undefined}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                      />

                      <div className="pt-4">
                        <SubmitButton disabled={isSubmitting || !isValid} loading={isSubmitting}>
                          {t('submit_signup')}
                        </SubmitButton>
                      </div>
                  </form>
                </motion.div>
              ) : authMode === 'link' ? (
                <motion.div
                  key="link-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {linkSent ? (
                    <div className="py-8 px-6 bg-[#CCFF00]/5 border border-[#CCFF00]/20 rounded-2xl text-center text-[#CCFF00]">
                      <p className="text-lg font-bold tracking-tight mb-2">Link ist unterwegs</p>
                      <p className="text-sm opacity-80 leading-relaxed">
                        Falls ein Konto mit dieser Adresse existiert, findest Du gleich einen Login-Link in Deinem Postfach.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(async (data) => {
                        setIsSubmitting(true);
                        setServerError(null);
                        try {
                          await signIn.magicLink({ email: data.email, callbackURL: redirectTo });
                        } catch (err) {
                          // Swallow: a thrown error must look identical to
                          // success, or the form becomes an email oracle for
                          // enumerating accounts.
                          console.error("Magic link error:", err);
                        } finally {
                          // Always report success, regardless of outcome above.
                          setLinkSent(true);
                          setIsSubmitting(false);
                        }
                      })}
                      noValidate
                      className="flex flex-col gap-5"
                    >
                      {serverError && <ServerError message={serverError} />}
                      <p className="text-sm text-[#A0A0B0] leading-relaxed">
                        Wir schicken Dir einen Link, mit dem Du Dich ohne Passwort anmeldest.
                      </p>
                      <TextField
                        label={t('email_label')}
                        type="email"
                        placeholder={t('email_placeholder')}
                        register={register("email")}
                        error={errors.email?.message as string | undefined}
                      />
                      <div className="pt-4">
                        <SubmitButton disabled={isSubmitting} loading={isSubmitting}>
                          Login-Link senden
                        </SubmitButton>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : null}
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
