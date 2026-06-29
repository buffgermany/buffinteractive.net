"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

type City = "chemnitz" | "dresden" | "leipzig";

const CITY_DATA: Record<City, { title: string; text: string; imageUrl: string }> = {
  chemnitz: {
    title: "Mitten in Chemnitz #Zuhause.",
    text: "Keine anonyme Großagentur, kein Callcenter im Ausland. Wir sitzen direkt hier in Chemnitz. Wir kennen die Stadt, trinken den gleichen Kaffee wie du und arbeiten auf Augenhöhe mit den Machern und Unternehmen vor Ort – wie dir. Persönlich, direkt und unkompliziert.",
    imageUrl: "https://images.unsplash.com/photo-1694798932089-05721661d354?q=80&w=2000&auto=format&fit=crop" // Placeholder: replace with actual Chemnitz image
  },
  dresden: {
    title: "Direkt vor Ort in Dresden.",
    text: "Dresden kann Hochglanz, Tradition und starke Wirtschaft. Nur keine Brücken bauen. Spaß beiseite, wir sind direkt hier in der Stadt, sprechen eure Sprache und arbeiten auf Augenhöhe mit den Unternehmen vor Ort. Persönlich, direkt und ohne Umwege.",
    imageUrl: "https://images.unsplash.com/photo-1619120810930-6ca5048deee1?q=80&w=2000&auto=format&fit=crop" // Placeholder: replace with actual Dresden image
  },
  leipzig: {
    title: "Direkt vor Ort in Leipzig.",
    text: "Leipzig ist laut, kreativ und bewegt sich verdammt schnell. Genau unser Tempo. Genau diese Macher-Mentalität von Leipzig steckt tief in unserer DNA. Wir sind da, um euer Business digital nach vorne zu peitschen - lokal, hier bei dir in Leipzig und Umland.",
    imageUrl: "https://images.unsplash.com/photo-1689844178578-839e0fda77da?q=80&w=2000&auto=format&fit=crop" // Placeholder: replace with actual Leipzig image
  }
};

export function LocalCityConnection({ city }: { city: City }) {
  const data = CITY_DATA[city];

  return (
    <section className="relative w-full pt-32 pb-48 md:pt-40 md:pb-64 px-6 overflow-hidden bg-[#050505]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">

        {/* Left: Image with local styling */}
        <motion.div
          initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 relative"
        >
          {/* Decorative background elements */}
          <div className="absolute -inset-4 bg-white/5 rounded-3xl -z-10 rotate-3 border border-white/10" />
          <div className="absolute -inset-2 bg-primary/10 rounded-3xl -z-10 -rotate-2" />

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img
              src={data.imageUrl}
              alt={`${city} city`}
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
            />
            {/* Location tag badge */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono tracking-widest text-white uppercase">{city}</span>
            </div>
          </div>
        </motion.div>

        {/* Right: Copy */}
        <motion.div
          initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight leading-tight">
            {data.title}
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            {data.text}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
