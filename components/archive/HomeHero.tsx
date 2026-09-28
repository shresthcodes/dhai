"use client";

import React, { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DemoBadge } from "@/components/ui/Badge";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";
import { useAccessibilityStore } from "@/store/accessibility";

const HeroCanvas = dynamic(
  () => import("@/components/three/HeroCanvas").then((m) => ({ default: m.HeroCanvas })),
  { ssr: false }
);

/* ─── Masked line reveal animation ─────────────────────────────────── */
const lineVariants = {
  hidden:  { clipPath: "inset(0 100% 0 0)", opacity: 0 },
  visible: (i: number) => ({
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 0.9, delay: 0.3 + i * 0.22, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HomeHero() {
  const scrollY  = useRef(0);
  const { language } = useLanguageStore();
  const { reduceMotion } = useAccessibilityStore();
  const tr = useTranslations(language);

  // Track scroll for 3D camera pull-back
  useEffect(() => {
    function onScroll() { scrollY.current = window.scrollY; }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroLines = [
    tr("home.hero.line1"),
    tr("home.hero.line2"),
    tr("home.hero.line3"),
  ];

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* 3D Scene (or CSS fallback) */}
      <HeroCanvas scrollY={scrollY} />

      {/* Portrait image — full width with CSS mask fade on left */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-portrait.jpg"
          alt=""
          className="absolute top-0 right-0 h-full w-full object-cover"
          style={{
            opacity: 0.38,
            objectPosition: "center center",
            transform: "translateX(15%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.7) 45%, black 60%)",
            maskImage: "linear-gradient(to right, transparent 0%, transparent 25%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.7) 45%, black 60%)",
          }}
        />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{
          background: "linear-gradient(to bottom, rgba(11,13,18,0.6), transparent)",
        }} />
      </div>
      {/* Top + bottom fade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(11,13,18,0.5) 0%, transparent 15%, transparent 80%, #0B0D12 100%)",
        }}
      />

      {/* Bottom fade into next section */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #0B0D12)" }}
      />

      {/* Text content */}
      <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 sm:px-10 lg:px-16 pt-28 pb-24">
        <div className="max-w-2xl space-y-7">
          {/* Eyebrow */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="eyebrow text-gold/80"
          >
            {tr("home.hero.eyebrow")}
          </motion.p>

          {/* Headline — line-by-line masked reveal */}
          <h1
            id="hero-heading"
            className="font-serif text-display text-ivory leading-[1.05]"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
          >
            {heroLines.map((line, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={reduceMotion ? {} : lineVariants}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          {/* Sub */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-body text-ivory/60 max-w-xl leading-relaxed"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            {tr("home.hero.sub")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Button variant="primary"   size="lg" href="/archive">{tr("home.hero.cta1")}</Button>
            <Button variant="secondary" size="lg" href="/ask">{tr("home.hero.cta2")}</Button>
          </motion.div>

          {/* Demo badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <DemoBadge />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator strip */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 pointer-events-none">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/30" />
        <span className="eyebrow text-ivory/25 text-[0.55rem]">{tr("home.hero.scrollHint")}</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/30" />
        <motion.div
          animate={reduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={14} strokeWidth={1.5} className="text-ivory/25" />
        </motion.div>
      </div>
    </section>
  );
}
