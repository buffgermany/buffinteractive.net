export default function Loading() {
  return <div role="status" aria-label="Bereich wird geladen" className="space-y-8 motion-safe:animate-pulse"><div className="h-10 w-60 rounded bg-secondary" /><div className="h-5 w-3/4 rounded bg-secondary" /><div className="h-20 rounded bg-secondary" /><div className="grid gap-8 md:grid-cols-2"><div className="h-64 rounded-xl bg-secondary" /><div className="h-64 rounded-xl bg-secondary" /></div><span className="sr-only">Bereich wird geladen…</span></div>;
}
