"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, CheckCircle, AlertTriangle, ChevronRight,
  RotateCcw, Archive, ScanLine, FileText, ShieldCheck, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DocumentPage } from "@/data/models";

/* ─── Demo precomputed OCR result ─────────────────────────────────── */
interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

const DEMO_OCR_WORDS: OcrWord[] = [
  { text: "This",         confidence: 95, bbox: { x0: 10.5, y0: 17.8, x1: 15.0, y1: 19.8 } },
  { text: "is",           confidence: 97, bbox: { x0: 15.5, y0: 17.8, x1: 18.0, y1: 19.8 } },
  { text: "sample",       confidence: 91, bbox: { x0: 18.5, y0: 17.8, x1: 25.5, y1: 19.8 } },
  { text: "text",         confidence: 93, bbox: { x0: 26.0, y0: 17.8, x1: 31.0, y1: 19.8 } },
  { text: "for",          confidence: 96, bbox: { x0: 31.5, y0: 17.8, x1: 35.5, y1: 19.8 } },
  { text: "demonstrating",confidence: 72, bbox: { x0: 36.0, y0: 17.8, x1: 52.0, y1: 19.8 } },
  { text: "OCR",          confidence: 88, bbox: { x0: 52.5, y0: 17.8, x1: 57.5, y1: 19.8 } },
  { text: "archive",      confidence: 82, bbox: { x0: 10.5, y0: 22.5, x1: 20.0, y1: 24.5 } },
  { text: "extracts",     confidence: 79, bbox: { x0: 20.5, y0: 22.5, x1: 29.0, y1: 24.5 } },
  { text: "optical",      confidence: 85, bbox: { x0: 10.5, y0: 27.0, x1: 19.5, y1: 29.0 } },
  { text: "character",    confidence: 77, bbox: { x0: 20.0, y0: 27.0, x1: 31.0, y1: 29.0 } },
  { text: "recognition",  confidence: 68, bbox: { x0: 31.5, y0: 27.0, x1: 44.5, y1: 29.0 } },
  { text: "constitutional",confidence: 61, bbox: { x0: 10.5, y0: 46.0, x1: 30.0, y1: 48.0 } },
  { text: "validated",    confidence: 55, bbox: { x0: 10.5, y0: 57.5, x1: 22.0, y1: 59.5 } },
];

const PIPELINE_STEPS = [
  { icon: Archive,   label: "Scanned Document",    key: "scan"    },
  { icon: ScanLine,  label: "Image Preprocessing", key: "preproc" },
  { icon: ScanLine,  label: "OCR Engine",          key: "ocr"     },
  { icon: FileText,  label: "Extracted Text",      key: "text"    },
  { icon: ShieldCheck, label: "Human Validation",  key: "valid"   },
  { icon: Database,  label: "Searchable Archive",  key: "archive" },
];

interface ValidatedWord {
  original: string;
  corrected: string;
  validated: boolean;
}

/* ─── Confidence bar ──────────────────────────────────────────────── */
function ConfidenceWord({
  word, validated, onEdit,
}: { word: OcrWord; validated?: ValidatedWord; onEdit: (text: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(validated?.corrected ?? word.text);
  const low = word.confidence < 75;

  function commit() {
    onEdit(val);
    setEditing(false);
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="w-24 px-1 py-0.5 text-xs font-sans bg-panel border border-gold/40 text-ivory rounded focus:outline-gold"
          aria-label={`Edit OCR word: ${word.text}`}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline cursor-pointer font-sans text-sm leading-loose mr-1",
        validated?.validated
          ? "text-ivory/80"
          : low
            ? "text-terracotta/80 border-b border-terracotta/40 border-dashed"
            : "text-ivory/70"
      )}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
      title={`Confidence: ${word.confidence}% — click to edit`}
      aria-label={`${word.text}, confidence ${word.confidence}%${low ? ", low confidence" : ""}`}
    >
      {validated?.corrected ?? word.text}
      {validated?.validated && <CheckCircle size={9} strokeWidth={2} className="inline ml-0.5 text-gold/60 -translate-y-0.5" />}
    </span>
  );
}

/* ─── Main OCR Lab ────────────────────────────────────────────────── */
interface OcrLabProps {
  page:      DocumentPage;
  imageSrc:  string;
}

export function OcrLab({ page, imageSrc }: OcrLabProps) {
  const [pipelineStep,  setPipelineStep]  = useState(-1);
  const [running,       setRunning]       = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [progressMsg,   setProgressMsg]   = useState("");
  const [mode,          setMode]          = useState<"cached" | "live" | null>(null);
  const [words,         setWords]         = useState<OcrWord[]>([]);
  const [validated,     setValidated]     = useState<Record<string, ValidatedWord>>({});
  const [sliderX,       setSliderX]       = useState(50);
  const [sliderDragging,setSliderDragging]= useState(false);
  const [demoSearch,    setDemoSearch]    = useState("");
  const [searchHit,     setSearchHit]     = useState<OcrWord | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const lowConfidenceCount  = words.filter((w) => w.confidence < 75).length;
  const correctedCount      = Object.values(validated).filter((v) => v.validated).length;

  // Preprocessing canvas preview
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx    = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width  = img.naturalWidth  || 400;
      canvas.height = img.naturalHeight || 550;
      ctx.drawImage(img, 0, 0);
      // Grayscale + contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114);
        const c   = Math.min(255, (avg - 128) * 1.4 + 128);
        d[i] = d[i+1] = d[i+2] = c;
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.onerror = () => {
      // Draw placeholder if image fails
      ctx.fillStyle = "#1A1510";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#6B5035";
      ctx.font = "14px monospace";
      ctx.fillText("Preprocessing preview", 20, 40);
      ctx.fillText("(grayscale + contrast)", 20, 60);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const runOcr = useCallback(async () => {
    setRunning(true);
    setPipelineStep(0);
    setProgress(0);
    setProgressMsg("Loading scan…");
    setMode(null);
    setWords([]);

    // Animate pipeline steps
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      await new Promise<void>((r) => setTimeout(r, 350));
      setPipelineStep(i);
    }

    // Try live tesseract
    try {
      setProgressMsg("Initialising OCR engine…");
      setProgress(5);
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          setProgressMsg(m.status);
          setProgress(Math.round(m.progress * 100));
        },
      });
      setProgressMsg("Running OCR…");
      const result = await worker.recognize(imageSrc);
      await worker.terminate();

      const liveWords: OcrWord[] = result.data.words.map((w) => {
        // tesseract.js v5: image dimensions may be on result.data or the block
        // Use safe fallback dimensions
        const iw = (result.data as unknown as Record<string, number>)["imageWidth"]  || 800;
        const ih = (result.data as unknown as Record<string, number>)["imageHeight"] || 1100;
        return {
          text:       w.text,
          confidence: Math.round(w.confidence),
          bbox: {
            x0: (w.bbox.x0 / iw) * 100,
            y0: (w.bbox.y0 / ih) * 100,
            x1: (w.bbox.x1 / iw) * 100,
            y1: (w.bbox.y1 / ih) * 100,
          },
        };
      });

      setWords(liveWords.length ? liveWords : DEMO_OCR_WORDS);
      setMode(liveWords.length ? "live" : "cached");
    } catch {
      // Graceful fallback — show cached result
      setWords(DEMO_OCR_WORDS);
      setMode("cached");
      setProgressMsg("Showing cached demo result (OCR engine unavailable)");
    }

    setProgress(100);
    setRunning(false);
  }, [imageSrc]);

  // Slider drag
  function onSliderPointerDown(e: React.PointerEvent) {
    setSliderDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onSliderPointerMove(e: React.PointerEvent) {
    if (!sliderDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct  = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    setSliderX(pct);
  }
  function onSliderPointerUp() { setSliderDragging(false); }

  // Demo search
  function handleDemoSearch(q: string) {
    setDemoSearch(q);
    if (!q.trim()) { setSearchHit(null); return; }
    const hit = words.find((w) => w.text.toLowerCase().includes(q.toLowerCase()));
    setSearchHit(hit ?? null);
  }

  function handleValidate(wordText: string, corrected: string) {
    setValidated((prev) => ({
      ...prev,
      [wordText]: { original: wordText, corrected, validated: true },
    }));
  }

  return (
    <div className="space-y-8" role="region" aria-label="OCR Lab demonstration">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <p className="eyebrow text-gold/70">OCR Lab</p>
          <p className="font-sans text-caption text-ivory/40">Prototype demonstration — sample document</p>
        </div>
        <DemoBadge />
      </div>

      {/* ── Pipeline stepper ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4" role="list">
          {PIPELINE_STEPS.map((step, i) => {
            const done    = pipelineStep > i;
            const active  = pipelineStep === i;
            return (
              <React.Fragment key={step.key}>
                <motion.div
                  role="listitem"
                  animate={active && !running ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 min-w-[60px]",
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                    done   ? "bg-gold/15 border-gold/40 text-gold"         :
                    active ? "bg-azure/15 border-azure/40 text-azure animate-pulse" :
                             "bg-panel border-[rgba(244,237,224,0.1)] text-ivory/25"
                  )}>
                    {done ? <CheckCircle size={16} strokeWidth={1.5} /> : <step.icon size={16} strokeWidth={1.5} />}
                  </div>
                  <span className={cn("font-sans text-[0.58rem] text-center max-w-[64px] leading-tight",
                    done || active ? "text-ivory/60" : "text-ivory/25"
                  )}>{step.label}</span>
                </motion.div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className={cn("flex-1 h-px mx-1 min-w-[8px] transition-all duration-500",
                    done ? "bg-gold/40" : "bg-[rgba(244,237,224,0.06)]"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        {running && (
          <div className="space-y-1.5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="OCR progress">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-ivory/50" aria-live="polite">{progressMsg}</span>
              <span className="font-sans text-xs text-ivory/35">{progress}%</span>
            </div>
            <div className="h-1 bg-panel rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-soft rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Mode badge */}
        {mode && (
          <div className={cn(
            "mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-sharp border font-sans text-xs",
            mode === "live"
              ? "text-gold/70 bg-gold/8 border-gold/20"
              : "text-ivory/40 bg-panel border-[rgba(244,237,224,0.1)]"
          )}>
            {mode === "live" ? <CheckCircle size={11} strokeWidth={2} /> : <AlertTriangle size={11} strokeWidth={2} />}
            {mode === "live" ? "Live OCR result" : "Showing cached demo result"}
          </div>
        )}
      </div>

      {/* ── Run OCR button ─────────────────────────────────── */}
      {!running && !words.length && (
        <Button variant="primary" size="md" onClick={runOcr} disabled={running}>
          <Play size={14} strokeWidth={1.5} className="mr-1.5" />
          Run OCR on this scan
        </Button>
      )}
      {!running && words.length > 0 && (
        <Button variant="ghost" size="sm" onClick={() => { setWords([]); setPipelineStep(-1); setMode(null); setProgress(0); }}>
          <RotateCcw size={12} strokeWidth={1.5} className="mr-1.5" />
          Reset
        </Button>
      )}

      {/* ── Preprocessing preview ──────────────────────────── */}
      {(running || words.length > 0) && (
        <div className="space-y-2">
          <p className="eyebrow text-ivory/40">Image Preprocessing Preview</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="font-sans text-[0.65rem] text-ivory/30">Original</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="Original scan" className="rounded-sharp border border-[rgba(244,237,224,0.1)] w-full" style={{ filter: "sepia(0.15)" }} />
            </div>
            <div className="space-y-1">
              <p className="font-sans text-[0.65rem] text-ivory/30">Preprocessed (grayscale + contrast)</p>
              <canvas ref={previewCanvasRef} className="rounded-sharp border border-[rgba(244,237,224,0.1)] w-full" />
            </div>
          </div>
        </div>
      )}

      {/* ── Side-by-side slider ────────────────────────────── */}
      {words.length > 0 && (
        <div className="space-y-3">
          <p className="eyebrow text-ivory/40">Scan / Extracted Text Comparison</p>
          <div
            ref={sliderRef}
            className="relative rounded-card overflow-hidden border border-[rgba(244,237,224,0.1)] select-none"
            style={{ height: 360 }}
            onPointerMove={onSliderPointerMove}
            onPointerUp={onSliderPointerUp}
          >
            {/* Left: scan */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderX}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="Scan" className="h-full object-cover" style={{ filter: "sepia(0.1) contrast(1.05)" }} />
              {/* Highlight box for search hit */}
              {searchHit && (
                <div
                  className="absolute border-2 border-gold/70 bg-gold/10 rounded-[2px] transition-all"
                  style={{
                    left:   `${searchHit.bbox.x0}%`,
                    top:    `${searchHit.bbox.y0}%`,
                    width:  `${searchHit.bbox.x1 - searchHit.bbox.x0}%`,
                    height: `${searchHit.bbox.y1 - searchHit.bbox.y0}%`,
                  }}
                  aria-label={`Highlighted word: ${searchHit.text}`}
                />
              )}
            </div>

            {/* Right: extracted text */}
            <div
              className="absolute inset-0 bg-panel overflow-y-auto p-4"
              style={{ left: `${sliderX}%` }}
            >
              <p className="eyebrow text-[0.55rem] text-azure/50 mb-3">Extracted text</p>
              <div className="font-sans text-sm text-ivory/65 leading-loose">
                {words.map((w) => (
                  <ConfidenceWord
                    key={`${w.text}-${w.bbox.x0}`}
                    word={w}
                    validated={validated[w.text]}
                    onEdit={(corrected) => handleValidate(w.text, corrected)}
                  />
                ))}
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gold/60 cursor-ew-resize z-20"
              style={{ left: `${sliderX}%` }}
              onPointerDown={onSliderPointerDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gold/80 border-2 border-white/20 flex items-center justify-center shadow-lg cursor-ew-resize">
                <span className="text-[10px] font-bold text-ink select-none">⟺</span>
              </div>
            </div>
          </div>
          <p className="font-sans text-[0.65rem] text-ivory/25 italic">
            Confidence values are indicative and vary by scan quality.
          </p>
        </div>
      )}

      {/* ── Validation panel ──────────────────────────────── */}
      {words.length > 0 && (
        <div className="surface rounded-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="eyebrow text-ivory/50">Validation</p>
            <p className="font-sans text-xs text-ivory/35">
              {lowConfidenceCount} words flagged · {correctedCount} corrected
            </p>
          </div>
          <p className="font-sans text-caption text-ivory/45">
            Words with confidence below 75% are underlined in terracotta. Click any word to edit and mark as validated.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {words.filter((w) => w.confidence < 75).slice(0, 8).map((w) => (
              <ConfidenceWord
                key={`val-${w.text}-${w.bbox.x0}`}
                word={w}
                validated={validated[w.text]}
                onEdit={(corrected) => handleValidate(w.text, corrected)}
              />
            ))}
          </div>

          {/* Demo search */}
          <div className="pt-2 border-t border-[rgba(244,237,224,0.07)] space-y-2">
            <p className="font-sans text-xs text-ivory/40">Find in scan:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={demoSearch}
                onChange={(e) => handleDemoSearch(e.target.value)}
                placeholder="Type a word from the OCR result…"
                className="flex-1 bg-panel border border-[rgba(244,237,224,0.12)] rounded-sharp px-3 py-1.5 font-sans text-xs text-ivory/70 placeholder:text-ivory/20 focus:outline-gold"
                aria-label="Search extracted text"
              />
              {searchHit && (
                <span className="flex items-center gap-1 text-gold/70 font-sans text-xs">
                  <CheckCircle size={12} strokeWidth={1.5} />
                  Found — highlighted on scan
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Final state ───────────────────────────────────── */}
      {correctedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-card border border-gold/20 bg-gold/4"
        >
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
            <Database size={16} strokeWidth={1.5} className="text-gold/70" />
          </motion.div>
          <div>
            <p className="font-sans text-sm text-ivory/70 font-medium">Added to searchable archive</p>
            <p className="font-sans text-xs text-ivory/35">{correctedCount} word{correctedCount !== 1 ? "s" : ""} validated · Prototype demonstration</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
