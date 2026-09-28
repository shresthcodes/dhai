"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore } from "@/store/accessibility";

const NODES = [
  { label: "Early Years",   sub: "Origins and formative experiences" },
  { label: "Education",     sub: "Academic journey and intellectual formation" },
  { label: "Public Work",   sub: "Activism, writing and leadership" },
  { label: "Constitution",  sub: "Drafting and deliberation" },
  { label: "Legacy",        sub: "Continuing influence and scholarship" },
];

export function HomeTimeline() {
  const { language }     = useLanguageStore();
  const { reduceMotion } = useAccessibilityStore();
  const tr  = useTranslations(language);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="relative py-24 bg-night overflow-hidden border-y border-[rgba(244,237,224,0.07)]"
      aria-labelledby="timeline-heading"
    >
      {/* Subtle radial bg */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,162,75,0.035) 0%, transparent 70%)" }}
      />

      <Container>
        <ScrollReveal>
          <div className="text-center mb-16 space-y-3">
            <p className="eyebrow text-gold/70">{tr("home.timeline.eyebrow")}</p>
            <h2 id="timeline-heading" className="font-serif text-h1 text-ivory">{tr("home.timeline.title")}</h2>
          </div>
        </ScrollReveal>

        {/* Timeline strip */}
        <div ref={ref} className="relative flex items-start justify-between gap-2 lg:gap-4 overflow-x-auto pb-4">
          {/* Line */}
          <div className="absolute top-[1.875rem] left-8 right-8 h-px overflow-hidden hidden sm:block">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-gold/50 to-transparent"
              initial={{ scaleX: 0, transformOrigin: "left" }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {NODES.map((node, i) => (
            <motion.div
              key={node.label}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.25 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3 min-w-[120px] flex-1"
            >
              {/* Node dot */}
              <div className="relative z-10 w-[3.75rem] h-[3.75rem] rounded-full bg-panel border border-[rgba(244,237,224,0.12)] flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.35 + i * 0.18 }}
                  className="w-2.5 h-2.5 rounded-full bg-gold/70"
                />
              </div>
              <div className="text-center">
                <p className="font-sans text-[0.8125rem] font-semibold text-ivory/75">{node.label}</p>
                <p className="font-sans text-[0.68rem] text-ivory/35 mt-0.5 leading-snug max-w-[100px] mx-auto">{node.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <ScrollReveal delay={0.4} className="flex flex-wrap gap-4 justify-center mt-14">
          <Button variant="primary"   size="md" href="/timeline">{tr("home.timeline.cta1")}</Button>
          <Button variant="secondary" size="md" href="/story">{tr("home.timeline.cta2")}</Button>
        </ScrollReveal>
      </Container>
    </section>
  );
}
