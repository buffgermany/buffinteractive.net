"use client";
import { Button } from "@/components/ui/primitives";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="py-12"><h1 className="text-2xl font-semibold">Dein Bereich konnte nicht geladen werden.</h1><p className="mb-6 mt-3 text-sm text-muted-foreground">Deine Daten sind sicher. Lade die Seite einfach noch einmal.</p><Button onClick={reset}>Erneut versuchen</Button></div>;
}
