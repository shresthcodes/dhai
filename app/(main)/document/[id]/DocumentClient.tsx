"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Volume2, Languages, Bookmark, BookmarkCheck,
  Share2, Download, ExternalLink, ChevronRight,
  Info, FileSearch, Brain, Tag, AlertCircle, Copy,
} from "lucide-react";
import { Container }        from "@/components/ui/Container";
import { DemoBadge }        from "@/components/ui/Badge";
import { Button }           from "@/components/ui/Button";
import { GoldRule }         from "@/components/ui/GoldRule";
import { Tooltip }          from "@/components/ui/Tooltip";
import { ScrollReveal }     from "@/components/ui/ScrollReveal";
import { ArchiveCard }      from "@/components/archive/ArchiveCard";
import { ScanViewer }       from "@/components/document/ScanViewer";
import { OcrLab }           from "@/components/document/OcrLab";
import { AudioPlayer }      from "@/components/document/AudioPlayer";
import { useCollectionStore }   from "@/store/collection";
import { useAccessibilityStore } from "@/store/accessibility";
import { useLanguageStore }  from "@/store/language";
import { useToast }          from "@/components/ui/Toast";
import { loadArchive }       from "@/data/archiveService";
import { cn }                from "@/lib/utils";
import type { ArchiveItem }  from "@/data/models";
import type { Language }     from "@/data/models";

type DocTab   = "read" | "summary" | "metadata" | "evidence";
type DocMode  = "reading" | "ocr";

const TYPE_LABELS: Record<string, string> = {
  writing: "Writing", speech: "Speech", manuscript: "Manuscript",
  debate: "Debate", photograph: "Photograph", record: "Record",
  audio: "Audio", video: "Video",
};

const METADATA_TOOLTIPS: Record<string, string> = {
  id:         "Unique identifier used for linking, search and citation.",
  date:       "Verified dates ensure accurate historical research.",
  language:   "Language metadata enables multilingual search and discovery.",
  type:       "Document type supports filtering and collection management.",
  topic:      "Topics power semantic search and knowledge mapping.",
  collection: "Collection context aids provenance and institutional management.",
  source:     "Primary source citation is essential for scholarly verification.",
  keywords:   "Keywords improve discoverability across the archive.",
  access:     "Access rights govern public availability and preservation policy.",
  ocr:        "OCR metadata tracks digitisation quality and validation status.",
};

export function DocumentClient({ item }: { item: ArchiveItem }) {
  const [docTab,       setDocTab]       = useState<DocTab>("read");
  const [docMode,      setDocMode]      = useState<DocMode>("reading");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [showAudio,    setShowAudio]    = useState(false);
  const [activeLang,   setActiveLang]   = useState<Language>(item.language);
  const [activeSentence, setActiveSentence] = useState(-1);

  const { isSaved, saveItem, removeItem } = useCollectionStore();
  const { textScale }                     = useAccessibilityStore();
  const { language }                      = useLanguageStore();
  const { toast }                         = useToast();
  const saved = isSaved(item.id);

  // All archive items (for related rail)
  const allItems  = loadArchive();
  const related   = (item.related ?? []).map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as ArchiveItem[];
  const pages     = item.pages ?? [];
  const page      = pages.find((p) => p.n === currentPage) ?? pages[0];
  const scanSrc   = page?.imageSrc ?? "/scans/sample-scan-01.svg";

  // Translation layer
  const translation = item.translations?.[activeLang];
  const displayTitle   = translation?.title   ?? item.title;
  const displaySummary = translation?.summary ?? item.aiSummary?.text ?? item.summary;

  // Text content for Read tab
  const readText = page?.ocrText ?? item.summary;

  // Split into sentences for audio sync
  const sentences = readText.split(/(?<=[.!?])\s+/).filter(Boolean);

  function handleSave() {
    if (saved) { removeItem(item.id); toast("Removed from collection", "info"); }
    else        { saveItem(item.id);  toast("Saved to collection", "success"); }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url }); return; }
      catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard", "success");
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href     = scanSrc;
    link.download = `dhai-demo-${item.id}-scan.svg`;
    link.click();
    toast("Download started (demo scan)", "info");
  }

  const LANGS: Language[] = ["en", "hi", "gu"];
  const LANG_NAMES: Record<Language, string> = { en: "EN", hi: "हि", mr: "मर", gu: "ગુ" };

  return (
    <div className="min-h-screen pt-[4.5rem]" style={{ fontSize: `${textScale}rem` }}>
      {/* Breadcrumb */}
      <div className="bg-night border-b border-[rgba(244,237,224,0.07)]">
        <Container className="py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-sans text-xs text-ivory/35 flex-wrap">
            <Link href="/" className="hover:text-gold transition-colors focus-visible:outline-gold">Home</Link>
            <ChevronRight size={10} strokeWidth={1.5} />
            <Link href="/archive" className="hover:text-gold transition-colors focus-visible:outline-gold">Archive</Link>
            <ChevronRight size={10} strokeWidth={1.5} />
            <span className="capitalize text-ivory/50">{item.type}</span>
            <ChevronRight size={10} strokeWidth={1.5} />
            <span className="text-ivory/70 line-clamp-1 max-w-[200px]">{displayTitle}</span>
          </nav>
        </Container>
      </div>

      <Container className="py-8">
        {/* Page header */}
        <ScrollReveal>
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow text-[0.6rem] text-gold/70 border border-gold/25 px-2 py-0.5 rounded-sharp uppercase tracking-widest">{TYPE_LABELS[item.type] ?? item.type}</span>
              <DemoBadge />
              {item.access === "open" && (
                <span className="eyebrow text-[0.58rem] text-azure/60 border border-azure/20 px-2 py-0.5 rounded-sharp">Open access</span>
              )}
            </div>

            <h1 className="font-serif text-ivory leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
              {displayTitle}
            </h1>

            {/* Summary teaser under title */}
            <p className="font-sans text-[0.9rem] text-ivory/45 max-w-2xl leading-relaxed">
              {item.summary.length > 180 ? item.summary.slice(0, 180) + "…" : item.summary}
            </p>

            {/* Topics */}
            {item.topic.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.topic.map((tp) => (
                  <span key={tp} className="font-sans text-[0.65rem] text-ivory/35 border border-[rgba(244,237,224,0.1)] px-2.5 py-1 rounded-[8px] capitalize">
                    {tp}
                  </span>
                ))}
              </div>
            )}

            <GoldRule />

            {/* Action bar */}
            <div className="flex flex-wrap gap-2">
              <Button variant="primary"   size="sm" onClick={() => setShowAudio(true)}>
                <Volume2 size={13} strokeWidth={1.5} className="mr-1" />Listen
              </Button>
              <div className="flex items-center border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden">
                {LANGS.map((l) => (
                  <button key={l}
                    onClick={() => setActiveLang(l)}
                    className={cn("px-2.5 py-2 font-sans text-[0.7rem] transition-all focus-visible:outline-gold",
                      activeLang === l ? "bg-gold/12 text-gold" : "text-ivory/40 hover:text-ivory/70"
                    )}
                    aria-pressed={activeLang === l}
                    lang={l}
                  >{LANG_NAMES[l]}</button>
                ))}
              </div>
              <button onClick={handleSave} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-sharp border font-sans text-xs transition-all focus-visible:outline-gold",
                saved ? "bg-gold/12 text-gold border-gold/30" : "text-ivory/50 border-[rgba(244,237,224,0.12)] hover:text-gold hover:border-gold/30"
              )} aria-pressed={saved} aria-label={saved ? "Remove from collection" : "Save to collection"}>
                {saved ? <BookmarkCheck size={13} strokeWidth={1.5} /> : <Bookmark size={13} strokeWidth={1.5} />}
                {saved ? "Saved" : "Save"}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.12)] font-sans text-xs text-ivory/50 hover:text-ivory/80 transition-all focus-visible:outline-gold" aria-label="Share this document">
                <Share2 size={13} strokeWidth={1.5} />Share
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.12)] font-sans text-xs text-ivory/50 hover:text-ivory/80 transition-all focus-visible:outline-gold" aria-label="Download scan">
                <Download size={13} strokeWidth={1.5} />Download
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Mode toggle */}
        <div className="flex items-center gap-0 border border-[rgba(244,237,224,0.12)] rounded-sharp overflow-hidden w-fit mb-8" role="tablist" aria-label="Document view mode">
          {(["reading", "ocr"] as DocMode[]).map((m) => (
            <button key={m}
              role="tab"
              aria-selected={docMode === m}
              onClick={() => setDocMode(m)}
              className={cn("px-4 py-2.5 font-sans text-[0.8125rem] font-medium transition-all border-r border-[rgba(244,237,224,0.1)] last:border-0 focus-visible:outline-gold",
                docMode === m ? "bg-gold/12 text-gold" : "text-ivory/50 hover:text-ivory/80"
              )}
            >
              {m === "reading" ? "Reading view" : "OCR Lab"}
            </button>
          ))}
        </div>

        {/* ── Reading view ────────────────────────────────── */}
        {docMode === "reading" && (
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8">
            {/* LEFT: Scan viewer */}
            <ScanViewer
              pages={pages.length ? pages : [{ n: 1, imageSrc: "/scans/sample-scan-01.svg", ocrStatus: "pending", ocrText: item.summary }]}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              title={item.title}
              source={item.source}
            />

            {/* RIGHT: Tabs */}
            <div className="space-y-0">
              {/* Tab bar */}
              <div className="flex border-b border-[rgba(244,237,224,0.08)] mb-0" role="tablist" aria-label="Document panels">
                {([
                  { id: "read",     icon: FileSearch, label: "Read" },
                  { id: "summary",  icon: Brain,      label: "AI Summary" },
                  { id: "metadata", icon: Tag,        label: "Metadata" },
                  { id: "evidence", icon: Info,       label: "Evidence" },
                ] as { id: DocTab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
                  <button key={id}
                    role="tab"
                    aria-selected={docTab === id}
                    onClick={() => setDocTab(id)}
                    className={cn("flex items-center gap-1.5 px-3 py-3 font-sans text-[0.78rem] font-medium border-b-2 transition-all focus-visible:outline-gold",
                      docTab === id ? "border-gold text-gold" : "border-transparent text-ivory/45 hover:text-ivory/70"
                    )}
                  >
                    <Icon size={12} strokeWidth={1.5} />{label}
                  </button>
                ))}
              </div>

              <div className="pt-4 min-h-[400px]" role="tabpanel">
                {/* ── READ tab ────────────────────────────── */}
                {docTab === "read" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-sans text-[0.62rem] px-2 py-0.5 rounded-sharp border",
                          page?.ocrStatus === "validated"
                            ? "text-gold/70 border-gold/25 bg-gold/8"
                            : "text-ivory/35 border-[rgba(244,237,224,0.1)]"
                        )}>
                          {page?.ocrStatus === "validated" ? "Text source: OCR — validated" : "Text source: OCR — pending validation"}
                        </span>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(readText); toast("Text copied", "success"); }}
                        className="flex items-center gap-1 font-sans text-[0.68rem] text-ivory/35 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp"
                        aria-label="Copy extracted text"
                      >
                        <Copy size={11} strokeWidth={1.5} />Copy
                      </button>
                    </div>

                    {/* Translation notice */}
                    {activeLang !== item.language && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-sharp border border-azure/20 bg-azure/4">
                        <AlertCircle size={12} strokeWidth={1.5} className="text-azure/60 shrink-0 mt-0.5" />
                        <p className="font-sans text-[0.7rem] text-ivory/50">
                          {translation
                            ? "Machine translation — demo — requires human validation for official content."
                            : "Translation not available in demo. Showing original text."}
                        </p>
                      </div>
                    )}

                    {/* Text with sentence highlighting for audio */}
                    <div
                      className="font-sans text-[0.925rem] text-ivory/70 leading-[1.9] max-h-[520px] overflow-y-auto pr-3 space-y-4 print:max-h-none"
                      lang={activeLang}
                      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,162,75,0.2) transparent" }}
                    >
                      {readText.split("\n\n").map((para, pi) => (
                        <p key={pi}>
                          {para.split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence, si) => {
                            const globalIdx = readText.split("\n\n").slice(0, pi).join(" ").split(/(?<=[.!?])\s+/).length + si;
                            return (
                              <span
                                key={si}
                                className={cn(
                                  "transition-all duration-200",
                                  activeSentence === globalIdx ? "text-ivory bg-gold/12 rounded-[3px] px-0.5" : ""
                                )}
                                aria-current={activeSentence === globalIdx ? "true" : undefined}
                              >
                                {sentence}{" "}
                              </span>
                            );
                          })}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SUMMARY tab ─────────────────────────── */}
                {docTab === "summary" && (
                  <div className="space-y-4">
                    {/* Distinct AI panel */}
                    <div className="rounded-[18px] border border-azure/25 bg-azure/4 p-6 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Brain size={15} strokeWidth={1.5} className="text-azure/70" />
                          <span className="eyebrow text-[0.58rem] text-azure/70">AI-Generated — Not Archival Text</span>
                        </div>
                        <DemoBadge />
                      </div>
                      <GoldRule width="sm" />
                      <p className="font-sans text-[0.9rem] text-ivory/70 leading-[1.8]" lang={activeLang}>
                        {displaySummary}
                      </p>
                      {item.aiSummary && (
                        <div className="flex flex-wrap gap-3 pt-1">
                          <span className="font-sans text-[0.65rem] text-ivory/30 border border-[rgba(244,237,224,0.08)] px-2.5 py-1 rounded-[8px]">
                            Based on page{item.aiSummary.basedOnPages.length > 1 ? "s" : ""}: {item.aiSummary.basedOnPages.join(", ")}
                          </span>
                          <span className="font-sans text-[0.65rem] text-ivory/30 border border-[rgba(244,237,224,0.08)] px-2.5 py-1 rounded-[8px]">
                            Generated by: {item.aiSummary.generatedBy}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Key themes extracted from keywords */}
                    {item.keywords.length > 0 && (
                      <div className="space-y-2">
                        <p className="eyebrow text-[0.6rem] text-ivory/35">Key themes identified</p>
                        <div className="flex flex-wrap gap-2">
                          {item.keywords.slice(0, 8).map((kw) => (
                            <span key={kw}
                              className="font-sans text-[0.72rem] text-gold/60 border border-gold/15 bg-gold/5 px-3 py-1.5 rounded-[10px] capitalize">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links to related */}
                    {related.length > 0 && (
                      <div className="space-y-2">
                        <p className="eyebrow text-[0.6rem] text-ivory/35">Related documents in archive</p>
                        <div className="space-y-1.5">
                          {related.slice(0, 3).map((r) => (
                            <Link key={r.id} href={`/document/${r.id}`}
                              className="flex items-center gap-2 font-sans text-[0.8rem] text-ivory/50 hover:text-gold transition-colors group focus-visible:outline-gold rounded-sharp">
                              <ExternalLink size={11} strokeWidth={1.5} className="shrink-0 group-hover:text-gold" />
                              <span className="truncate">{r.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2 pt-1">
                      <AlertCircle size={11} strokeWidth={1.5} className="text-ivory/25 shrink-0 mt-0.5" />
                      <p className="font-sans text-[0.65rem] text-ivory/25 italic">
                        Always verify against the original document. AI summaries may contain errors or omissions.
                      </p>
                    </div>

                    {activeLang !== item.language && !translation && (
                      <p className="font-sans text-caption text-ivory/30 italic">Translation not available in demo.</p>
                    )}
                  </div>
                )}

                {/* ── METADATA tab ────────────────────────── */}
                {docTab === "metadata" && (
                  <div className="space-y-0 divide-y divide-[rgba(244,237,224,0.07)]">
                    {([
                      { key: "id",         label: "Document ID",   value: item.id },
                      { key: "date",       label: "Date",          value: item.date ?? "Date to be verified" },
                      { key: "language",   label: "Language",      value: item.language.toUpperCase() },
                      { key: "type",       label: "Document Type", value: TYPE_LABELS[item.type] ?? item.type },
                      { key: "topic",      label: "Topics",        value: item.topic.join(" · ") },
                      { key: "collection", label: "Collection",    value: item.collection },
                      { key: "source",     label: "Source",        value: item.source },
                      { key: "keywords",   label: "Keywords",      value: item.keywords.join(", ") },
                      { key: "access",     label: "Access",        value: item.access ?? "Open" },
                      { key: "ocr",        label: "OCR Status",    value: `${item.ocrMeta?.engine ?? "—"} · ${page?.ocrStatus ?? "—"}` },
                    ]).map(({ key, label, value }) => (
                      <div key={key} className="flex items-start justify-between gap-4 py-2.5">
                        <div className="flex items-center gap-1.5 shrink-0 min-w-[110px]">
                          <span className="font-sans text-[0.72rem] font-medium text-ivory/45">{label}</span>
                          <Tooltip content={METADATA_TOOLTIPS[key] ?? "Archive metadata field"} side="right">
                            <Info size={10} strokeWidth={1.5} className="text-ivory/20 cursor-help" />
                          </Tooltip>
                        </div>
                        <span className="font-sans text-[0.78rem] text-ivory/65 text-right">{value}</span>
                      </div>
                    ))}
                    {item.ocrMeta?.note && (
                      <p className="font-sans text-[0.65rem] text-ivory/25 italic pt-3">{item.ocrMeta.note}</p>
                    )}
                  </div>
                )}

                {/* ── EVIDENCE tab ────────────────────────── */}
                {docTab === "evidence" && (
                  <div className="space-y-4">
                    <div className="surface rounded-card p-5 space-y-4">
                      <p className="eyebrow text-ivory/45">Source & Evidence</p>
                      <GoldRule width="sm" />
                      <div className="space-y-2.5">
                        {[
                          { label: "Original file",  value: `${item.id}.svg (demo scan)` },
                          { label: "Page reference", value: `Page ${currentPage} of ${pages.length || 1}` },
                          { label: "Archive source", value: item.source },
                          { label: "Integrity note", value: "Content integrity tracking will be implemented in a later build phase. This is a conceptual demonstration." },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="font-sans text-[0.65rem] text-ivory/35 uppercase tracking-wider">{label}</p>
                            <p className="font-sans text-[0.8rem] text-ivory/60 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => window.open(scanSrc, "_blank")}
                        className="flex items-center gap-1.5 font-sans text-xs text-gold/60 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp"
                        aria-label="View original source scan"
                      >
                        <ExternalLink size={12} strokeWidth={1.5} />View Original Source
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── OCR Lab mode ────────────────────────────────── */}
        {docMode === "ocr" && (
          <OcrLab
            page={pages[0] ?? { n: 1, imageSrc: "/scans/sample-scan-01.svg", ocrStatus: "pending", ocrText: item.summary }}
            imageSrc={scanSrc}
          />
        )}

        {/* ── Related rail ────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[rgba(244,237,224,0.07)]">
            <p className="eyebrow text-ivory/40 mb-4">Related in the archive</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.slice(0, 3).map((r) => (
                <ArchiveCard key={r.id} item={r} view="grid" />
              ))}
            </div>
          </div>
        )}

        {/* ── Prev / Next ──────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-[rgba(244,237,224,0.07)] flex items-center justify-between flex-wrap gap-4">
          <Button variant="ghost" size="sm" href="/archive">← Back to Archive</Button>
          <Button variant="secondary" size="sm" href={`/ask?doc=${item.id}`}>
            Ask the Archive about this document
          </Button>
        </div>
      </Container>

      {/* ── Audio Player ─────────────────────────────────── */}
      <AnimatePresence>
        {showAudio && (
          <AudioPlayer
            text={readText}
            lang={activeLang}
            onClose={() => setShowAudio(false)}
            onSentenceChange={setActiveSentence}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
