"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize2, RotateCcw, Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Waveform } from "./Waveform";
import { PlaceholderPoster } from "./PlaceholderPoster";
import { formatDuration } from "@/data/mediaService";
import type { RichMediaItem } from "@/data/mediaModels";
import { useAccessibilityStore } from "@/store/accessibility";

interface MediaPlayerProps {
  item:          RichMediaItem;
  onTimeUpdate:  (sec: number) => void;
  onListenOnly?: () => void;
  currentSec:    number;
  isPlaying:     boolean;
  onPlayPause:   () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

export function MediaPlayer({ item, onTimeUpdate, onListenOnly, currentSec, isPlaying, onPlayPause }: MediaPlayerProps) {
  const { reduceMotion } = useAccessibilityStore();
  const videoRef   = useRef<HTMLVideoElement>(null);
  const audioRef   = useRef<HTMLAudioElement>(null);
  const [volume,   setVolume]   = useState(1);
  const [muted,    setMuted]    = useState(false);
  const [speed,    setSpeed]    = useState<number>(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [abStart,  setAbStart]  = useState<number | null>(null);
  const [abEnd,    setAbEnd]    = useState<number | null>(null);
  const hasFile = !!item.src;
  const progress = item.durationSec > 0 ? currentSec / item.durationSec : 0;

  // Sync time from real element
  useEffect(() => {
    const el = videoRef.current ?? audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : volume;
    el.playbackRate = speed;
    if (isPlaying) el.play().catch(() => {});
    else           el.pause();
  }, [isPlaying, volume, muted, speed]);

  function handleNativeTime() {
    const el = videoRef.current ?? audioRef.current;
    if (!el) return;
    onTimeUpdate(el.currentTime);
    // A-B loop
    if (abStart !== null && abEnd !== null && el.currentTime >= abEnd) {
      el.currentTime = abStart;
    }
  }

  function seek(to: number) {
    const el = videoRef.current ?? audioRef.current;
    if (el) el.currentTime = to;
    onTimeUpdate(to);
  }

  function handleSeekBar(e: React.ChangeEvent<HTMLInputElement>) {
    seek(Number(e.target.value));
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); onPlayPause(); }
      if (e.key === "j" || e.key === "ArrowLeft")  seek(Math.max(0, currentSec - 10));
      if (e.key === "l" || e.key === "ArrowRight")  seek(Math.min(item.durationSec, currentSec + 10));
      if (e.key === "f") setFullscreen((v) => !v);
      if (e.key === "m") setMuted((v) => !v);
      if (e.key === "c") { /* caption toggle — handled by parent */ }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSec, item.durationSec, onPlayPause]);

  // Chapter markers as % positions
  const chapterMarkers = item.chapters.map((c) => ({
    pct:   (c.startSec / item.durationSec) * 100,
    title: c.title,
  }));

  const playerBody = (
    <div className="relative w-full bg-[#0A0806] rounded-[4px] overflow-hidden"
      style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(201,162,75,0.2)" }}
    >
      {/* Gold mat border */}
      <div className="absolute inset-0 border border-[rgba(201,162,75,0.18)] rounded-[4px] pointer-events-none z-10" />

      {/* Video / Audio visual */}
      {item.mediaType === "video" ? (
        <div className="aspect-video w-full bg-[#08070A] flex items-center justify-center">
          {hasFile ? (
            <video
              ref={videoRef}
              src={item.src!}
              className="w-full h-full object-contain"
              onTimeUpdate={handleNativeTime}
              aria-label={item.title}
            />
          ) : (
            <PlaceholderPoster title={item.title} kind={item.kind} animate={isPlaying && !reduceMotion} className="w-full h-full" />
          )}
        </div>
      ) : (
        <div className="w-full py-10 px-6 bg-gradient-to-b from-[#12100D] to-[#080604]">
          <Waveform progress={progress} isPlaying={isPlaying && !reduceMotion} bars={90} className="h-20" />
        </div>
      )}

      {/* Hidden real audio element for audio items */}
      {item.mediaType === "audio" && hasFile && (
        <audio ref={audioRef} src={item.src!} onTimeUpdate={handleNativeTime} aria-label={item.title} />
      )}

      {/* Centre play overlay */}
      {!isPlaying && (
        <button
          onClick={onPlayPause}
          className="absolute inset-0 flex items-center justify-center group focus-visible:outline-gold"
          aria-label="Play"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-16 h-16 rounded-full bg-gold/80 backdrop-blur-sm flex items-center justify-center shadow-glow"
          >
            <Play size={24} strokeWidth={2} className="text-ink ml-1" />
          </motion.div>
        </button>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-4">
        {/* Seek bar */}
        <div className="relative mb-2">
          <input
            type="range" min={0} max={item.durationSec} value={currentSec} step={0.5}
            onChange={handleSeekBar}
            className="w-full h-1 appearance-none bg-[rgba(244,237,224,0.15)] rounded-full cursor-pointer"
            style={{ accentColor: "#C9A24B" }}
            aria-label={`Seek: ${formatDuration(currentSec)} of ${formatDuration(item.durationSec)}`}
          />
          {/* Chapter markers */}
          {chapterMarkers.map((c, i) => (
            <div key={i} className="absolute top-0 -translate-y-1 w-0.5 h-3 bg-gold/50 rounded-full pointer-events-none" style={{ left: `${c.pct}%` }} title={c.title} />
          ))}
          {/* A-B markers */}
          {abStart !== null && (
            <div className="absolute top-0 w-1 h-3 bg-azure/70 rounded-full pointer-events-none" style={{ left: `${(abStart / item.durationSec) * 100}%` }} />
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={onPlayPause} className="text-white/80 hover:text-white transition-colors focus-visible:outline-gold rounded-sharp p-0.5" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
          </button>
          {/* Skip ±10s */}
          <button onClick={() => seek(Math.max(0, currentSec - 10))} className="text-white/60 hover:text-white transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Back 10s">
            <SkipBack size={15} strokeWidth={1.5} />
          </button>
          <button onClick={() => seek(Math.min(item.durationSec, currentSec + 10))} className="text-white/60 hover:text-white transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Forward 10s">
            <SkipForward size={15} strokeWidth={1.5} />
          </button>
          {/* Time */}
          <span className="font-sans text-[0.68rem] text-white/60 tabular-nums">
            {formatDuration(currentSec)} / {formatDuration(item.durationSec)}
          </span>
          {/* Volume */}
          <button onClick={() => setMuted((v) => !v)} className="text-white/60 hover:text-white transition-colors focus-visible:outline-gold rounded-sharp ml-auto" aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX size={15} strokeWidth={1.5} /> : <Volume2 size={15} strokeWidth={1.5} />}
          </button>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }}
            className="w-16 h-0.5 appearance-none" style={{ accentColor: "#C9A24B" }}
            aria-label="Volume"
          />
          {/* Speed */}
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-transparent text-white/60 font-sans text-[0.65rem] border-none outline-none cursor-pointer focus:outline-gold"
            aria-label="Playback speed"
          >
            {SPEEDS.map((s) => <option key={s} value={s} className="bg-[#12100D]">{s}×</option>)}
          </select>
          {/* A-B loop */}
          <button
            onClick={() => {
              if (abStart === null) setAbStart(currentSec);
              else if (abEnd === null) setAbEnd(currentSec);
              else { setAbStart(null); setAbEnd(null); }
            }}
            className={cn("font-sans text-[0.62rem] px-1.5 py-0.5 rounded-sharp border transition-colors focus-visible:outline-gold",
              abStart !== null ? "text-azure/80 border-azure/40" : "text-white/40 border-white/15"
            )}
            title="Loop A-B section (click twice to set start/end)"
            aria-label="A-B loop"
          >
            {abStart === null ? "A" : abEnd === null ? "A→B" : "⟳A-B"}
          </button>
          {/* Shortcuts toggle */}
          <button onClick={() => setShowShortcuts((v) => !v)} className="text-white/40 hover:text-white/70 transition-colors focus-visible:outline-gold rounded-sharp" aria-label="Keyboard shortcuts">
            <Keyboard size={13} strokeWidth={1.5} />
          </button>
          {/* Listen only */}
          {onListenOnly && (
            <button onClick={onListenOnly} className="font-sans text-[0.62rem] text-white/40 hover:text-gold transition-colors focus-visible:outline-gold rounded-sharp px-1.5 py-0.5 border border-white/10 hover:border-gold/30" aria-label="Listen only mode">
              Listen only
            </button>
          )}
          {/* Fullscreen */}
          <button onClick={() => setFullscreen((v) => !v)} className="text-white/60 hover:text-white transition-colors focus-visible:outline-gold rounded-sharp" aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {fullscreen ? <Minimize2 size={13} strokeWidth={1.5} /> : <Maximize2 size={13} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Shortcuts cheat-sheet */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-4 right-4 z-30 glass rounded-card p-4 space-y-2 text-[0.65rem] font-sans"
          >
            {[
              ["Space", "Play / Pause"],
              ["J / ←", "Back 10s"],
              ["L / →", "Forward 10s"],
              ["F", "Fullscreen"],
              ["M", "Mute"],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <kbd className="text-gold/60 border border-gold/20 rounded px-1.5 py-0.5 min-w-[2.5rem] text-center">{k}</kbd>
                <span className="text-ivory/50">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
        <div className="w-full max-w-6xl px-4">{playerBody}</div>
        <button onClick={() => setFullscreen(false)} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-2 focus-visible:outline-gold" aria-label="Exit fullscreen">
          <Minimize2 size={20} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return playerBody;
}
