"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/primitives";
export function RefreshMessages() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return <Button variant="outline" disabled={isPending} onClick={() => startTransition(() => router.refresh())}><RefreshCw size={14} />{isPending ? "Wird aktualisiert…" : "Aktualisieren"}</Button>;
}
