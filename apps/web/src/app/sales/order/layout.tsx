import Image from "next/image";

export default function SalesOrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/branding/buff_interactive.acid-lime_white.svg"
              alt="Buff Interactive Logo"
              width={140}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </div>
          <h1 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Digitaler Vertragsabschluss
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start py-8 px-4 sm:px-6 md:px-8 max-w-4xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

