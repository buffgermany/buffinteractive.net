"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ============================================================
// Toast system — wraps Radix Toast for full keyboard + SR support
// Usage: import { useToast, Toaster } from "@/components/ui/toast"
//   const { toast } = useToast();
//   toast({ title: "Saved!", description: "Changes saved.", variant: "success" });
// ============================================================

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning";
  duration?: number;
};

type ToastStore = {
  toasts: ToastProps[];
  add: (toast: Omit<ToastProps, "id">) => void;
  remove: (id: string) => void;
};

// Simple global store for toasts (no Zustand required for this)
let listeners: Array<(toasts: ToastProps[]) => void> = [];
let memToasts: ToastProps[] = [];

const toastStore: ToastStore = {
  get toasts() {
    return memToasts;
  },
  add(toast) {
    const id = Math.random().toString(36).slice(2);
    memToasts = [...memToasts, { id, ...toast }];
    listeners.forEach((l) => l(memToasts));
    // Auto-dismiss
    setTimeout(() => toastStore.remove(id), toast.duration ?? 4000);
  },
  remove(id) {
    memToasts = memToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(memToasts));
  },
};

export function toast(props: Omit<ToastProps, "id">) {
  toastStore.add(props);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>(memToasts);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toasts, toast };
}

const variantStyles: Record<string, string> = {
  default: "border-border bg-card text-foreground",
  success: "border-emerald-500/30 bg-emerald-950/80 text-emerald-200",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive-foreground",
  warning: "border-amber-500/30 bg-amber-950/80 text-amber-200",
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          className={cn(
            "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-xl",
            "backdrop-blur-xl transition-all",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
            "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
            "sm:data-[state=open]:slide-in-from-bottom-full",
            variantStyles[toast.variant ?? "default"]
          )}
          onOpenChange={(open) => {
            if (!open) toastStore.remove(toast.id);
          }}
        >
          <div className="flex-1 space-y-1">
            {toast.title && (
              <ToastPrimitive.Title className="text-sm font-semibold">
                {toast.title}
              </ToastPrimitive.Title>
            )}
            {toast.description && (
              <ToastPrimitive.Description className="text-sm opacity-80">
                {toast.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close className="rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-md sm:flex-col" />
    </ToastPrimitive.Provider>
  );
}
