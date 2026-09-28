"use client";

import React, {
  useState, useEffect, useCallback, useRef, Suspense
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen, ExternalLink, Bookmark, BookmarkCheck,
  Map, List as ListIcon, X, ChevronRight,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GoldRule } from "@/components/ui/GoldRule";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SearchBar }          from "@/components/archive/SearchBar";
import { FilterPanel, ActiveFilters } from "@/components/archive/FilterPanel";
import { QueryUnderstanding } from "@/components/archive/QueryUnderstanding";
import { RelevanceBar }       from "@/components/archive/RelevanceBar";
import { useCollectionStore } from "@/store/collection";
import { useToast }           from "@/components/ui/Toast";
import { usePerformanceTier } from "@/lib/performance";
import { useAccessibilityStore } from "@/store/accessibility";
import { cn } from "@/lib/utils";
import {
  searchArchive,
  type SearchResult, type SearchFilters, type SearchResponse,
} from "@/data/archiveService";
import type { ArchiveItem, ArchiveItemType } from "@/data/models";
import Link from "next/link";

/* Dynamic 3D import — lazy, only when Knowledge Map tab opens */
const KnowledgeMapScene = dynamic(
  () => import("@/components/three/KnowledgeMapScene").then((m) => ({ default: m.KnowledgeMapScene })),
  { ssr: false, loading: () => <div className="h-[440px] flex items-center justify-center bg-night rounded-card border border-[rgba(244,237,224,0.08)]"><span className="eyebrow text-ivory/25">Loading Knowledge Map…</span></div> }
);

const SUGGESTION_CHIPS = [
  "constitutional democracy",
  "social rights",
  "education equality",
  "manuscripts drafts",
];

/* ─── Highlighted text ───────────────────────────────────────────── */
function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-gold/20 text-gold rounded-[2px] px-0.5 not-italic">{part}</mark>
          : part
      )}
    </>
  );
}

/* ─── Result card ────────────────────────────────────────────────── */
function ResultCard({
  result, onSelect,
}: { result: SearchResult; onSelect?: (r: SearchResult) => void }) {
  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { toast } = useToast();
  const saved = isSaved(result.item.id);

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (saved) { removeItem(result.item.id); toast("Removed from collection", "info"); }
    else        { saveItem(result.item.id);  toast(`Saved to collection`, "success"); }
  }

  const TYPE_ICONS: Record<ArchiveItemType, string> = {
    writing: "✍", speech: "🎤", manuscript: "📜", debate: "⚖",
    photograph: "📷", record: "🗃", audio: "🔊", video: "🎬",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="surface rounded-card p-5 hover:border-gold/20 transition-all duration-300 border border-[rgba(244,237,224,0.08)] space-y-3"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-sans text-[0.65rem] uppercase tracking-widest text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded-sharp">
              {result.item.type}
            </span>
            <span className="font-sans text-[0.62rem] text-ivory/30 border border-[rgba(244,237,224,0.1)] px-1.5 py-0.5 rounded-sharp">
              {result.item.language.toUpperCase()}
            </span>
            <DemoBadge />
          </div>
          <Link
            href={`/document/${result.item.id}`}
            className="font-serif text-[1.05rem] text-ivory hover:text-gold transition-colors leading-snug focus-visible:outline-gold focus-visible:rounded-sharp"
          >
            <HighlightText text={result.item.title} terms={result.matchedTerms} />
          </Link>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSave}
            className={cn(
              "p-1.5 rounded-sharp transition-colors focus-visible:outline-gold",
              saved ? "text-gold bg-gold/10" : "text-ivory/30 hover:text-gold hover:bg-gold/8"
            )}
            aria-label={saved ? "Remove from collection" : "Save to collection"}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck size={13} strokeWidth={1.5} /> : <Bookmark size={13} strokeWidth={1.5} />}
          </button>
          <Link
            href={`/document/${result.item.id}`}
            className="p-1.5 text-ivory/30 hover:text-gold transition-colors rounded-sharp focus-visible:outline-gold"
            aria-label="Open document"
          >
            <ExternalLink size={13} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Summary snippet */}
      <p className="font-sans text-[0.78rem] text-ivory/50 leading-relaxed line-clamp-2">
        <HighlightText text={result.item.summary} terms={result.matchedTerms} />
      </p>

      {/* Why + relevance */}
      <div className="space-y-2">
        <p className="font-sans text-[0.68rem] text-azure/60 italic flex items-center gap-1.5">
          <ChevronRight size={10} strokeWidth={2} className="shrink-0" />
          {result.reason}
        </p>
        {result.score > 0 && <RelevanceBar score={result.score} />}
      </div>

      {/* Collection */}
      <p className="font-sans text-[0.65rem] text-ivory/25">{result.item.collection}</p>
    </motion.div>
  );
}

/* ─── Node detail panel (Knowledge Map click) ────────────────────── */
function NodePanel({
  result, onClose,
}: { result: SearchResult; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="w-72 shrink-0 glass rounded-card p-5 space-y-4 sticky top-32 self-start"
      role="complementary"
      aria-label="Selected archive item"
    >
      <div className="flex items-start justify-between">
        <span className="eyebrow text-gold/60">Selected</span>
        <button onClick={onClose} className="text-ivory/30 hover:text-ivory p-1 rounded transition-colors focus-visible:outline-gold" aria-label="Close panel">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
      <GoldRule width="full" />
      <h3 className="font-serif text-[1.1rem] text-ivory leading-snug">{result.item.title}</h3>
      <div className="flex gap-2 flex-wrap">
        <span className="eyebrow text-[0.55rem] text-gold/70 border border-gold/25 px-2 py-0.5 rounded-sharp">{result.item.type}</span>
        <span className="eyebrow text-[0.55rem] text-ivory/40 border border-[rgba(244,237,224,0.12)] px-2 py-0.5 rounded-sharp">{result.item.language.toUpperCase()}</span>
      </div>
      <p className="font-sans text-xs text-ivory/50 leading-relaxed">{result.item.summary}</p>
      <p className="font-sans text-[0.68rem] text-azure/60 italic">{result.reason}</p>
      <RelevanceBar score={result.score} />
      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary"   size="sm" href={`/document/${result.item.id}`}>Open document</Button>
        <Button variant="secondary" size="sm" onClick={() => { useCollectionStore.getState().saveItem(result.item.id); }}>
          Save to collection
        </Button>
      </div>
    </motion.aside>
  );
}

/* ─── Main search content ─────────────────────────────────────────── */
function SearchContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const tier       = usePerformanceTier();
  const { reduceMotion } = useAccessibilityStore();

  const [query,       setQuery]       = useState(params.get("q") ?? "");
  const [inputVal,    setInputVal]    = useState(params.get("q") ?? "");
  const [response,    setResponse]    = useState<SearchResponse | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [tab,         setTab]         = useState<"results" | "map">("results");
  const [filters,     setFilters]     = useState<SearchFilters>({});
  const [selectedNode,setSelectedNode]= useState<SearchResult | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // Run search
  const runSearch = useCallback(async (q: string, f: SearchFilters) => {
    if (!q.trim()) { setResponse(null); return; }
    setLoading(true);
    try {
      const res = await searchArchive(q, f, "relevance");
      setResponse(res);
    } finally {
      setLoading(false);
    }
  }, []);

  // On query change sync URL + run
  function handleSubmit(q: string) {
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
    runSearch(q, filters);
  }

  // Initial load from URL
  useEffect(() => {
    const q = params.get("q") ?? "";
    if (q) { setQuery(q); setInputVal(q); runSearch(q, filters); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(f: SearchFilters) {
    setFilters(f);
    if (query) runSearch(query, f);
  }

  const results = response?.results ?? [];

  return (
    <div className="min-h-screen pt-[4.5rem]">
      {/* Hero search band */}
      <div
        className="relative py-16 bg-night border-b border-[rgba(244,237,224,0.07)] overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(201,162,75,0.04) 0%, transparent 70%)" }}
      >
        <Container narrow>
          <ScrollReveal>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="eyebrow text-gold/70">Smart Archive Discovery</p>
                <h1 className="font-serif text-h1 text-ivory">Search the Archive</h1>
                <GoldRule className="mx-auto" />
                <p className="font-sans text-caption text-ivory/40">
                  Searching by meaning, not just keywords. Powered by demo synonym matching.
                </p>
              </div>

              <SearchBar
                value={inputVal}
                onChange={setInputVal}
                onSubmit={handleSubmit}
                large
                autoFocus
              />

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center" aria-label="Search suggestions">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => { setInputVal(chip); handleSubmit(chip); }}
                    className="font-sans text-xs text-ivory/50 hover:text-gold border border-[rgba(244,237,224,0.12)] hover:border-gold/30 px-3 py-1.5 rounded-sharp transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </div>

      {/* Results area */}
      {(query || response) && (
        <Container className="py-8">
          {/* Tab switcher */}
          <div
            className="flex items-center gap-0 border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden mb-6 w-fit"
            role="tablist"
            aria-label="Search view"
          >
            {([
              { id: "results", label: "Results",       icon: ListIcon },
              { id: "map",     label: "Knowledge Map", icon: Map      },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 font-sans text-[0.8125rem] font-medium transition-all",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
                  tab === id
                    ? "bg-gold/12 text-gold border-r border-[rgba(244,237,224,0.12)]"
                    : "text-ivory/50 hover:text-ivory/80 border-r border-[rgba(244,237,224,0.12)] last:border-0"
                )}
              >
                <Icon size={13} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>

          {/* Aria live region for results count */}
          <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only">
            {!loading && response && `${response.total} results found for ${query}`}
          </div>

          {tab === "results" ? (
            <div className="flex gap-7">
              {/* Sidebar */}
              <aside className="hidden lg:block w-52 shrink-0">
                <div className="sticky top-32 space-y-4">
                  <FilterPanel filters={filters} onChange={handleFilterChange} />
                </div>
              </aside>

              {/* Main results */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Query understanding */}
                {response && (
                  <QueryUnderstanding
                    concepts={response.concepts}
                    total={response.total}
                    queryTime={response.queryTime}
                    query={query}
                  />
                )}

                {/* Active filters */}
                <ActiveFilters filters={filters} onChange={handleFilterChange} />

                {/* Skeleton / results */}
                {loading ? (
                  <div className="space-y-3"><SkeletonGrid count={4} view="list" /></div>
                ) : results.length === 0 && query ? (
                  <div className="py-20 text-center space-y-4">
                    <p className="font-serif text-h3 text-ivory/40">No results found</p>
                    <p className="font-sans text-caption text-ivory/25">
                      Try a different query or clear filters. This is demo synonym matching — full semantic search comes in a later build.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((r) => (
                      <ResultCard key={r.item.id} result={r} />
                    ))}
                  </div>
                )}

                {/* Related content rail */}
                {!loading && results.length > 0 && (
                  <div className="pt-6 border-t border-[rgba(244,237,224,0.07)]">
                    <p className="eyebrow text-ivory/30 mb-3">Also in the archive</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {results.slice(0, 4).map((r) => (
                        <Link
                          key={r.item.id + "-rail"}
                          href={`/document/${r.item.id}`}
                          className="shrink-0 w-44 surface rounded-card p-3 space-y-1.5 hover:border-gold/20 transition-all border border-[rgba(244,237,224,0.08)]"
                        >
                          <span className="eyebrow text-[0.52rem] text-gold/60">{r.item.type}</span>
                          <p className="font-sans text-xs text-ivory/60 line-clamp-2 leading-snug">{r.item.title}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Knowledge Map */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="font-sans text-xs text-ivory/35 italic">
                  Knowledge Map — prototype visualisation of semantic relationships (demo data)
                </p>
                <DemoBadge />
              </div>

              <div className="flex gap-5 items-start">
                <div className="flex-1 min-w-0">
                  {!loading && results.length > 0 ? (
                    <KnowledgeMapScene
                      results={results}
                      query={query}
                      tier={reduceMotion ? "none" : tier}
                      onSelect={(r) => setSelectedNode(r)}
                    />
                  ) : loading ? (
                    <div className="h-[440px] flex items-center justify-center bg-night rounded-card border border-[rgba(244,237,224,0.08)]">
                      <span className="eyebrow text-ivory/25 animate-pulse">Building knowledge map…</span>
                    </div>
                  ) : (
                    <div className="h-[440px] flex items-center justify-center bg-night rounded-card border border-[rgba(244,237,224,0.08)]">
                      <p className="font-sans text-sm text-ivory/30">No results to map. Try a different query.</p>
                    </div>
                  )}
                </div>

                {/* Node detail panel */}
                <AnimatePresence>
                  {selectedNode && (
                    <NodePanel result={selectedNode} onClose={() => setSelectedNode(null)} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </Container>
      )}

      {/* Empty / initial state */}
      {!query && !response && (
        <Container className="py-24 text-center">
          <BookOpen size={36} strokeWidth={1} className="text-ivory/15 mx-auto mb-4" />
          <p className="font-serif text-h3 text-ivory/30">Enter a query above to search the archive</p>
          <p className="font-sans text-caption text-ivory/20 mt-2">Press <kbd className="font-sans text-[0.65rem] border border-[rgba(244,237,224,0.15)] rounded px-1.5 py-0.5 text-ivory/30">/</kbd> anytime to focus the search bar</p>
        </Container>
      )}
    </div>
  );
}

export function SearchPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading search…</span></div>}>
      <SearchContent />
    </Suspense>
  );
}
