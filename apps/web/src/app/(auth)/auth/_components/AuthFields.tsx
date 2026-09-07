"use client";

import { Eye, EyeOff, AlertCircle } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

const BASE =
  "w-full bg-[#0A0A0A]/50 border rounded-xl py-3 sm:py-3.5 text-sm sm:text-base text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] focus:bg-[#0A0A0A] focus:ring-1 focus:ring-[#CCFF00] transition-all duration-300";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-widest text-[#A0A0B0] font-mono ml-1">
      {children}
    </label>
  );
}

export function TextField({
  label,
  type = "text",
  placeholder,
  register,
  error,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        className={`${BASE} px-4 sm:px-5 ${error ? "border-red-500" : "border-white/10"}`}
      />
      {error && <span className="text-red-500 text-[10px] ml-1">{error}</span>}
    </div>
  );
}

export function PasswordField({
  label,
  placeholder,
  register,
  error,
  show,
  onToggle,
}: {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          {...register}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`${BASE} pl-4 sm:pl-5 pr-12 ${error ? "border-red-500" : "border-white/10"}`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white transition-colors p-1"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="text-red-500 text-[10px] ml-1">{error}</span>}
    </div>
  );
}

export function ServerError({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SubmitButton({
  children,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full bg-[#CCFF00] hover:bg-[#D4FF33] text-black font-bold uppercase tracking-wider py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
