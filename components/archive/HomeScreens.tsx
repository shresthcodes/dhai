"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Tablet, Tv } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading, Section } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore } from "@/store/accessibility";

/* ─── CSS 3-D device frames ─────────────────────────────────────────── */
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden border border-[rgba(244,237,224,0.18)] shadow-card"
      style={{ background: "#161B26" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[rgba(244,237,224,0.08)] bg-[rgba(255,255,255,0.03)]">
        <span className="w-2 h-2 rounded-full bg-terracotta/50" />
        <span className="w-2 h-2 rounded-full bg-gold/40" />
        <span className="w-2 h-2 rounded-full bg-azure/40" />
        <div className="flex-1 mx-3 h-3 rounded-full bg-[rgba(244,237,224,0.06)]" />
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function KioskFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] overflow-hidden border border-[rgba(244,237,224,0.18)] shadow-card"
      style={{ background: "#0B0D12", aspectRatio: "9/16" }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(244,237,224,0.06)]">
          <span className="font-serif text-[0.6rem] text-gold/50 tracking-wider">DHAI</span>
          <span className="w-4 h-4 rounded-full bg-[rgba(244,237,224,0.06)]" />
        </div>
        <div className="flex-1 p-3">{children}</div>
      </div>
    </div>
  );
}

function DisplayFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[8px] overflow-hidden border border-[rgba(244,237,224,0.18)] shadow-card"
      style={{ background: "#0B0D12", aspectRatio: "16/5" }}
    >
      <div className="h-full flex items-center px-6">{children}</div>
    </div>
  );
}

/* ─── Screen placeholder content ────────────────────────────────────── */
function ScreenContent({ type }: { type: "web" | "kiosk" | "display" }) {
  if (type === "web") return (
    <div className="space-y-2">
      <div className="h-2 w-24 rounded bg-gold/20" />
      <div className="h-8 w-full rounded bg-[rgba(244,237,224,0.05)]" />
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        {[1,2,3].map(i => <div key={i} className="h-10 rounded bg-[rgba(244,237,224,0.04)] border border-[rgba(244,237,224,0.06)]" />)}
      </div>
      <div className="h-1.5 w-16 rounded bg-gold/15 mt-1" />
    </div>
  );
  if (type === "kiosk") return (
    <div className="space-y-3">
      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 mx-auto" />
      <div className="h-2 w-16 rounded bg-ivory/10 mx-auto" />
      <div className="space-y-1.5">
        {[1,2,3].map(i => <div key={i} className="h-5 rounded bg-[rgba(244,237,224,0.05)] border border-[rgba(244,237,224,0.06)]" />)}
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-8 w-full">
      <div className="w-16 h-16 rounded-full bg-gold/8 border border-gold/15 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3 w-2/3 rounded bg-ivory/10" />
        <div className="h-1.5 w-1/2 rounded bg-ivory/05" />
      </div>
      <div className="h-6 w-20 rounded bg-gold/15 shrink-0" />
    </div>
  );
}

const SCREENS = [
  {
    icon: Monitor,
    title: "Web Portal",
    desc: "Full research interface for scholars, students and the public.",
    href: "/",
    type: "web" as const,
    float: "-2deg",
  },
  {
    icon: Tablet,
    title: "Museum Kiosk",
    desc: "Touch-first full-screen mode for gallery and exhibition installations.",
    href: "/kiosk",
    type: "kiosk" as const,
    float: "1.5deg",
  },
  {
    icon: Tv,
    title: "Smart Display",
    desc: "Ambient display for large screens, lobbies and public spaces.",
    href: "/display",
    type: "display" as const,
    float: "-1deg",
  },
];

export function HomeScreens() {
  const { language }     = useLanguageStore();
  const { reduceMotion } = useAccessibilityStore();
  const tr = useTranslations(language);

  return (
    <Section className="bg-night border-y border-[rgba(244,237,224,0.07)]">
      <Container>
        <ScrollReveal>
          <SectionHeading
            eyebrow={tr("home.screens.eyebrow")}
            title={tr("home.screens.title")}
            subtitle="The same verified knowledge layer powers multiple interfaces — from a researcher's desktop to a museum kiosk to a public display wall."
            align="center"
            className="mb-16"
          />
        </ScrollReveal>

        {/* Device frames grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
          {SCREENS.map((screen, i) => (
            <ScrollReveal key={screen.title} delay={i * 0.12}>
              <motion.div
                animate={reduceMotion ? {} : {
                  y: [0, -8, 0],
                  rotate: [parseFloat(screen.float), parseFloat(screen.float) + 0.5, parseFloat(screen.float)],
                }}
                transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 1.1 }}
                style={{ transformOrigin: "center bottom" }}
              >
                {/* Label */}
                <div className="flex items-center gap-2 mb-3">
                  <screen.icon size={14} strokeWidth={1.5} className="text-gold/50" />
                  <span className="eyebrow text-ivory/40">{screen.title}</span>
                </div>

                {screen.type === "kiosk" ? (
                  <KioskFrame><ScreenContent type="kiosk" /></KioskFrame>
                ) : screen.type === "display" ? (
                  <DisplayFrame><ScreenContent type="display" /></DisplayFrame>
                ) : (
                  <BrowserFrame><ScreenContent type="web" /></BrowserFrame>
                )}

                <p className="font-sans text-caption text-ivory/35 mt-3 text-center">{screen.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* CTAs */}
        <ScrollReveal delay={0.3} className="flex flex-wrap gap-4 justify-center mt-14">
          <Button variant="secondary" size="md" href="/kiosk">Launch Kiosk Mode</Button>
          <Button variant="ghost"     size="md" href="/display">Exhibition Mode</Button>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
