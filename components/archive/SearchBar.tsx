"use client";

import React, { useRef, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Mic, MicOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "constitutional democracy",
  "social rights and equality",
  "education and scholarship",
  "assembly debates",
  "handwritten manuscripts",
];

interface SearchBarProps {
  value:         string;
  onChange:      (v: string) => void;
  onSubmit:      (v: string) => void;
  placeholder?:  string;
  large?:        boolean;
  className?:    string;
  autoFocus?:    boolean;
}

export function SearchBar({
  value, onChange, onSubmit, placeholder, large = false, className, autoFocus = false,
}: SearchBarProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [exIdx,   setExIdx]   = useState(0);
  const [focused, setFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() =>
    typeof window !== "undefined" && (
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    )
  );

  // Rotate examples
  useEffect(() => {
    if (focused || value) return;
    const id = setInterval(() => setExIdx((i) => (i + 1) % EXAMPLES.length), 2800);
    return () => clearInterval(id);
  }, [focused, value]);

  // "/" shortcut to focus
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-focus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleVoice() {
    if (!speechSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      (window as unknown as Record<string, unknown>)["SpeechRecognition"] ??
      (window as unknown as Record<string, unknown>)["webkitSpeechRecognition"];
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend   = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      onChange(transcript);
      onSubmit(transcript);
    };
    recognition.start();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Archive search" className={className}>
      <div
        className={cn(
          "relative flex items-center gap-2",
          "rounded-card border transition-all duration-300",
          "bg-panel",
          focused
            ? "border-gold/40 shadow-glow"
            : "border-[rgba(244,237,224,0.12)] hover:border-[rgba(244,237,224,0.22)]"
        )}
      >
        <Search
          size={large ? 20 : 16}
          strokeWidth={1.5}
          className={cn("ml-4 sm:ml-5 shrink-0 transition-colors", focused ? "text-gold" : "text-ivory/35")}
          aria-hidden="true"
        />

        <div className="relative flex-1 py-3.5 sm:py-4">
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full bg-transparent outline-none placeholder-transparent",
              "font-sans text-ivory",
              large ? "text-base sm:text-lg" : "text-sm sm:text-base"
            )}
            aria-label={placeholder ?? "Search the archive"}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {/* Rotating placeholder */}
          {!value && (
            <div className="pointer-events-none absolute inset-0 flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={exIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "font-sans text-ivory/25",
                    large ? "text-base sm:text-lg" : "text-sm sm:text-base"
                  )}
                >
                  {focused ? (placeholder ?? "Search the archive…") : `Search the archive… e.g. ${EXAMPLES[exIdx]}`}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mr-3">
          {/* Clear */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              className="p-1.5 text-ivory/30 hover:text-ivory/70 transition-colors rounded-sharp focus-visible:outline-gold"
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          )}

          {/* Voice */}
          <button
            type="button"
            onClick={handleVoice}
            disabled={!speechSupported}
            className={cn(
              "p-2 rounded-sharp transition-all duration-200 focus-visible:outline-gold",
              isListening
                ? "text-terracotta bg-terracotta/10 animate-pulse"
                : speechSupported
                  ? "text-ivory/30 hover:text-ivory/60"
                  : "text-ivory/15 cursor-not-allowed"
            )}
            aria-label={speechSupported ? "Voice search" : "Voice search not supported"}
            title={speechSupported ? "Voice search" : "Voice search requires browser permission"}
          >
            {speechSupported ? <Mic size={15} strokeWidth={1.5} /> : <MicOff size={15} strokeWidth={1.5} />}
          </button>

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              "px-3 py-1.5 rounded-sharp font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-200",
              value.trim()
                ? "bg-gold text-ink hover:bg-gold-soft"
                : "bg-transparent text-ivory/20 cursor-default"
            )}
            aria-label="Submit search"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
