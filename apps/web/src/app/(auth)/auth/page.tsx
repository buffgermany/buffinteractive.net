"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Header } from "@/components/buff/Header";
import { Footer } from "@/components/buff/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn, signUp, getSession } from "@/lib/auth-client";
import { safeNext } from "@/lib/safe-next";
import { useRouter, useSearchParams } from "next/navigation";
import { TextField, PasswordField, ServerError, SubmitButton } from "./_components/AuthFields";

export default function AuthPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sanitize redirect target to prevent open redirects
  const explicitFrom = safeNext(
    searchParams.get('from') || searchParams.get('callbackUrl') || searchParams.get('redirectTo')
  );

  // A burnt or expired magic link sends the customer back here. They were
  // invited, so they have no password — open on the link form, not the
  // password form, and say why.
  const verifyError = searchParams.get('error');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'link'>(
    verifyError ? 'link' : 'login'
  );
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

  // If already logged in, redirect based on role immediately
  useEffect(() => {
    getSession({ query: { disableCookieCache: true } }).then((res) => {
      const existingRole = (res?.data?.user as any)?.role;
      if (existingRole) {
        handleRedirect(existingRole);
      }
    });
  }, []);

  const handleRedirect = async (providedRole?: string) => {
    let userRole = providedRole;

    if (!userRole) {
      const sessionRes = await getSession({ query: { disableCookieCache: true } });
      userRole = (sessionRes?.data?.user as any)?.role;
    }

    if (userRole === "admin") {
      // Admin users should always go to /admin (unless they came specifically from an admin subpage)
      const target = explicitFrom && explicitFrom.startsWith("/admin") ? explicitFrom : "/admin";
      router.push(target);
    } else {
      // Customer users go to requested explicit page if non-admin, otherwise /dashboard
      const target = explicitFrom && !explicitFrom.startsWith("/admin") ? explicitFrom : "/dashboard";
      router.push(target);
    }
    router.refresh();
  };

  const onFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
        if (authMode === 'login') {
            const { data: resData, error } = await signIn.email({
                email: data.email,
                password: data.password,
            });

            if (error) {
                setServerError(error.message || "An error occurred during sign in.");
            } else {
                const userRole = (resData?.user as any)?.role;
                await handleRedirect(userRole);
            }
        } else {
            const { data: resData, error } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
                company: data.company || undefined,
            });

            if (error) {
                setServerError(error.message || "An error occurred during sign up.");
            } else {
                const userRole = (resData?.user as any)?.role;
                await handleRedirect(userRole);
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
                      {verifyError && !linkSent && (
                        <p className="text-sm text-[#CCFF00] leading-relaxed">
                          Dieser Login-Link ist nicht mehr gültig. Fordere Dir unten einen neuen an.
                        </p>
                      )}
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
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
}
