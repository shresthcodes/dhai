"use client";

import React, { useState } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { GoldRule } from "@/components/ui/GoldRule";
import type { SearchFilters } from "@/data/archiveService";

const TYPE_OPTIONS   = ["writing","speech","manuscript","debate","photograph","record","audio","video"];
const LANG_OPTIONS   = [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }, { value: "mr", label: "मराठी" }, { value: "gu", label: "ગુજરાતી" }];
const TOPIC_OPTIONS  = ["social rights","education","constitutional assembly","equality","legal framework","public address","published works","archival record","community"];
const COLL_OPTIONS   = ["Demo Collection A","Demo Collection B","Demo Collection C"];

interface FilterPanelProps {
  filters:    SearchFilters;
  onChange:   (f: SearchFilters) => void;
  className?: string;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[rgba(244,237,224,0.08)] pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3 group focus-visible:outline-gold focus-visible:rounded-sharp"
        aria-expanded={open}
      >
        <span className="eyebrow text-ivory/50">{title}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.5}
          className={cn("text-ivory/30 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-sharp font-sans text-xs border transition-all duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
        active
          ? "bg-gold/12 text-gold border-gold/30"
          : "text-ivory/45 border-[rgba(244,237,224,0.1)] hover:border-gold/20 hover:text-ivory/70"
      )}
      aria-pressed={active}
    >
      {label}
      {active && <X size={9} strokeWidth={2.5} />}
    </button>
  );
}

function toggle(arr: string[] | undefined, val: string): string[] {
  const list = arr ?? [];
  return list.includes(val) ? list.filter((x) => x !== val) : [...list, val];
}

export function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const hasActive =
    (filters.type?.length ?? 0) +
    (filters.language?.length ?? 0) +
    (filters.topic?.length ?? 0) +
    (filters.collection?.length ?? 0) > 0;

  return (
    <aside
      className={cn("space-y-0", className)}
      aria-label="Archive filters"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} strokeWidth={1.5} className="text-gold/60" />
          <span className="font-sans text-sm font-semibold text-ivory/70">Filters</span>
        </div>
        {hasActive && (
          <button
            onClick={() => onChange({})}
            className="font-sans text-[0.7rem] text-terracotta/70 hover:text-terracotta transition-colors focus-visible:outline-gold focus-visible:rounded-sharp"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <GoldRule width="full" />
      <div className="mt-4 space-y-0">
        {/* Content Type */}
        <FilterSection title="Content Type">
          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((t) => (
              <Chip
                key={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                active={filters.type?.includes(t) ?? false}
                onClick={() => onChange({ ...filters, type: toggle(filters.type, t) })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Language */}
        <FilterSection title="Language">
          <div className="flex flex-wrap gap-1.5">
            {LANG_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                active={filters.language?.includes(value) ?? false}
                onClick={() => onChange({ ...filters, language: toggle(filters.language, value) })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Topic */}
        <FilterSection title="Topic">
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_OPTIONS.map((t) => (
              <Chip
                key={t}
                label={t}
                active={filters.topic?.includes(t) ?? false}
                onClick={() => onChange({ ...filters, topic: toggle(filters.topic, t) })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Collection */}
        <FilterSection title="Collection">
          <div className="flex flex-wrap gap-1.5">
            {COLL_OPTIONS.map((c) => (
              <Chip
                key={c}
                label={c}
                active={filters.collection?.includes(c) ?? false}
                onClick={() => onChange({ ...filters, collection: toggle(filters.collection, c) })}
              />
            ))}
          </div>
        </FilterSection>

        {/* Date — disabled */}
        <FilterSection title="Date">
          <Tooltip content="Dates shown once verified" side="right">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-sharp border border-[rgba(244,237,224,0.08)] opacity-40 cursor-not-allowed"
              aria-disabled="true"
            >
              <span className="font-sans text-xs text-ivory/40">Date filter — pending verification</span>
            </div>
          </Tooltip>
        </FilterSection>
      </div>
    </aside>
  );
}

/* ─── Active filter chips (shown above results) ───────────────────── */
export function ActiveFilters({
  filters, onChange,
}: { filters: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const chips: { label: string; onRemove: () => void }[] = [
    ...(filters.type ?? []).map((t) => ({ label: `Type: ${t}`, onRemove: () => onChange({ ...filters, type: toggle(filters.type, t) }) })),
    ...(filters.language ?? []).map((l) => ({ label: `Lang: ${l}`, onRemove: () => onChange({ ...filters, language: toggle(filters.language, l) }) })),
    ...(filters.topic ?? []).map((t) => ({ label: `Topic: ${t}`, onRemove: () => onChange({ ...filters, topic: toggle(filters.topic, t) }) })),
    ...(filters.collection ?? []).map((c) => ({ label: c, onRemove: () => onChange({ ...filters, collection: toggle(filters.collection, c) }) })),
  ];

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center" role="list" aria-label="Active filters">
      {chips.map(({ label, onRemove }) => (
        <span
          key={label}
          role="listitem"
          className="inline-flex items-center gap-1 font-sans text-[0.68rem] text-gold/70 bg-gold/8 border border-gold/20 px-2 py-0.5 rounded-sharp"
        >
          {label}
          <button onClick={onRemove} className="hover:text-gold transition-colors focus-visible:outline-gold" aria-label={`Remove filter ${label}`}>
            <X size={9} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange({})}
        className="font-sans text-[0.68rem] text-ivory/35 hover:text-terracotta transition-colors focus-visible:outline-gold focus-visible:rounded-sharp"
      >
        Clear all
      </button>
    </div>
  );
}
