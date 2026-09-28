"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore } from "@/store/accessibility";
import { Archive, ScanLine, Tag, SearchCode, Brain, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Archive,    label: "Archive",    sub: "Primary source documents ingested" },
  { icon: ScanLine,   label: "Digitize",   sub: "OCR & manuscript transcription" },
  { icon: Tag,        label: "Organize",   sub: "Verified metadata & classification" },
  { icon: SearchCode, label: "Understand", sub: "Semantic embeddings & vector search" },
  { icon: Brain,      label: "Answer",     sub: "RAG with inline source citations" },
  { icon: Sparkles,   label: "Experience", sub: "Web, kiosk, display & research" },
];

export function HomePipeline() {
  const { language }     = useLanguageStore();
  const { reduceMotion } = useAccessibilityStore();
  const tr = useTranslations(language);
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <Section className="bg-night border-y border-[rgba(244,237,224,0.07)]">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow={tr("home.pipeline.eyebrow")}
            title={tr("home.pipeline.title")}
            align="center"
            className="mb-16"
          />
        </ScrollReveal>

        {/* Pipeline strip */}
        <div className="relative" ref={lineRef}>
          {/* Animated gold line */}
          <div className="absolute top-[2.25rem] left-8 right-8 h-px hidden lg:block overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-gold to-transparent"
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={lineInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.3 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center gap-3"
              >
                {/* Node circle */}
                <div className="relative z-10 w-[4.5rem] h-[4.5rem] rounded-full bg-panel border border-[rgba(244,237,224,0.12)] flex items-center justify-center shadow-card group-hover:border-gold/30 transition-all">
                  <step.icon size={22} strokeWidth={1.5} className="text-gold/60" />
                </div>
                <div>
                  <p className="font-sans text-[0.8125rem] font-semibold text-ivory/80">{step.label}</p>
                  <p className="font-sans text-[0.7rem] text-ivory/35 mt-0.5 leading-snug max-w-[100px] mx-auto">{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bold statement */}
        <ScrollReveal delay={0.4} className="mt-16 text-center">
          <p className="font-serif text-h2 text-ivory/80 max-w-2xl mx-auto" style={{ textWrap: "balance" } as React.CSSProperties}>
            "{tr("home.pipeline.statement")}"
          </p>
        </ScrollReveal>

        {/* Step detail cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {[
            { title: "Verified Sources Only",   body: "Every document in the archive is assigned a source citation before it is ingested. No unverified content is surfaced." },
            { title: "Evidence-First Retrieval",body: "The AI retrieves relevant passages from the archive before composing any response. Generation is grounded in evidence." },
            { title: "Citation Transparency",   body: "Every answer includes inline references to the specific archival item, page or timestamp from which it was derived." },
          ].map((card, i) => (
            <ScrollReveal key={card.title} delay={0.1 * i}>
              <TiltCard>
                <div className="surface rounded-card p-6 h-full space-y-3">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-gold to-transparent rounded-full" />
                  <h3 className="font-sans text-[0.9375rem] font-semibold text-ivory">{card.title}</h3>
                  <p className="font-sans text-caption text-ivory/45 leading-relaxed">{card.body}</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
