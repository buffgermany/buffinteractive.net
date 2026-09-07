"use client";
import { Button } from "@/components/ui/primitives";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="py-12"><h1 className="text-2xl font-semibold">We couldn’t load your workspace.</h1><p className="mb-6 mt-3 text-sm text-muted-foreground">Your information is safe. Try loading the page again.</p><Button onClick={reset}>Try again</Button></div>;
}
