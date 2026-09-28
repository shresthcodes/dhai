"use client";

import React, { useState } from "react";
import { Play, CheckCircle, AlertTriangle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { useAdminStore } from "@/store/admin/adminStore";
import { GoldRule } from "@/components/ui/GoldRule";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const SCAN_SRC = "/scans/sample-scan-01.svg";

export default function OcrPage() {
  const { assets, setOcr, setLifecycle, currentRole, log } = useAdminStore();
  const { toast } = useToast();
  const [running,     setRunning]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [mode,        setMode]        = useState<"live" | "cached" | null>(null);
  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [editedText,  setEditedText]  = useState("");

  const queue = assets.filter((a) => ["uploaded", "ocr-queued"].includes(a.lifecycle) && a.kind === "scan");
  const done  = assets.filter((a) => a.lifecycle === "ocr-done" || a.ocr?.validated);

  async function runOcr(assetId: string) {
    setActiveId(assetId);
    setRunning(true);
    setProgress(0);
    setMode(null);

    try {
      const { createWorker } = await import("tesseract.js");
      setProgressMsg("Initialising OCR engine…");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          setProgressMsg(m.status);
          setProgress(Math.round(m.progress * 100));
        },
      });
      const result = await worker.recognize(SCAN_SRC);
      await worker.terminate();
      const text = result.data.text;
      setEditedText(text);
      setMode("live");
      setOcr(assetId, {
        status: "done", text,
        wordConfidence: result.data.words.map((w) => ({
          text: w.text, confidence: Math.round(w.confidence),
          bbox: { x0: 0, y0: 0, x1: 1, y1: 1 },
        })),
        engine: "Tesseract (live)", validated: false, needsSpecialist: false,
      });
      log(currentRole!, "ocr-run", assetId, "Live OCR completed");
    } catch {
      // Fallback cached result
      const cachedText = "This is sample text for demonstrating OCR and reading features.\n\nThe archive system extracts text from scanned documents using optical character recognition technology.";
      setEditedText(cachedText);
      setMode("cached");
      setProgressMsg("Showing cached demo result (OCR engine unavailable)");
      setOcr(assetId, {
        status: "done", text: cachedText, wordConfidence: [],
        engine: "Cached demo", validated: false, needsSpecialist: false,
      });
    }
    setProgress(100);
    setRunning(false);
  }

  function handleValidate(assetId: string) {
    setLifecycle(assetId, "in-review", currentRole!, "OCR validated, sent to metadata review");
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      setOcr(assetId, { ...asset.ocr!, text: editedText, validated: true, status: "done" });
    }
    log(currentRole!, "ocr-validated", assetId, "OCR text validated");
    toast("OCR validated · sent to metadata review", "success");
    setActiveId(null);
  }

  const activeAsset = activeId ? assets.find((a) => a.id === activeId) : null;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <p className="eyebrow text-gold/60">OCR Workflow</p>
          <h1 className="font-serif text-h2 text-ivory">OCR Queue</h1>
          <GoldRule width="sm" className="mt-2" />
        </div>

        {/* Pipeline */}
        <div className="surface rounded-card p-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {["Uploaded scan","Preprocessing","OCR Engine","Extracted text","Human validation","Archive"].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center min-w-[90px] px-2 py-1">
                  <span className="font-sans text-[0.68rem] text-ivory/50 text-center leading-tight">{s}</span>
                </div>
                {i < 5 && <span className="text-ivory/15 text-xs shrink-0">→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <CapabilityChip status="IMPLEMENTED" /><span className="font-sans text-[0.62rem] text-ivory/30">Tesseract.js browser OCR</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Queue */}
          <div className="surface rounded-card p-4 space-y-3">
            <p className="font-sans text-sm font-semibold text-ivory/60">Queue ({queue.length})</p>
            {queue.length === 0 && <p className="font-sans text-caption text-ivory/25 italic">No assets in OCR queue.</p>}
            {queue.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 p-3 border border-[rgba(244,237,224,0.08)] rounded-card">
                <div>
                  <p className="font-sans text-sm text-ivory/70">{a.metadata.title}</p>
                  <p className="font-sans text-[0.62rem] text-ivory/30">{a.kind} · {a.lifecycle}</p>
                </div>
                <button
                  onClick={() => runOcr(a.id)}
                  disabled={running && activeId === a.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-ink rounded-sharp font-sans text-xs font-semibold disabled:opacity-40 hover:bg-gold-soft transition-colors focus-visible:outline-gold"
                >
                  <Play size={11} strokeWidth={2} />
                  {running && activeId === a.id ? "Running…" : "Run OCR"}
                </button>
              </div>
            ))}
          </div>

          {/* Validation workspace */}
          {activeAsset && (
            <div className="surface rounded-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sans text-sm font-semibold text-ivory/60">Validation workspace</p>
                {mode && (
                  <span className={cn("font-sans text-[0.62rem] px-2 py-0.5 rounded-sharp border",
                    mode === "live"
                      ? "text-gold/70 border-gold/25 bg-gold/8"
                      : "text-ivory/40 border-[rgba(244,237,224,0.1)]"
                  )}>
                    {mode === "live" ? "Live OCR" : "Cached demo result"}
                  </span>
                )}
              </div>

              {running && (
                <div className="space-y-1.5" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="flex justify-between">
                    <span className="font-sans text-xs text-ivory/40" aria-live="polite">{progressMsg}</span>
                    <span className="font-sans text-xs text-ivory/30">{progress}%</span>
                  </div>
                  <div className="h-1 bg-panel rounded-full overflow-hidden">
                    <div className="h-full bg-gold/60 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {!running && editedText && (
                <>
                  <p className="font-sans text-[0.68rem] text-ivory/40 italic">
                    OCR accuracy varies by scan quality; human validation required.
                  </p>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-48 bg-panel border border-[rgba(244,237,224,0.1)] rounded-sharp px-3 py-2 font-sans text-sm text-ivory/70 outline-none resize-none focus:border-gold/30"
                    aria-label="Edit OCR extracted text"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleValidate(activeAsset.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gold text-ink rounded-sharp font-sans text-xs font-semibold hover:bg-gold-soft transition-colors focus-visible:outline-gold"
                    >
                      <CheckCircle size={12} strokeWidth={1.5} />Mark validated
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Done list */}
        <div className="surface rounded-card p-4 space-y-2">
          <p className="font-sans text-sm font-semibold text-ivory/60">Validated ({done.filter((a) => a.ocr?.validated).length})</p>
          {done.filter((a) => a.ocr?.validated).map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-sharp">
              <CheckCircle size={12} strokeWidth={1.5} className="text-gold/60 shrink-0" />
              <p className="font-sans text-sm text-ivory/60">{a.metadata.title}</p>
              <span className="font-sans text-[0.62rem] text-ivory/30 ml-auto">{a.lifecycle}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
