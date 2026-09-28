"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Send, Mic, MicOff, AlertTriangle, BookOpen,
  Plus, ChevronRight, Search, X,
} from "lucide-react";
import { Container }        from "@/components/ui/Container";
import { DemoBadge }        from "@/components/ui/Badge";
import { Button }           from "@/components/ui/Button";
import { GoldRule }         from "@/components/ui/GoldRule";
import { ScrollReveal }     from "@/components/ui/ScrollReveal";
import { SourceCard }       from "@/components/ask/SourceCard";
import { StageTracker }     from "@/components/ask/StageTracker";
import { AnswerStream }     from "@/components/ask/AnswerStream";
import { useLanguageStore } from "@/store/language";
import { useAccessibilityStore } from "@/store/accessibility";
import { useCollectionStore }    from "@/store/collection";
import { useToast }              from "@/components/ui/Toast";
import { loadArchive }           from "@/data/archiveService";
import { askArchive }            from "@/lib/ask";
import { SHOWCASE_QUESTIONS }    from "@/lib/ask/types";
import type { AskStage, AskResult, SourceCitation } from "@/lib/ask/types";
import type { Language } from "@/data/models";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Message {
  id:      string;
  role:    "user" | "assistant";
  text:    string;
  result?: AskResult;
}

/* ─── Follow-up generator ────────────────────────────────────────── */
function getFollowUps(question: string): string[] {
  const q = question.toLowerCase();
  if (q.includes("constitution") || q.includes("debate")) {
    return [
      "What other archival documents relate to democracy?",
      "Are there manuscripts in the collection on this subject?",
    ];
  }
  if (q.includes("equality") || q.includes("rights") || q.includes("social")) {
    return [
      "What speeches in the archive address equality?",
      "Find photographs related to social movements in the collection.",
    ];
  }
  return [
    "What other materials are in the archive on this topic?",
    "Are there audio-visual records related to this subject?",
  ];
}

/* ─── Insufficient evidence state ────────────────────────────────── */
function InsufficientEvidenceState({ question, closest, onRetry }: {
  question: string;
  closest:  { id: string; title: string }[];
  onRetry:  (q: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-card border border-terracotta/20 bg-terracotta/3 p-5 space-y-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} strokeWidth={1.5} className="text-terracotta/60 shrink-0 mt-0.5" />
        <div>
          <p className="font-sans text-sm font-semibold text-ivory/70">
            Not enough evidence in the archive
          </p>
          <p className="font-sans text-[0.78rem] text-ivory/45 mt-1 leading-relaxed">
            The archive does not contain enough relevant records to answer: <span className="italic">"{question}"</span>
          </p>
        </div>
      </div>

      <div className="pl-7 space-y-2">
        <p className="font-sans text-[0.72rem] text-ivory/40">Why this matters:</p>
        <ul className="space-y-1.5">
          {[
            "The assistant only answers from retrieved archival sources — it does not generate information.",
            "No relevant records matched your query in the demo archive.",
            "Try a query related to archive content: constitutional debates, social rights, manuscripts, or speeches.",
          ].map((reason, i) => (
            <li key={i} className="flex gap-2 font-sans text-[0.72rem] text-ivory/40">
              <ChevronRight size={10} strokeWidth={2} className="text-terracotta/40 shrink-0 mt-0.5" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {closest.length > 0 && (
        <div className="pl-7 space-y-2">
          <p className="font-sans text-[0.72rem] text-ivory/35">Closest available records:</p>
          {closest.map((c) => (
            <Link key={c.id} href={`/document/${c.id}`} className="block font-sans text-[0.75rem] text-gold/60 hover:text-gold transition-colors focus-visible:outline-gold">
              → {c.title}
            </Link>
          ))}
        </div>
      )}

      <div className="pl-7 flex flex-wrap gap-2">
        {["constitutional democracy", "social equality", "archival manuscripts"].map((s) => (
          <button key={s} onClick={() => onRetry(s)}
            className="font-sans text-xs text-ivory/40 border border-[rgba(244,237,224,0.1)] hover:border-gold/30 hover:text-gold px-3 py-1.5 rounded-sharp transition-all focus-visible:outline-gold"
          >{s}</button>
        ))}
      </div>

      <p className="pl-7 font-sans text-[0.65rem] text-ivory/25 italic">
        This state demonstrates the system will NOT generate an answer without archival evidence.
      </p>
    </motion.div>
  );
}

/* ─── Main ask content ────────────────────────────────────────────── */
function AskContent() {
  const params   = useSearchParams();
  const { language } = useLanguageStore();
  const { reduceMotion } = useAccessibilityStore();
  const savedCount = useCollectionStore((s) => s.savedIds.length);

  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState("");
  const [currentStage,   setCurrentStage]   = useState<AskStage | null>(null);
  const [isProcessing,   setIsProcessing]   = useState(false);
  const [highlightedCite,setHighlightedCite]= useState<number | null>(null);
  const [docFocus,       setDocFocus]       = useState<{ id: string; title: string } | null>(null);
  const [isListening,    setIsListening]    = useState(false);
  const [speechSupported] = useState(() =>
    typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );

  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const cancelRef  = useRef(false);

  // Read ?doc= from URL
  useEffect(() => {
    const docId = params.get("doc");
    if (docId) {
      const item = loadArchive().find((i) => i.id === docId);
      if (item) setDocFocus({ id: item.id, title: item.title });
    }
  }, [params]);

  // Keyboard: / to focus, Escape to cancel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isProcessing) {
        cancelRef.current = true;
        setIsProcessing(false);
        setCurrentStage(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isProcessing]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const runAsk = useCallback(async (question: string) => {
    if (!question.trim() || isProcessing) return;
    cancelRef.current = false;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);
    setCurrentStage(null);

    try {
      const result = await askArchive({
        question,
        language: language as Language,
        docId: docFocus?.id,
        onStage: (stage) => {
          if (!cancelRef.current) setCurrentStage(stage);
        },
      });

      if (!cancelRef.current) {
        const assistantMsg: Message = {
          id:     `a-${Date.now()}`,
          role:   "assistant",
          text:   question,
          result,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } finally {
      if (!cancelRef.current) {
        setIsProcessing(false);
        setCurrentStage(null);
      }
    }
  }, [isProcessing, language, docFocus]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    runAsk(input);
  }

  function handleVoice() {
    if (!speechSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as unknown as Record<string, unknown>)["SpeechRecognition"]
      ?? (window as unknown as Record<string, unknown>)["webkitSpeechRecognition"];
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "en-IN";
    rec.onstart = () => setIsListening(true);
    rec.onend   = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const t: string = e.results[0][0].transcript;
      setInput(t);
    };
    rec.start();
  }

  function newSession() {
    setMessages([]);
    setCurrentStage(null);
    setIsProcessing(false);
    setDocFocus(null);
    cancelRef.current = true;
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const lastAssistant = messages.filter((m) => m.role === "assistant").slice(-1)[0];
  const lastSources: SourceCitation[] = lastAssistant?.result?.sources ?? [];
  const hasConversation = messages.length > 0;

  return (
    <div className="min-h-screen pt-[4.5rem] flex flex-col">
      {/* Page header */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)] shrink-0">
        <Container className="py-8">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="eyebrow text-gold/70">Ask the Archive</p>
                <h1 className="font-serif text-h1 text-ivory">AI Research Assistant</h1>
                <GoldRule />
                <p className="font-sans text-caption text-ivory/45 max-w-lg mt-1">
                  An evidence-grounded assistant for exploring archival knowledge.
                  Answers are generated only from retrieved archive sources.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <DemoBadge />
                <p className="font-sans text-[0.62rem] text-ivory/25 max-w-[200px] text-right">
                  Prototype. Demo data. Verify with original sources.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        <Container className="flex gap-6 py-6 w-full">
          {/* LEFT: Session rail */}
          <aside className="hidden lg:flex flex-col w-52 shrink-0 space-y-4" aria-label="Session history">
            <button
              onClick={newSession}
              className="flex items-center gap-2 font-sans text-sm text-ivory/60 hover:text-gold border border-[rgba(244,237,224,0.12)] hover:border-gold/30 rounded-card px-3 py-2.5 transition-all focus-visible:outline-gold"
              aria-label="Start new session"
            >
              <Plus size={14} strokeWidth={1.5} />New session
            </button>

            {/* Research scope */}
            <div className="surface rounded-card p-3 space-y-2">
              <p className="eyebrow text-[0.55rem] text-ivory/35">Research scope</p>
              {docFocus ? (
                <div className="space-y-1">
                  <div className="flex items-start gap-1.5 bg-gold/8 border border-gold/20 rounded-sharp px-2 py-1.5">
                    <BookOpen size={10} strokeWidth={1.5} className="text-gold/60 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans text-[0.6rem] text-gold/70">Focused on:</p>
                      <p className="font-sans text-[0.65rem] text-ivory/60 line-clamp-2">{docFocus.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setDocFocus(null)} className="font-sans text-[0.6rem] text-ivory/30 hover:text-terracotta/70 transition-colors focus-visible:outline-gold flex items-center gap-1">
                    <X size={9} strokeWidth={2} />Remove focus
                  </button>
                </div>
              ) : (
                <p className="font-sans text-[0.65rem] text-ivory/35">All archive</p>
              )}
            </div>

            {/* Previous questions */}
            {messages.filter((m) => m.role === "user").length > 0 && (
              <div className="space-y-2">
                <p className="eyebrow text-[0.55rem] text-ivory/25">This session</p>
                {messages.filter((m) => m.role === "user").map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setInput(m.text)}
                    className="w-full text-left font-sans text-[0.68rem] text-ivory/40 hover:text-ivory/70 px-2 py-1.5 rounded-sharp hover:bg-white/5 transition-all focus-visible:outline-gold line-clamp-2 leading-snug"
                  >
                    {m.text}
                  </button>
                ))}
              </div>
            )}

            {savedCount > 0 && (
              <Link href="/collection" className="font-sans text-[0.68rem] text-gold/50 hover:text-gold transition-colors focus-visible:outline-gold mt-auto">
                {savedCount} item{savedCount !== 1 ? "s" : ""} saved →
              </Link>
            )}
          </aside>

          {/* CENTER: Conversation */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Doc focus chip */}
            {docFocus && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gold/8 border border-gold/20 rounded-card w-fit">
                <BookOpen size={12} strokeWidth={1.5} className="text-gold/60" />
                <span className="font-sans text-xs text-ivory/60">Focused on:</span>
                <span className="font-sans text-xs text-gold/70 font-medium">{docFocus.title}</span>
                <button onClick={() => setDocFocus(null)} className="text-ivory/30 hover:text-ivory/60 transition-colors ml-1 focus-visible:outline-gold" aria-label="Remove document focus">
                  <X size={10} strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Empty state */}
            {!hasConversation && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-8"
              >
                <div className="space-y-2">
                  <p className="font-serif text-h2 text-ivory/50">What would you like to explore?</p>
                  <p className="font-sans text-caption text-ivory/30">
                    Ask anything about the archive — the assistant retrieves evidence first, then answers.
                  </p>
                </div>

                {/* Showcase question cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SHOWCASE_QUESTIONS.map((sq) => (
                    <button
                      key={sq.id}
                      onClick={() => runAsk(sq.question)}
                      className={cn(
                        "text-left p-4 rounded-card border transition-all duration-200 group focus-visible:outline-gold space-y-2",
                        sq.scope === "refusal"
                          ? "border-terracotta/15 hover:border-terracotta/30 bg-terracotta/3"
                          : "border-[rgba(244,237,224,0.1)] hover:border-gold/25 surface"
                      )}
                      aria-label={`Ask: ${sq.question}`}
                    >
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="text-base">{sq.icon}</span>
                        {sq.scope === "refusal" && (
                          <span className="eyebrow text-[0.52rem] text-terracotta/60 border border-terracotta/20 px-1.5 py-0.5 rounded-sharp">
                            Refusal demo
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[0.8125rem] text-ivory/65 group-hover:text-ivory/85 transition-colors leading-snug">
                        {sq.question}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" && (
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-4 py-2.5 rounded-card rounded-br-sharp border border-[rgba(244,237,224,0.15)] bg-[rgba(244,237,224,0.04)]">
                        <p className="font-sans text-sm text-ivory/80">{msg.text}</p>
                      </div>
                    </div>
                  )}
                  {msg.role === "assistant" && msg.result && (
                    <div className="space-y-4">
                      {/* Sources appear FIRST on mobile (desktop = right panel) */}
                      {msg.result.status === "answered" && msg.result.sources.length > 0 && (
                        <div className="lg:hidden space-y-3">
                          <p className="eyebrow text-[0.55rem] text-ivory/30">Sources retrieved</p>
                          <div className="flex gap-3 overflow-x-auto pb-1">
                            {msg.result.sources.map((s, i) => (
                              <div key={s.id} className="shrink-0 w-64">
                                <SourceCard
                                  source={s}
                                  index={i + 1}
                                  isHighlighted={highlightedCite === i + 1}
                                  delay={i * 0.1}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {msg.result.status === "answered" ? (
                        <AnswerStream
                          result={msg.result}
                          onHighlight={setHighlightedCite}
                          onRegenerate={() => runAsk(msg.text)}
                          followUps={getFollowUps(msg.text)}
                          onFollowUp={runAsk}
                        />
                      ) : (
                        <InsufficientEvidenceState
                          question={msg.text}
                          closest={msg.result.sources.slice(0, 2).map((s) => ({ id: s.docId, title: s.title }))}
                          onRetry={runAsk}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Processing state */}
              {isProcessing && (
                <div className="space-y-4">
                  <div className="surface rounded-card p-4">
                    <StageTracker currentStage={currentStage} done={false} />
                  </div>
                  <p className="font-sans text-xs text-ivory/30 text-center" aria-live="polite">
                    {currentStage ? `${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)}…` : "Starting…"} · Press Esc to cancel
                  </p>
                </div>
              )}
            </div>

            <div ref={bottomRef} />

            {/* Input area */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-ink via-ink to-transparent">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <div className={cn(
                  "flex-1 flex items-end gap-2 rounded-card border transition-all duration-300 bg-panel px-4 py-3",
                  "focus-within:border-gold/40 focus-within:shadow-glow",
                  "border-[rgba(244,237,224,0.12)]"
                )}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                    }}
                    placeholder="Ask anything about the archive… (press / to focus)"
                    rows={1}
                    className="flex-1 bg-transparent font-sans text-sm text-ivory placeholder:text-ivory/25 outline-none resize-none leading-relaxed"
                    aria-label="Ask the archive"
                    disabled={isProcessing}
                    style={{ maxHeight: 120 }}
                  />
                  <button
                    type="button"
                    onClick={handleVoice}
                    disabled={!speechSupported}
                    className={cn(
                      "p-1.5 rounded-sharp transition-all shrink-0 focus-visible:outline-gold",
                      isListening ? "text-terracotta animate-pulse" : speechSupported ? "text-ivory/30 hover:text-gold" : "text-ivory/15 cursor-not-allowed"
                    )}
                    aria-label="Voice input"
                  >
                    {speechSupported ? <Mic size={15} strokeWidth={1.5} /> : <MicOff size={15} strokeWidth={1.5} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className={cn(
                    "w-10 h-10 rounded-card flex items-center justify-center transition-all shrink-0 focus-visible:outline-gold",
                    input.trim() && !isProcessing ? "bg-gold text-ink hover:bg-gold-soft" : "bg-panel text-ivory/20 cursor-not-allowed"
                  )}
                  aria-label="Send question"
                >
                  <Send size={15} strokeWidth={1.75} />
                </button>
              </form>
              <p className="font-sans text-[0.6rem] text-ivory/20 text-center mt-2">
                Enter to send · Shift+Enter for new line · / to focus · Esc to cancel
              </p>
            </div>
          </div>

          {/* RIGHT: Evidence panel (desktop only) */}
          <aside className="hidden lg:block w-72 shrink-0" aria-label="Key sources">
            <div className="sticky top-28 space-y-4 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
              <div className="flex items-center gap-2">
                <p className="eyebrow text-ivory/40">Key Sources</p>
                {lastSources.length > 0 && (
                  <span className="font-sans text-[0.62rem] text-ivory/25">{lastSources.length} retrieved</span>
                )}
              </div>

              {lastSources.length === 0 ? (
                <div className="surface rounded-card p-5 text-center space-y-2">
                  <Search size={18} strokeWidth={1} className="text-ivory/15 mx-auto" />
                  <p className="font-sans text-xs text-ivory/25">Sources will appear here once retrieved from the archive.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lastSources.map((s, i) => (
                    <SourceCard
                      key={s.id}
                      source={s}
                      index={i + 1}
                      isHighlighted={highlightedCite === i + 1}
                      delay={i * 0.12}
                    />
                  ))}
                  <p className="font-sans text-[0.62rem] text-ivory/20 italic text-center pt-1">
                    Visually distinct from AI-generated answer above
                  </p>
                </div>
              )}
            </div>
          </aside>
        </Container>
      </div>
    </div>
  );
}

export function AskPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading assistant…</span></div>}>
      <AskContent />
    </Suspense>
  );
}
