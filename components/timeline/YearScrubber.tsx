"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { CHAPTERS, type TimelineEvent } from "@/data/timelineService";

interface YearScrubberProps {
  events:       TimelineEvent[];
  activeIdx:    number;
  onJump:       (idx: number) => void;
  showChapters: boolean;
}

export function YearScrubber({ events, activeIdx, onJump, showChapters }: YearScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(pct * (events.length - 1));
    onJump(Math.max(0, Math.min(events.length - 1, idx)));
  }

  const activeEvent = events[activeIdx];

  return (
    <div className="space-y-1.5" aria-label="Timeline scrubber">
      {/* Chapter band strip */}
      {showChapters && (
        <div className="flex h-1.5 rounded-full overflow-hidden">
          {events.map((evt, i) => (
            <div
              key={evt.id}
              style={{ flex: 1, background: CHAPTERS[evt.chapter].accentHex + "55" }}
              title={CHAPTERS[evt.chapter].label}
            />
          ))}
        </div>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer"
        onClick={handleTrackClick}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={events.length - 1}
        aria-valuenow={activeIdx}
        aria-valuetext={`${activeEvent?.dateLabel} — ${activeEvent?.title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")  onJump(Math.max(0, activeIdx - 1));
          if (e.key === "ArrowRight") onJump(Math.min(events.length - 1, activeIdx + 1));
        }}
      >
        {/* Base line */}
        <div className="absolute inset-x-0 h-px bg-[rgba(244,237,224,0.12)]" />
        {/* Played line */}
        <div
          className="absolute left-0 h-px bg-gold/50 transition-all duration-300"
          style={{ width: `${(activeIdx / (events.length - 1)) * 100}%` }}
        />

        {/* Event ticks */}
        {events.map((evt, i) => {
          const pct    = (i / (events.length - 1)) * 100;
          const isAct  = i === activeIdx;
          const meta   = CHAPTERS[evt.chapter];
          return (
            <button
              key={evt.id}
              onClick={(e) => { e.stopPropagation(); onJump(i); }}
              className={cn(
                "absolute -translate-x-1/2 focus-visible:outline-gold",
                isAct ? "z-10" : "z-0"
              )}
              style={{ left: `${pct}%` }}
              title={`${evt.dateLabel} — ${evt.title}`}
              aria-label={`Jump to: ${evt.dateLabel}`}
            >
              <div
                className="rounded-full transition-all duration-200"
                style={{
                  width:  isAct ? 12 : 7,
                  height: isAct ? 12 : 7,
                  background: isAct ? meta.accentHex : meta.accentHex + "80",
                  boxShadow: isAct ? `0 0 8px ${meta.accentHex}80` : "none",
                }}
              />
            </button>
          );
        })}

        {/* Playhead draggable */}
        <div
          className="absolute -translate-x-1/2 pointer-events-none"
          style={{ left: `${(activeIdx / (events.length - 1)) * 100}%` }}
        >
          <div className="w-3 h-3 rounded-full bg-gold border-2 border-ink shadow-glow" />
        </div>
      </div>

      {/* Current label */}
      <div className="flex items-center justify-between px-1">
        <span className="font-sans text-[0.62rem] text-ivory/30 tabular-nums">
          {events[0]?.year}
        </span>
        {activeEvent && (
          <span className="font-sans text-[0.68rem] text-gold/70">
            {activeEvent.dateLabel} · {activeEvent.title}
          </span>
        )}
        <span className="font-sans text-[0.62rem] text-ivory/30 tabular-nums">
          {events[events.length - 1]?.year}
        </span>
      </div>
    </div>
  );
}
