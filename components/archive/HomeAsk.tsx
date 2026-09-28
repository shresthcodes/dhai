"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/ui/TiltCard";
import { GoldRule } from "@/components/ui/GoldRule";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore } from "@/store/accessibility";

/* ─── Demo chat script (DEMO DATA ONLY — no historical claims) ──────── */
const DEMO_QUESTION = "What does the archive contain about social rights and equality?";

const DEMO_ANSWER =
  "The archive contains multiple categories of materials related to social rights and equality, including written documents, speech transcripts, and records of legislative proceedings. " +
  "These are organised by topic and date of creation. You can browse them using the Archive section or search for specific terms.";

const DEMO_SOURCES = [
  { id: "src-01", title: "Demo Source 01", type: "Writing",   note: "Placeholder — verified content pending" },
  { id: "src-02", title: "Demo Source 02", type: "Speech",    note: "Placeholder — verified content pending" },
  { id: "src-03", title: "Demo Source 03", type: "Manuscript",note: "Placeholder — verified content pending" },
];

/* ─── Typewriter effect ─────────────────────────────────────────────── */
function Typewriter({ text, speed = 22, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    setDone(false);
    const id = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-gold/70 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

/* ─── Chat panel ────────────────────────────────────────────────────── */
function ChatPreview() {
  const [phase, setPhase] = useState<"idle" | "question" | "answering" | "sources">("idle");
  const [showDiagram, setShowDiagram] = useState(false);
  const { reduceMotion } = useAccessibilityStore();

  useEffect(() => {
    if (reduceMotion) { setPhase("sources"); return; }
    const t1 = setTimeout(() => setPhase("question"),  800);
    const t2 = setTimeout(() => setPhase("answering"), 2200);
    const t3 = setTimeout(() => setPhase("sources"),   5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reduceMotion]);

  return (
    <div className="glass rounded-card p-5 space-y-4 relative overflow-hidden">
      {/* Demo badge */}
      <div className="flex items-center justify-between">
        <span className="eyebrow text-ivory/30">Ask the Archive · Demo</span>
        <DemoBadge />
      </div>

      <GoldRule width="full" />

      {/* Question bubble */}
      <AnimatePresence>
        {(phase === "question" || phase === "answering" || phase === "sources") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="bg-gold/12 border border-gold/20 rounded-card rounded-br-sharp px-4 py-3 max-w-[85%]">
              <p className="font-sans text-[0.8125rem] text-ivory/80">
                {reduceMotion ? DEMO_QUESTION : <Typewriter text={DEMO_QUESTION} speed={28} />}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer */}
      <AnimatePresence>
        {(phase === "answering" || phase === "sources") && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={13} strokeWidth={1.5} className="text-gold/70" />
            </div>
            <div className="bg-panel border border-[rgba(244,237,224,0.09)] rounded-card rounded-bl-sharp px-4 py-3 flex-1">
              <p className="font-sans text-[0.8125rem] text-ivory/70 leading-relaxed">
                {reduceMotion ? DEMO_ANSWER : (
                  phase === "answering"
                    ? <Typewriter text={DEMO_ANSWER} speed={18} />
                    : DEMO_ANSWER
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source cards */}
      <AnimatePresence>
        {phase === "sources" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-2"
          >
            <p className="eyebrow text-ivory/25 text-[0.55rem] ml-10">Sources used</p>
            {DEMO_SOURCES.map((src, i) => (
              <motion.div
                key={src.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.14 }}
                className="ml-10 flex items-start gap-3 bg-[rgba(201,162,75,0.04)] border border-[rgba(201,162,75,0.12)] rounded-sharp px-3 py-2.5"
              >
                <div className="w-5 h-5 rounded-[3px] bg-gold/10 flex items-center justify-center shrink-0">
                  <BookOpen size={10} strokeWidth={2} className="text-gold/60" />
                </div>
                <div>
                  <p className="font-sans text-[0.75rem] font-medium text-ivory/70">{src.title}</p>
                  <p className="font-sans text-[0.65rem] text-ivory/35">{src.type} · {src.note}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* "How DHAI answered" collapsible */}
      {phase === "sources" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <button
            onClick={() => setShowDiagram((v) => !v)}
            className="flex items-center gap-1.5 eyebrow text-gold/40 hover:text-gold/70 transition-colors mt-2"
          >
            {showDiagram ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            How DHAI answered
          </button>
          <AnimatePresence>
            {showDiagram && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["Query", "→", "Vector Search", "→", "Top-3 Chunks", "→", "LLM + Citations", "→", "Response"].map((s, i) => (
                    <span key={i} className={
                      s === "→"
                        ? "text-gold/30 text-[0.7rem]"
                        : "font-sans text-[0.65rem] bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-2 py-1 text-ivory/40"
                    }>{s}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Main section ──────────────────────────────────────────────────── */
export function HomeAsk() {
  const { language } = useLanguageStore();
  const tr = useTranslations(language);

  return (
    <Section id="ask">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left copy */}
          <div className="space-y-7">
            <ScrollReveal>
              <SectionHeading
                eyebrow={tr("home.ask.eyebrow")}
                title={tr("home.ask.title")}
                subtitle={tr("home.ask.sub")}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <ul className="space-y-4">
                {[
                  { title: "Evidence-grounded",   body: "Answers are retrieved from the archive, not generated from training data." },
                  { title: "Source-cited",         body: "Every response links directly to the primary archival item." },
                  { title: "Three languages",      body: "Ask in English, Hindi or Gujarati. Responses are language-matched." },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <div className="w-1 h-1 rounded-full bg-gold mt-2.5 shrink-0" />
                    <div>
                      <p className="font-sans text-[0.875rem] font-semibold text-ivory/80">{item.title}</p>
                      <p className="font-sans text-caption text-ivory/40">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Button variant="primary" size="md" href="/ask">{tr("home.ask.cta")}</Button>
            </ScrollReveal>
          </div>

          {/* Right: chat preview */}
          <ScrollReveal delay={0.15}>
            <TiltCard maxTilt={4}>
              <ChatPreview />
            </TiltCard>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
