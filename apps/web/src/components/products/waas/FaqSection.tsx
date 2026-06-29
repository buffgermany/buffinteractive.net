'use client';

import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: 'allgemein' | 'ablauf' | 'technik';
}

const faqs: FaqItem[] = [
  {
    category: "allgemein",
    question: "Gehört die Website & Domain nach dem Kauf mir?",
    answer: "Ja, zu 100%. Die Domain wird sofort auf deinen Namen registriert – du bist und bleibst der rechtmäßige Eigentümer. Und die Website? Keine unfairen Fesseln: Nach Ablauf der Mindestlaufzeit gehört der gesamte Quellcode und das Design vollständig dir. Wenn du dich entscheidest zu gehen, nimmst du alles mit. Kein Vendor-Lock-in, kein Geiseldrama."
  },
  {
    category: "allgemein",
    question: "Gibt es eine Mindestvertragslaufzeit?",
    answer: "Ja, 12 Monate. Warum? Weil wir das finanzielle Risiko für dich tragen. Statt 5.000 € bis 10.000 € vorab für eine maßgeschneiderte High-End-Website zu verlangen, investieren wir unsere Arbeit im Voraus und verteilen die Kosten fair auf eine monatliche Gebühr. Nach den ersten 12 Monaten bist du völlig frei und kannst monatlich kündigen. Ein faires Partnerschaftsmodell."
  },
  {
    category: "allgemein",
    question: "Gibt es versteckte Kosten oder böse Überraschungen?",
    answer: "Nein. Wir hassen Kleingedrucktes genauso wie du. Dein Festpreis deckt alles ab: Hosting, Sicherheit, Updates und den Änderungsservice (z. B. Bilder- oder Textwechsel). Erst wenn du ein dickes Upgrade oder ein komplettes Redesign brauchst, fällt das unter ein separates Projektbudget – worüber wir natürlich vorher ganz offen mit dir sprechen."
  },
  {
    category: "ablauf",
    question: "Wie schnell werden meine Änderungswünsche umgesetzt?",
    answer: "In Rekordzeit. Du hast quasi deinen persönlichen Web-Entwickler auf Kurzwahl. Schick uns deine Wünsche einfach unkompliziert per WhatsApp oder E-Mail. Kleinere Anpassungen (Texte, Bilder, Teampartner) erledigen wir meistens innerhalb weniger Stunden – garantiert aber in unter 24 Stunden. Kein Ticket-System, keine Warteschleifen."
  },
  {
    category: "ablauf",
    question: "Wie kann ich Bilder oder Texte für Änderungen einreichen?",
    answer: "Einfach per E-Mail oder über unseren Support-Kanal. Du musst dich in kein CMS wie WordPress einarbeiten. Wir bitten dich lediglich im Rahmen unserer Fair-Use Policy, Änderungswünsche gebündelt und nachvollziehbar zu liefern (bitte keine unstrukturierten Text-Schnipsel oder fragmentierten Sprachnachrichten). Teile uns strukturiert mit, wo welcher neue vollständige Text hin soll, und wir pflegen ihn pixelgenau für dich ein. Du lehnst dich entspannt zurück."
  },
  {
    category: "ablauf",
    question: "Was passiert, wenn mir der erste Design-Entwurf nicht gefällt?",
    answer: "Wir überarbeiten ihn, bis du begeistert bist. Wir starten mit einem tiefen Verständnis deiner Marke und erstellen einen maßgeschneiderten Entwurf. Solltest du nicht zu 100% glücklich sein, passen wir das Design so lange an, bis es perfekt sitzt. Erst nach deiner expliziten Freigabe geht die Seite live. Du trägst absolut kein Risiko."
  },
  {
    category: "ablauf",
    question: "Wie lange dauert es, bis meine neue Website online ist?",
    answer: "In der Regel nur 2 bis 3 Wochen. Sobald wir deine Freigabe und die ersten Infos haben, geht es blitzschnell. Deinen ersten interaktiven Designentwurf siehst du bereits nach ca. 7 Tagen. Während traditionelle Agenturen monatelang konzipieren, bist du bei uns in kürzester Zeit bereit, neue Kunden über deine Website zu gewinnen."
  },
  {
    category: "technik",
    question: "Ist die Website rechtssicher und DSGVO-konform?",
    answer: "Ja, absolut rechtssicher. Abmahnungen sind der Albtraum jedes Unternehmers. Deshalb bauen wir - falls nötig - ein dynamisches, DSGVO-konformes Consent-Tool ein und binden Impressums- und Datenschutzerklärungen ein. Gehostet wird alles auf ISO-zertifizierten, deutschen Servern – zu 100% datenschutzkonform."
  },
  {
    category: "technik",
    question: "Was passiert, wenn ich bereits eine Domain besitze?",
    answer: "Ein reibungsloser, kostenloser Umzug. Deine E-Mails laufen ohne eine einzige Sekunde Ausfall weiter. Wir übernehmen den gesamten DNS- und Domain-Umzug komplett im Hintergrund für dich. Wenn du deine Domain lieber bei deinem aktuellen Anbieter lassen willst – kein Problem, wir verknüpfen sie einfach per DNS-Eintrag. Du merkst von dem Wechsel nichts."
  },
  {
    category: "technik",
    question: "Ist schnelles Premium-Hosting im Preis inklusive?",
    answer: "Ja, High-Speed-Hosting auf Enterprise-Niveau. Eine langsame Website vernichtet Ladezeit und damit wertvolle Kundenanfragen. Deine neue Seite liegt auf extrem schnellen, deutschen Servern mit modernster Cache-Technologie. Inklusive: automatisierte tägliche Backups (falls mal was schiefgeht), DDoS-Schutz, modernste Firewalls und das obligatorische SSL-Zertifikat."
  },
  {
    category: "technik",
    question: "Wie steht es um die Suchmaschinenoptimierung (SEO)?",
    answer: "Wir optimieren von Tag 1 an für maximale Sichtbarkeit. Eine schöne Website nützt dir gar nichts, wenn sie für potenzielle Kunden unsichtbar bleibt. Jede Seite wird nach modernsten On-Page SEO-Standards aufgebaut: blitzschneller Code, optimierte Ladezeiten für Google-Rankings (Core Web Vitals) und saubere Strukturen."
  }
];

type CategoryFilter = 'all' | 'allgemein' | 'ablauf' | 'technik';

const categories: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "Alle Fragen" },
  { value: "allgemein", label: "Allgemein" },
  { value: "ablauf", label: "Ablauf & Service" },
  { value: "technik", label: "Technik & Recht" }
];

function AccordionItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        opacity: { duration: 0.25 },
        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        layout: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className="border-b border-white/5 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full py-6 flex justify-between items-center text-left group gap-4 focus:outline-hidden"
      >
        <span className="font-heading font-bold text-lg md:text-xl text-white group-hover:text-[#CCFF00] transition-colors duration-300">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300 ${isOpen
            ? "border-[#CCFF00]/30 bg-[#CCFF00]/5 text-[#CCFF00]"
            : "border-white/10 text-white/40 group-hover:border-white/20 group-hover:text-white"
            }`}
        >
          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pr-12 text-sm sm:text-base text-[#A0A0B0] leading-relaxed font-sans">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection({ city }: { city?: string } = {}) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [openIndexes, setOpenIndexes] = useState<{ [key: string]: boolean }>({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Dynamically localize FAQs if city is provided
  const localizedFaqs = React.useMemo(() => {
    if (!city) return faqs;
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
    return faqs.map(faq => {
      // Localize common general patterns in questions and answers
      const question = faq.question
        .replace(/Website & Domain/g, `Website & Domain in ${capitalizedCity}`)
        .replace(/die Suchmaschinenoptimierung/g, `die Suchmaschinenoptimierung in ${capitalizedCity}`);
      
      const answer = faq.answer
        .replace(/deine Website/g, `deine Website in ${capitalizedCity}`)
        .replace(/deine neue Seite/g, `deine neue Seite für ${capitalizedCity}`)
        .replace(/jede Website/g, `jede Website in ${capitalizedCity}`)
        .replace(/deinen neuen Web-Autopiloten/g, `deinen neuen Web-Autopiloten in ${capitalizedCity}`)
        .replace(/Unternehmen und Selbstständige/g, `Unternehmen und Selbstständige in ${capitalizedCity}`)
        .replace(/für deine Marke/g, `für deine Marke in ${capitalizedCity}`)
        .replace(/Arbeit im Voraus/g, `Arbeit in ${capitalizedCity} im Voraus`);

      return { ...faq, question, answer };
    });
  }, [city]);

  const filteredFaqs = localizedFaqs.filter(
    faq => activeCategory === 'all' || faq.category === activeCategory
  );

  const handleToggle = (question: string) => {
    setOpenIndexes(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };

  const handleCategoryChange = (cat: CategoryFilter) => {
    setActiveCategory(cat);
    setIsExpanded(false);
  };

  const showExpandButton = filteredFaqs.length > 5;
  const displayedFaqs = showExpandButton && !isExpanded
    ? filteredFaqs.slice(0, 5)
    : filteredFaqs;

  return (
    <section id="faq" className="py-24 md:py-32 px-6 bg-[#050505] relative overflow-hidden">
      {/* Background glow vignette */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-primary/2 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border border-white/5 bg-white/5 text-white/50"
          >
            Häufige Fragen
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tighter leading-tight"
          >
            Keine Geheimnisse. <br className="sm:hidden" />
            Nur <span className="text-[#CCFF00]">klare Antworten.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
            className="max-w-xl text-[#A0A0B0] text-sm sm:text-base leading-relaxed"
          >
            Alles, was du über deinen neuen Web-Autopiloten wissen musst. Transparent, verständlich und ohne technisches Kauderwelsch.
          </motion.p>
        </div>

        {/* Dynamic Category Pill Selector */}
        <div className="flex justify-center mb-12 md:mb-16 relative z-20">
          <div className="bg-[#121212]/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex flex-wrap md:flex-nowrap justify-center items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-5 py-2 rounded-full text-xs font-bold font-sans transition-all duration-300 relative whitespace-nowrap ${activeCategory === cat.value
                  ? "text-black"
                  : "text-white/60 hover:text-white"
                  }`}
              >
                {activeCategory === cat.value && (
                  <motion.div
                    layoutId="faqCategoryToggle"
                    className="absolute inset-0 bg-[#CCFF00] rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List with Layout Animations */}
        <LayoutGroup>
          <motion.div
            layout="position"
            className="flex flex-col border-t border-white/5 min-h-[350px]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {displayedFaqs.map((faq) => (
                <AccordionItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={!!openIndexes[faq.question]}
                  onToggle={() => handleToggle(faq.question)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {/* Show More Button */}
        {showExpandButton && (
          <div className="flex justify-center mt-8 relative z-20">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="group flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-[#121212]/80 hover:bg-[#CCFF00]/5 hover:border-[#CCFF00]/30 hover:text-[#CCFF00] text-xs font-bold text-white/80 transition-all duration-300 active:scale-95"
            >
              <span>{isExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="shrink-0"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2} />
              </motion.div>
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
