"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Globe, Accessibility } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore, type TextScale } from "@/store/accessibility";
import type { Language } from "@/data/models";
import { cn } from "@/lib/utils";

/* ─── Waveform mini animation ───────────────────────────────────────── */
function Waveform() {
  const bars = [4,8,12,7,14,10,6,13,9,5,11,8,14,6,10];
  return (
    <div className="flex items-end gap-0.5 h-10" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gold/40 rounded-full"
          animate={{ height: [h * 2, h * 3.5, h * 2] }}
          transition={{ duration: 1.1 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

/* ─── Language sample text ──────────────────────────────────────────── */
const SAMPLE: Record<Language, string> = {
  en: "The archive is open to all researchers, scholars and citizens seeking to understand ideas that shaped the nation.",
  hi: "अभिलेखागार उन सभी शोधकर्ताओं, विद्वानों और नागरिकों के लिए खुला है जो राष्ट्र को आकार देने वाले विचारों को समझना चाहते हैं।",
  mr: "हा संग्रह सर्व संशोधक, विद्वान आणि नागरिकांसाठी खुला आहे जे राष्ट्राला आकार देणाऱ्या विचारांना समजून घेऊ इच्छितात.",
  gu: "આ સંગ્રહ તમામ સંશોધકો, વિદ્વાનો અને નાગરિકો માટે ખુલ્લો છે જેઓ રાષ્ટ્રને ઘડનાર વિચારોને સમજવા ઇચ્છે છે.",
};

function LanguagePanel() {
  const [active, setActive] = useState<Language>("en");
  const langs: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिन्दी" },
    { code: "gu", label: "ગુ" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Sample language">
        {langs.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setActive(code)}
            className={cn(
              "flex-1 py-2 rounded-sharp font-sans text-xs font-semibold border transition-all",
              active === code
                ? "bg-gold/15 text-gold border-gold/30"
                : "text-ivory/45 border-[rgba(244,237,224,0.12)] hover:text-ivory/70"
            )}
            aria-pressed={active === code}
          >
            {label}
          </button>
        ))}
      </div>
      <motion.p
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="font-sans text-[0.8125rem] text-ivory/55 leading-relaxed"
        lang={active}
      >
        {SAMPLE[active]}
      </motion.p>
    </div>
  );
}

/* ─── Quick a11y toggles ────────────────────────────────────────────── */
function A11yPanel() {
  const { textScale, highContrast, setTextScale, setHighContrast } = useAccessibilityStore();
  const scales: TextScale[] = [1, 1.125, 1.25, 1.5];
  const scaleLabels = ["A", "A+", "A++", "A+++"];

  return (
    <div className="space-y-4">
      <div>
        <p className="font-sans text-[0.7rem] uppercase tracking-widest text-ivory/35 mb-2">Text Size</p>
        <div className="flex gap-2">
          {scales.map((s, i) => (
            <button
              key={s}
              onClick={() => setTextScale(s)}
              className={cn(
                "flex-1 py-1.5 rounded-sharp font-sans text-xs font-semibold border transition-all",
                textScale === s
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "text-ivory/40 border-[rgba(244,237,224,0.12)]"
              )}
              aria-pressed={textScale === s}
            >
              {scaleLabels[i]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="font-sans text-[0.8125rem] text-ivory/55">High Contrast</p>
        <button
          role="switch"
          aria-checked={highContrast}
          onClick={() => setHighContrast(!highContrast)}
          className={cn(
            "relative w-10 h-5.5 rounded-full border transition-all",
            highContrast ? "bg-gold/30 border-gold/50" : "bg-panel border-[rgba(244,237,224,0.15)]"
          )}
          style={{ height: 22 }}
        >
          <span className={cn("absolute top-0.5 w-4 h-4 rounded-full transition-all", highContrast ? "left-[1.2rem] bg-gold" : "left-0.5 bg-ivory/30")} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main section ──────────────────────────────────────────────────── */
export function HomeAccess() {
  const { language } = useLanguageStore();
  const tr = useTranslations(language);

  const panels = [
    {
      icon: Volume2,
      title: "Watch & Listen",
      desc: "Audio recordings, video documents and multimedia records from the archive.",
      content: <div className="pt-2"><Waveform /></div>,
      href: "/media",
    },
    {
      icon: Globe,
      title: "Read in Your Language",
      desc: "Content available in English, Hindi and Gujarati. Switch anytime.",
      content: <LanguagePanel />,
      href: "/archive",
    },
    {
      icon: Accessibility,
      title: "Accessible by Design",
      desc: "Text size, contrast and motion settings that really work — try them now.",
      content: <A11yPanel />,
      href: "#",
    },
  ];

  return (
    <Section>
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow={tr("home.av.eyebrow")}
            title={tr("home.av.title")}
            align="center"
            className="mb-14"
          />
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {panels.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 0.1}>
              <TiltCard className="h-full">
                <div className="surface rounded-card p-6 h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-sharp bg-gold/8 border border-gold/15 flex items-center justify-center">
                      <p.icon size={18} strokeWidth={1.5} className="text-gold/70" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-serif text-[1.25rem] text-ivory mb-1.5">{p.title}</h3>
                    <p className="font-sans text-caption text-ivory/45 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-auto pt-2">{p.content}</div>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
