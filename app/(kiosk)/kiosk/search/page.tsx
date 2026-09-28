"use client";
import React, { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { OnScreenKeyboard } from "@/components/kiosk/OnScreenKeyboard";
import { useKioskStore } from "@/store/kiosk";
import { searchArchive } from "@/data/archiveService";
import type { SearchResult } from "@/data/archiveService";
import { DemoBadge } from "@/components/ui/Badge";

const CHIPS = ["constitutional democracy", "social rights", "manuscripts", "speeches"];
const PAGE_SIZE = 6;

function SearchContent() {
  const router = useRouter();
  const { language } = useKioskStore();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(0);
  const [kbOpen,   setKbOpen]   = useState(false);

  async function runSearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    const res = await searchArchive(q, {}, "relevance");
    setResults(res.results);
    setPage(0);
    setLoading(false);
  }

  const pageResults = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages  = Math.ceil(results.length / PAGE_SIZE);

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <h1 className="font-serif text-[1.75rem] text-ivory">Search the Archive</h1>
        <DemoBadge />
      </div>

      {/* Search input */}
      <div className="px-6 py-4 shrink-0">
        <button
          className="w-full flex items-center gap-4 bg-panel border-2 border-[rgba(244,237,224,0.15)] rounded-[20px] px-6 py-5 text-left hover:border-gold/30 transition-colors focus-visible:outline-gold"
          onClick={() => setKbOpen(true)}
          aria-label="Open keyboard to search"
        >
          <span className="font-sans text-[1.5rem] text-ivory flex-1">
            {query || <span className="text-ivory/30">Search the archive…</span>}
          </span>
          {query && (
            <KioskButton size="lg" onClick={(e) => { e.stopPropagation(); runSearch(query); }}>
              Search
            </KioskButton>
          )}
        </button>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-3 mt-4">
          {CHIPS.map((c) => (
            <button key={c} onClick={() => { setQuery(c); runSearch(c); }}
              className="px-5 py-3 rounded-[16px] border-2 border-[rgba(244,237,224,0.12)] font-sans text-lg text-ivory/60 hover:border-gold/30 hover:text-ivory/80 transition-all active:scale-[0.96]">
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3">
        {loading && <p className="font-sans text-lg text-ivory/40 text-center py-8 animate-pulse">Searching…</p>}
        {!loading && pageResults.map((r) => (
          <button key={r.item.id}
            onClick={() => router.push(`/kiosk/archive?id=${r.item.id}`)}
            className="w-full text-left bg-panel rounded-[20px] border-2 border-[rgba(244,237,224,0.1)] p-6 hover:border-gold/30 transition-all active:scale-[0.99] space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-gold/60 border border-gold/25 px-2 py-0.5 rounded-sharp capitalize">{r.item.type}</span>
              <DemoBadge />
              <span className="font-sans text-sm text-ivory/30 ml-auto">Demo relevance: {r.score}%</span>
            </div>
            <p className="font-serif text-[1.5rem] text-ivory">{r.item.title}</p>
            <p className="font-sans text-base text-ivory/50 line-clamp-2">{r.item.summary}</p>
          </button>
        ))}
        {!loading && results.length === 0 && query && (
          <p className="font-sans text-lg text-ivory/30 text-center py-12">No results found for "{query}"</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-[rgba(244,237,224,0.08)] shrink-0">
          <KioskButton variant="secondary" size="xl" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ArrowLeft size={24} strokeWidth={1.5} />Previous
          </KioskButton>
          <span className="font-sans text-lg text-ivory/50">{page + 1} / {totalPages}</span>
          <KioskButton variant="secondary" size="xl" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            Next<ArrowRight size={24} strokeWidth={1.5} />
          </KioskButton>
        </div>
      )}

      {/* On-screen keyboard */}
      <AnimatePresence>
        {kbOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-night border-t border-[rgba(244,237,224,0.15)] px-4 py-3 flex items-center gap-4">
              <p className="font-sans text-xl text-ivory flex-1 truncate">{query || <span className="text-ivory/30">Type to search…</span>}</p>
              <KioskButton variant="ghost" size="lg" onClick={() => setKbOpen(false)}>Done</KioskButton>
            </div>
            <OnScreenKeyboard
              value={query}
              onChange={setQuery}
              onSearch={() => { runSearch(query); setKbOpen(false); }}
              language={language as "en" | "hi" | "gu"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KioskSearchPage() {
  return <Suspense fallback={<div className="fixed inset-0 bg-ink flex items-center justify-center"><p className="font-sans text-ivory/30 text-xl">Loading…</p></div>}><SearchContent /></Suspense>;
}
