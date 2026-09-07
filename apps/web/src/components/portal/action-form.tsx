"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/primitives";
import type { ActionState } from "@/lib/portal-actions";

export function ActionForm({ action, children, submitLabel = "Änderungen speichern", resetOnSuccess = false, className = "" }: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success && resetOnSuccess) ref.current?.reset(); }, [state, resetOnSuccess]);
  return <form ref={ref} action={formAction} className={`space-y-4 ${className}`}>
    <fieldset disabled={isPending} className="min-w-0 space-y-4 disabled:opacity-60">{children}</fieldset>
    {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
    {state.success && <p role="status" className="text-sm text-foreground">{state.success}</p>}
    <Button type="submit" disabled={isPending}>{isPending ? "Wird gespeichert…" : submitLabel}</Button>
  </form>;
}
