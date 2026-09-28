"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, X, ChevronRight } from "lucide-react";
import { KioskButton } from "@/components/kiosk/KioskButton";
import { DemoBadge } from "@/components/ui/Badge";
import { useKioskStore } from "@/store/kiosk";
import { loadArchive } from "@/data/archiveService";
import type { ArchiveItem } from "@/data/models";
import { t } from "@/lib/i18n";
import type { Language } from "@/data/models";

const TYPE_LABELS: Record<string, string> = {
  writing:     "Writing",
  speech:      "Speech",
  manuscript:  "Manuscript",
  debate:      "Constitutional Debate",
  photograph:  "Photograph",
  record:      "Historical Record",
  audio:       "Audio",
  video:       "Video",
};

const TYPE_ACCENT: Record<string, string> = {
  writing:    "#C9A24B",
  speech:     "#4C7FB8",
  manuscript: "#E3C77A",
  debate:     "#B5573A",
  photograph: "#C9A24B",
  record:     "#4C7FB8",
  audio:      "#B5573A",
  video:      "#E3C77A",
};

const PAGE_SIZE = 8;

const ALL_TYPES = ["writing","speech","manuscript","debate","photograph","record","audio","video"];

/* ─── Document detail panel ─────────────────────────────────────────── */
function DocDetail({ item, lang, onClose }: { item: ArchiveItem; lang: Language; onClose: () => void }) {
  const tr = (k: string) => t(k, lang);
  const accent = TYPE_ACCENT[item.type] ?? "#C9A24B";
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 280 }}
      className="absolute inset-0 bg-ink flex flex-col z-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={onClose}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-sm border px-3 py-1 rounded-[10px] capitalize"
              style={{ color: accent, borderColor: `${accent}40` }}>
              {TYPE_LABELS[item.type] ?? item.type}
            </span>
            <DemoBadge />
          </div>
          <h1 className="font-serif text-[1.75rem] text-ivory leading-tight truncate">{item.title}</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Summary */}
        <div>
          <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40 mb-2">
            {tr("document.tab.summary")}
          </p>
          <p className="font-sans text-[1.4rem] text-ivory/75 leading-relaxed">{item.summary}</p>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Collection", value: item.collection },
            { label: "Source",     value: item.source },
            { label: "Language",   value: item.language.toUpperCase() },
            { label: "Topics",     value: item.topic.join(", ") || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-panel rounded-[16px] p-5 border border-[rgba(244,237,224,0.08)]">
              <p className="font-sans text-sm text-ivory/35 mb-1">{label}</p>
              <p className="font-sans text-[1.1rem] text-ivory/80">{value}</p>
            </div>
          ))}
        </div>

        {/* Keywords */}
        {item.keywords.length > 0 && (
          <div>
            <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40 mb-3">Keywords</p>
            <div className="flex flex-wrap gap-3">
              {item.keywords.map((kw) => (
                <span key={kw} className="font-sans text-base text-ivory/50 border border-[rgba(244,237,224,0.12)] px-4 py-2 rounded-[12px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Full text preview */}
        {item.fullText && (
          <div>
            <p className="eyebrow text-[0.75rem] tracking-[0.2em] text-ivory/40 mb-3">
              {tr("document.tab.read")}
            </p>
            <div className="bg-panel rounded-[16px] p-6 border border-[rgba(244,237,224,0.08)]">
              <p className="font-sans text-[1.2rem] text-ivory/60 leading-relaxed line-clamp-8">
                {item.fullText}
              </p>
            </div>
          </div>
        )}

        {/* Demo notice */}
        <div className="py-4 text-center">
          <p className="font-sans text-sm text-ivory/25 italic">{tr("common.demoNotice")}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Archive browse ─────────────────────────────────────────────────── */
function ArchiveContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { language, addItem } = useKioskStore();
  const lang        = (language as Language) ?? "en";
  const tr          = (k: string) => t(k, lang);

  const allItems    = loadArchive();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage]             = useState(0);
  const [selected, setSelected]     = useState<ArchiveItem | null>(null);

  // Deep-link to specific item
  useEffect(() => {
    const id = params.get("id");
    if (id) {
      const found = allItems.find((i) => i.id === id);
      if (found) setSelected(found);
    }
  }, [params, allItems]);

  const filtered = typeFilter === "all"
    ? allItems
    : allItems.filter((i) => i.type === typeFilter);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function selectItem(item: ArchiveItem) {
    setSelected(item);
    addItem({ id: item.id, title: item.title, kind: item.type, path: `/kiosk/archive?id=${item.id}` });
  }

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-night border-b border-[rgba(244,237,224,0.1)] shrink-0">
        <KioskButton variant="secondary" size="lg" onClick={() => router.push("/kiosk")}>
          <ArrowLeft size={22} strokeWidth={1.5} />
        </KioskButton>
        <BookOpen size={26} strokeWidth={1.5} className="text-gold/60" />
        <h1 className="font-serif text-[1.75rem] text-ivory flex-1">{tr("kiosk.explore")}</h1>
        <span className="font-sans text-sm text-ivory/30 hidden sm:block">
          {filtered.length} {tr("common.demoData")} records
        </span>
        <DemoBadge />
      </div>

      {/* Type filters */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto scrollbar-none shrink-0 border-b border-[rgba(244,237,224,0.06)]">
        <button
          onClick={() => { setTypeFilter("all"); setPage(0); }}
          className={`shrink-0 font-sans text-lg px-6 py-3 rounded-[14px] border-2 transition-all min-h-[60px] focus-visible:outline-gold ${
            typeFilter === "all"
              ? "bg-gold/15 border-gold/40 text-gold"
              : "border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/25"
          }`}
        >
          {tr("archive.tabAll")} ({allItems.length})
        </button>
        {ALL_TYPES.map((typ) => {
          const count = allItems.filter((i) => i.type === typ).length;
          if (count === 0) return null;
          return (
            <button key={typ}
              onClick={() => { setTypeFilter(typ); setPage(0); }}
              className={`shrink-0 font-sans text-lg px-6 py-3 rounded-[14px] border-2 transition-all min-h-[60px] focus-visible:outline-gold capitalize ${
                typeFilter === typ
                  ? "bg-gold/15 border-gold/40 text-gold"
                  : "border-[rgba(244,237,224,0.12)] text-ivory/50 hover:border-gold/25"
              }`}
            >
              {TYPE_LABELS[typ]} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {pageItems.map((item) => {
            const accent = TYPE_ACCENT[item.type] ?? "#C9A24B";
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectItem(item)}
                className="flex flex-col text-left p-5 rounded-[20px] border-2 border-[rgba(244,237,224,0.1)] bg-panel hover:border-gold/25 transition-all min-h-[180px] gap-3 focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm capitalize border px-2 py-1 rounded-[8px]"
                    style={{ color: accent, borderColor: `${accent}35` }}>
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <ChevronRight size={16} strokeWidth={1.5} className="text-ivory/25" />
                </div>
                <p className="font-serif text-[1.25rem] text-ivory leading-snug flex-1">{item.title}</p>
                <p className="font-sans text-sm text-ivory/40 line-clamp-2">{item.summary}</p>
              </motion.button>
            );
          })}
        </div>
        {pageItems.length === 0 && (
          <p className="font-sans text-lg text-ivory/30 text-center py-16">{tr("common.noResults")}</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 py-4 border-t border-[rgba(244,237,224,0.08)] shrink-0">
          <KioskButton variant="secondary" size="xl"
            onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            <ArrowLeft size={24} strokeWidth={1.5} />{tr("kiosk.prevPage")}
          </KioskButton>
          <span className="font-sans text-lg text-ivory/50">{page + 1} / {totalPages}</span>
          <KioskButton variant="secondary" size="xl"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
            {tr("kiosk.nextPage")}<ArrowRight size={24} strokeWidth={1.5} />
          </KioskButton>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <DocDetail
            key={selected.id}
            item={selected}
            lang={lang}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KioskArchivePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-ink flex items-center justify-center">
        <p className="font-sans text-ivory/30 text-xl">Loading…</p>
      </div>
    }>
      <ArchiveContent />
    </Suspense>
  );
}
