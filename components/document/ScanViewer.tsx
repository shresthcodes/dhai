"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronLeft, ChevronRight, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentPage } from "@/data/models";
import { useAccessibilityStore } from "@/store/accessibility";

interface ScanViewerProps {
  pages:        DocumentPage[];
  currentPage:  number;
  onPageChange: (n: number) => void;
  title:        string;
  source:       string;
  className?:   string;
}

const PLACEHOLDER_SRC = "/scans/sample-scan-01.svg";

export function ScanViewer({ pages, currentPage, onPageChange, title, source, className }: ScanViewerProps) {
  const { reduceMotion } = useAccessibilityStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  const [zoom,       setZoom]       = useState(1);
  const [rotation,   setRotation]   = useState(0);
  const [pan,        setPan]        = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart,  setDragStart]  = useState({ x: 0, y: 0 });
  const [tilt,       setTilt]       = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);

  const page = pages.find((p) => p.n === currentPage) ?? pages[0];
  const src  = page?.imageSrc ?? PLACEHOLDER_SRC;
  const isSyntheticSvg = src.endsWith(".svg") || !page?.imageSrc;

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "+") setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === "ArrowRight" && currentPage < pages.length) onPageChange(currentPage + 1);
      if (e.key === "ArrowLeft"  && currentPage > 1)            onPageChange(currentPage - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, pages.length, onPageChange]);

  // Mouse tilt (disabled under reduced motion or while dragging)
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion || isDragging || zoom > 1) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    setTilt({
      x: ((e.clientY - cy) / rect.height) * -3,
      y: ((e.clientX - cx) / rect.width)  *  3,
    });
  }
  function resetTilt() { setTilt({ x: 0, y: 0 }); }

  // Pan drag
  function onPointerDown(e: React.PointerEvent) {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function onPointerUp() { setIsDragging(false); }

  function fitView() { setZoom(1); setPan({ x: 0, y: 0 }); setRotation(0); }

  const viewerBody = (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-[#12100E] rounded-[4px] overflow-hidden select-none",
        fullscreen ? "fixed inset-0 z-[200] rounded-none" : "aspect-[3/4] w-full",
        isDragging && "cursor-grabbing"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={!fullscreen && !reduceMotion ? {
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s ease",
        boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(201,162,75,0.18)",
      } : undefined}
    >
      {/* Gold mat border */}
      <div className="absolute inset-0 border border-[rgba(201,162,75,0.22)] rounded-[4px] pointer-events-none z-10" />

      {/* Spotlight gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(232,220,195,0.04) 0%, transparent 70%)" }}
      />

      {/* Image */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={`${title} — page ${currentPage} of ${pages.length}`}
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.25s ease",
            maxWidth: "100%", maxHeight: "100%",
            objectFit: "contain",
            filter: "sepia(0.08) contrast(1.04)",
          }}
        />
      </div>

      {/* Synthetic label */}
      {isSyntheticSvg && (
        <div className="absolute top-2 left-2 z-20 bg-night/80 rounded-sharp px-2 py-0.5">
          <span className="eyebrow text-[0.5rem] text-ivory/40">Synthetic demo scan</span>
        </div>
      )}

      {/* Fullscreen close */}
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 z-30 p-2 glass rounded-sharp text-ivory/60 hover:text-ivory transition-colors focus-visible:outline-gold"
          aria-label="Exit fullscreen"
        >
          <Minimize2 size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Controls bar */}
      <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Scan viewer controls">
        <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} className="p-1.5 text-ivory/50 hover:text-gold transition-colors rounded-sharp border border-[rgba(244,237,224,0.1)] focus-visible:outline-gold" aria-label="Zoom in"><ZoomIn size={14} strokeWidth={1.5} /></button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} className="p-1.5 text-ivory/50 hover:text-gold transition-colors rounded-sharp border border-[rgba(244,237,224,0.1)] focus-visible:outline-gold" aria-label="Zoom out"><ZoomOut size={14} strokeWidth={1.5} /></button>
        <button onClick={fitView} className="px-2.5 py-1 font-sans text-[0.65rem] text-ivory/45 hover:text-ivory/80 border border-[rgba(244,237,224,0.1)] rounded-sharp transition-colors focus-visible:outline-gold" aria-label="Fit to view">Fit</button>
        <button onClick={() => setRotation((r) => (r + 90) % 360)} className="p-1.5 text-ivory/50 hover:text-gold transition-colors rounded-sharp border border-[rgba(244,237,224,0.1)] focus-visible:outline-gold" aria-label="Rotate 90°"><RotateCw size={14} strokeWidth={1.5} /></button>
        <button onClick={() => setFullscreen(true)} className="p-1.5 text-ivory/50 hover:text-gold transition-colors rounded-sharp border border-[rgba(244,237,224,0.1)] focus-visible:outline-gold ml-auto" aria-label="Fullscreen"><Maximize2 size={14} strokeWidth={1.5} /></button>
      </div>

      {/* Viewer */}
      {viewerBody}

      {/* Caption */}
      <div className="space-y-0.5">
        <p className="font-sans text-[0.68rem] text-ivory/40">
          Original scan — page {currentPage} of {pages.length}
        </p>
        <p className="font-sans text-[0.62rem] text-ivory/25">Source: {source}</p>
      </div>

      {/* Thumbnail strip + page nav */}
      {pages.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 text-ivory/40 hover:text-ivory/70 disabled:opacity-25 transition-colors focus-visible:outline-gold rounded-sharp"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <div className="flex gap-1.5 overflow-x-auto flex-1">
            {pages.map((p) => (
              <button
                key={p.n}
                onClick={() => onPageChange(p.n)}
                className={cn(
                  "shrink-0 w-10 h-13 rounded-[3px] border transition-all focus-visible:outline-gold overflow-hidden",
                  currentPage === p.n ? "border-gold/60 shadow-glow" : "border-[rgba(244,237,224,0.1)] hover:border-gold/30"
                )}
                aria-label={`Page ${p.n}`}
                aria-current={currentPage === p.n}
                style={{ height: 52 }}
              >
                <div className="w-full h-full bg-panel flex items-center justify-center">
                  <span className="font-sans text-[0.55rem] text-ivory/40">{p.n}</span>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage >= pages.length}
            className="p-1.5 text-ivory/40 hover:text-ivory/70 disabled:opacity-25 transition-colors focus-visible:outline-gold rounded-sharp"
            aria-label="Next page"
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
