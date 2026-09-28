"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language";
import { useTranslations } from "@/lib/i18n";

const SUGGESTIONS = [
  "constitutional democracy",
  "social justice",
  "untouchability",
  "education and equality",
  "rights of the oppressed",
];

const CHIPS = [
  { label: "Writings",    href: "/archive?type=writing" },
  { label: "Speeches",    href: "/archive?type=speech" },
  { label: "Manuscripts", href: "/archive?type=manuscript" },
  { label: "Debates",     href: "/archive?type=debate" },
];

export function HomeSearch() {
  const [query,       setQuery]       = useState("");
  const [suggIdx,     setSuggIdx]     = useState(0);
  const [isFocused,   setIsFocused]   = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguageStore();
  const tr = useTranslations(language);

  // Rotate suggestions
  useEffect(() => {
    const id = setInterval(() => {
      if (!isFocused) setSuggIdx((i) => (i + 1) % SUGGESTIONS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [isFocused]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="py-16 bg-night border-y border-[rgba(244,237,224,0.07)]">
      <Container narrow>
        <ScrollReveal>
          <form onSubmit={handleSubmit} role="search" aria-label="Archive search">
            <div
              className={cn(
                "relative flex items-center gap-3",
                "rounded-card border transition-all duration-300",
                "bg-panel",
                isFocused
                  ? "border-gold/40 shadow-glow"
                  : "border-[rgba(244,237,224,0.12)] hover:border-[rgba(244,237,224,0.2)]"
              )}
            >
              <Search
                size={18}
                strokeWidth={1.5}
                className={cn("ml-5 shrink-0 transition-colors", isFocused ? "text-gold" : "text-ivory/35")}
                aria-hidden="true"
              />
              <div className="relative flex-1 py-4">
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent font-sans text-base text-ivory outline-none placeholder-transparent"
                  aria-label={tr("home.search.placeholder")}
                  autoComplete="off"
                />
                {/* Rotating placeholder */}
                {!query && (
                  <div className="pointer-events-none absolute inset-0 flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={suggIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35 }}
                        className="font-sans text-base text-ivory/25"
                      >
                        Search the archive… e.g. {SUGGESTIONS[suggIdx]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className={cn(
                  "mr-3 p-2.5 rounded-sharp flex items-center gap-2",
                  "font-sans text-xs font-semibold uppercase tracking-widest",
                  "transition-all duration-200",
                  query.trim()
                    ? "bg-gold text-ink hover:bg-gold-soft"
                    : "bg-transparent text-ivory/25"
                )}
                aria-label="Submit search"
              >
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </form>
        </ScrollReveal>

        {/* Suggestion chips */}
        <ScrollReveal delay={0.1} className="flex flex-wrap gap-2.5 mt-5">
          {CHIPS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-sans text-xs text-ivory/50 hover:text-gold border border-[rgba(244,237,224,0.12)] hover:border-gold/30 px-3.5 py-1.5 rounded-sharp transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </ScrollReveal>
      </Container>
    </section>
  );
}
