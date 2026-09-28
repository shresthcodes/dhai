"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/Badge";
import { GoldRule } from "@/components/ui/GoldRule";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { CategoryTabs } from "@/components/archive/CategoryTabs";
import { FilterPanel, ActiveFilters } from "@/components/archive/FilterPanel";
import { cn } from "@/lib/utils";
import {
  getArchiveItems, loadArchive,
  type SearchFilters, type SortOption,
} from "@/data/archiveService";
import type { ArchiveItem } from "@/data/models";

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Relevance",     value: "relevance" },
  { label: "Title A–Z",     value: "title-az" },
  { label: "Type",          value: "type" },
  { label: "Recently added",value: "recently-added" },
];

const PAGE_SIZE = 8;

function ArchiveContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [items,        setItems]        = useState<ArchiveItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [view,         setView]         = useState<"grid" | "list">("grid");
  const [sort,         setSort]         = useState<SortOption>("relevance");
  const [sortOpen,     setSortOpen]     = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [page,         setPage]         = useState(1);
  const [filters,      setFilters]      = useState<SearchFilters>({});

  const totalDemo = loadArchive().length;

  // Read ?type= from URL
  useEffect(() => {
    const typeParam = params.get("type");
    if (typeParam) {
      const types = typeParam.split(",").filter(Boolean);
      setFilters((f) => ({ ...f, type: types }));
    }
  }, [params]);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback((f: SearchFilters) => {
    const url = new URL(window.location.href);
    if (f.type?.length) url.searchParams.set("type", f.type.join(","));
    else url.searchParams.delete("type");
    if (f.language?.length) url.searchParams.set("lang", f.language.join(","));
    else url.searchParams.delete("lang");
    if (f.topic?.length) url.searchParams.set("topic", f.topic.join(","));
    else url.searchParams.delete("topic");
    if (f.collection?.length) url.searchParams.set("col", f.collection.join(","));
    else url.searchParams.delete("col");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Load items
  useEffect(() => {
    setLoading(true);
    setPage(1);
    getArchiveItems(filters)
      .then((data) => {
        let sorted = [...data];
        if (sort === "title-az") sorted.sort((a, b) => a.title.localeCompare(b.title));
        if (sort === "type")     sorted.sort((a, b) => a.type.localeCompare(b.type));
        setItems(sorted);
      })
      .finally(() => setLoading(false));
  }, [filters, sort]);

  function handleFilterChange(f: SearchFilters) {
    setFilters(f);
    syncFiltersToUrl(f);
  }

  function handleCategory(val: string) {
    if (!val) {
      handleFilterChange({ ...filters, type: undefined });
    } else {
      handleFilterChange({ ...filters, type: val.split(",") });
    }
  }

  const activeCategory = filters.type?.join(",") ?? "";
  const visibleItems   = items.slice(0, page * PAGE_SIZE);
  const hasMore        = visibleItems.length < items.length;

  return (
    <div className="min-h-screen pt-[4.5rem]">
      {/* Page header */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-10">
          <ScrollReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="eyebrow text-gold/70 tracking-[0.25em]">Explore the Archive</p>
                <h1 className="font-serif text-h1 text-ivory">The Collection</h1>
                <GoldRule />
                <p className="font-sans text-caption text-ivory/45 max-w-lg mt-2">
                  Browse all archival materials by category, language and topic.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* Animated record count */}
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-[2.5rem] text-gold/80 leading-none tabular-nums">{totalDemo}</span>
                  <span className="font-sans text-sm text-ivory/30">demo records</span>
                </div>
                <DemoBadge />
              </div>
            </div>
          </ScrollReveal>
        </Container>

        {/* Sticky control bar */}
        <div className="sticky top-[4.5rem] z-40 bg-night/95 backdrop-blur-sm border-b border-[rgba(244,237,224,0.07)]">
          <Container>
            <div className="flex items-center gap-0 justify-between">
              <div className="flex-1 overflow-hidden">
                <CategoryTabs active={activeCategory} onChange={handleCategory} />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-[rgba(244,237,224,0.08)] ml-2">
                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((v) => !v)}
                    className="flex items-center gap-1.5 font-sans text-xs text-ivory/50 hover:text-ivory/80 py-3 px-2 transition-colors focus-visible:outline-gold focus-visible:rounded-sharp"
                    aria-label="Sort options"
                    aria-expanded={sortOpen}
                  >
                    {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                    <ChevronDown size={12} strokeWidth={1.5} className={cn("transition-transform", sortOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full mt-1 glass rounded-card py-1.5 min-w-[160px] z-50 shadow-card"
                      >
                        {SORT_OPTIONS.map((o) => (
                          <button
                            key={o.value}
                            onClick={() => { setSort(o.value); setSortOpen(false); }}
                            className={cn(
                              "w-full text-left px-4 py-2 font-sans text-xs transition-colors",
                              sort === o.value ? "text-gold bg-gold/8" : "text-ivory/60 hover:text-ivory hover:bg-white/5"
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* View toggle */}
                <div className="flex items-center border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden">
                  {(["grid", "list"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={cn(
                        "p-2 transition-colors focus-visible:outline-gold",
                        view === v ? "bg-gold/15 text-gold" : "text-ivory/35 hover:text-ivory/70"
                      )}
                      aria-label={`${v} view`}
                      aria-pressed={view === v}
                    >
                      {v === "grid" ? <LayoutGrid size={14} strokeWidth={1.5} /> : <List size={14} strokeWidth={1.5} />}
                    </button>
                  ))}
                </div>

                {/* Mobile filter toggle */}
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="lg:hidden flex items-center gap-1.5 p-2 text-ivory/50 hover:text-ivory/80 border border-[rgba(244,237,224,0.12)] rounded-sharp transition-colors focus-visible:outline-gold"
                  aria-label="Toggle filters"
                  aria-expanded={filterOpen}
                >
                  <SlidersHorizontal size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-8">
        <div className="flex gap-7">
          {/* Filter sidebar — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-32">
              <FilterPanel filters={filters} onChange={handleFilterChange} />
            </div>
          </aside>

          {/* Mobile filter drawer */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed inset-y-0 left-0 z-50 w-72 glass p-6 overflow-y-auto lg:hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-sm font-semibold text-ivory">Filters</span>
                  <button onClick={() => setFilterOpen(false)} className="text-ivory/40 hover:text-ivory transition-colors p-1 rounded focus-visible:outline-gold" aria-label="Close filters">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <FilterPanel filters={filters} onChange={handleFilterChange} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Active filters */}
            <ActiveFilters filters={filters} onChange={handleFilterChange} />

            {/* Result meta */}
            {!loading && (
              <p className="font-sans text-caption text-ivory/30">
                Showing {visibleItems.length} of {items.length} records
              </p>
            )}

            {/* Grid / list */}
            {loading ? (
              <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
                : "space-y-3"
              }>
                <SkeletonGrid count={6} view={view} />
              </div>
            ) : items.length === 0 ? (
              /* Empty state */
              <div className="py-20 text-center space-y-4">
                <p className="font-serif text-h3 text-ivory/40">No records found</p>
                <p className="font-sans text-caption text-ivory/25">Try adjusting your filters or clearing the selection.</p>
                <Button variant="ghost" size="sm" onClick={() => handleFilterChange({})}>Clear all filters</Button>
              </div>
            ) : (
              <div className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
                : "space-y-3"
              }>
                {visibleItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i % PAGE_SIZE, 5) * 0.05 }}
                    className={view === "list" ? "" : "h-full"}
                  >
                    <ArchiveCard
                      item={item}
                      view={view}
                      featured={view === "grid" && i < 2}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="flex justify-center pt-4">
                <Button variant="secondary" size="md" onClick={() => setPage((p) => p + 1)}>
                  Load more ({items.length - visibleItems.length} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export function ArchivePageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><span className="eyebrow text-ivory/30">Loading archive…</span></div>}>
      <ArchiveContent />
    </Suspense>
  );
}
