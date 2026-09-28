"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Accessibility, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useLanguageStore } from "@/store/language";
import { useAccessibilityStore } from "@/store/accessibility";
import { useTranslations } from "@/lib/i18n";
import type { Language } from "@/data/models";
import { AccessibilityPanel } from "./AccessibilityPanel";

const NAV_LINKS = [
  { key: "nav.explore",     href: "/" },
  { key: "nav.archive",     href: "/archive" },
  { key: "nav.timeline",    href: "/timeline" },
  { key: "nav.audioVisual", href: "/media" },
  { key: "nav.story",       href: "/story" },
] as const;

const LANGUAGES: { code: Language; key: "nav.lang.en" | "nav.lang.hi" | "nav.lang.gu" }[] = [
  { code: "en", key: "nav.lang.en" },
  { code: "hi", key: "nav.lang.hi" },
  { code: "gu", key: "nav.lang.gu" },
];

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [a11yOpen,     setA11yOpen]     = useState(false);
  const { language, setLanguage }       = useLanguageStore();
  const { highContrast }                = useAccessibilityStore();
  const tr = useTranslations(language);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      {/* Skip to content */}
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only",
          "fixed top-4 left-4 z-[200]",
          "glass rounded-sharp px-4 py-2",
          "text-sm font-medium text-gold",
          "focus:outline-2 focus:outline-gold"
        )}
      >
        {tr("nav.skipToContent")}
      </a>

      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-[100]",
          "transition-all duration-500 ease-out",
          scrolled
            ? "glass border-b border-[rgba(244,237,224,0.10)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <Container>
          <nav
            aria-label="Main navigation"
            className="flex items-center justify-between h-16 lg:h-[4.5rem]"
          >
            {/* Brand */}
            <Link
              href="/"
              className="flex flex-col leading-none group focus-visible:outline-gold"
              aria-label="DHAI — Digital Heritage Archive & Intelligence, go to home"
            >
              <span className="font-serif text-[1.375rem] font-semibold text-ivory tracking-tight group-hover:text-gold transition-colors duration-200">
                DHAI
              </span>
              <span className="font-sans text-[0.55rem] uppercase tracking-[0.18em] text-ivory/40 group-hover:text-gold/60 transition-colors duration-200 hidden sm:block">
                {tr("brand.subtitle")}
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-6" role="list">
              {NAV_LINKS.map(({ key, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      className={cn(
                        "font-sans text-[0.8125rem] font-medium tracking-wide",
                        "transition-colors duration-200",
                        "relative py-1",
                        "focus-visible:outline-gold focus-visible:rounded-sharp",
                        isActive ? "text-gold" : "text-ivory/70 hover:text-ivory"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {tr(key)}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="absolute -bottom-0.5 left-0 right-0 h-px bg-gold"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop Right Controls */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language switcher */}
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-sharp border border-[rgba(244,237,224,0.12)]"
                role="group"
                aria-label="Language selection"
              >
                {LANGUAGES.map(({ code, key }) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "font-sans text-[0.6875rem] font-medium px-2 py-1 rounded-[3px]",
                      "transition-all duration-200",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-1",
                      language === code
                        ? "bg-gold/15 text-gold"
                        : "text-ivory/50 hover:text-ivory/80"
                    )}
                    aria-pressed={language === code}
                    lang={code}
                  >
                    {tr(key)}
                  </button>
                ))}
              </div>

              {/* Search */}
              <Link
                href="/search"
                className="p-2 text-ivory/60 hover:text-ivory transition-colors rounded-sharp focus-visible:outline-gold"
                aria-label={tr("nav.search")}
              >
                <Search size={18} strokeWidth={1.5} />
              </Link>

              {/* Accessibility */}
              <button
                onClick={() => setA11yOpen((v) => !v)}
                className={cn(
                  "p-2 rounded-sharp transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
                  a11yOpen ? "text-gold" : "text-ivory/60 hover:text-ivory"
                )}
                aria-label={`${tr("a11y.panel")} settings`}
                aria-expanded={a11yOpen}
                aria-controls="accessibility-panel"
              >
                <Accessibility size={18} strokeWidth={1.5} />
              </button>

              {/* CTA */}
              <Button variant="primary" size="sm" href="/ask">{tr("nav.askArchive")}</Button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-ivory/70 hover:text-ivory transition-colors focus-visible:outline-gold rounded-sharp"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] bg-ink/97 backdrop-blur-xl flex flex-col pt-24 px-6 pb-10"
          >
            <nav aria-label="Mobile navigation">
              <ul className="space-y-1" role="list">
                {NAV_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    <Link
                      href={href}
                      className="block font-serif text-h3 text-ivory/80 hover:text-gold py-3 border-b border-[rgba(244,237,224,0.08)] transition-colors"
                    >
                      {tr(key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <Button variant="primary" size="lg" href="/ask">{tr("nav.askArchive")}</Button>
                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label="Language selection"
                >
                  {LANGUAGES.map(({ code, key }) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className={cn(
                        "flex-1 py-2 rounded-sharp font-sans text-sm font-medium border transition-all",
                        language === code
                          ? "bg-gold/15 text-gold border-gold/30"
                          : "text-ivory/50 border-[rgba(244,237,224,0.12)] hover:text-ivory/80"
                      )}
                      aria-pressed={language === code}
                      lang={code}
                    >
                      {tr(key)}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        open={a11yOpen}
        onClose={() => setA11yOpen(false)}
        id="accessibility-panel"
      />
    </>
  );
}
