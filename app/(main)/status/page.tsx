"use client";
import React, { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { GoldRule }   from "@/components/ui/GoldRule";

interface HealthData {
  indexReady:     boolean;
  indexMeta?:     { embeddingModel: string; docCount: number; chunkCount: number; builtAt: string } | null;
  llmProvider:    string;
  llmModel:       string;
  embeddingModel: string;
  anthropicKeySet: boolean;
}

const pkg = { version: "0.1.0", buildTime: new Date().toISOString().slice(0, 10) };

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error,  setError]  = useState(false);
  const mode = process.env.NEXT_PUBLIC_ASK_MODE === "live" ? "LIVE" : "DEMO";

  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen pt-[4.5rem] flex items-center justify-center">
      <Container narrow>
        <div className="surface rounded-card p-8 space-y-5 border border-[rgba(244,237,224,0.08)]">
          <div>
            <p className="eyebrow text-gold/60">System Status</p>
            <h1 className="font-serif text-h2 text-ivory">DHAI Status</h1>
            <GoldRule width="sm" className="mt-2" />
          </div>
          {[
            { label: "App version",    value: pkg.version },
            { label: "Build date",     value: pkg.buildTime },
            { label: "Ask mode",       value: mode, highlight: mode === "LIVE" },
            { label: "Index ready",    value: health?.indexReady ? "Yes" : "No (demo mode)" },
            { label: "Documents",      value: health?.indexMeta?.docCount ?? "—" },
            { label: "Chunks",         value: health?.indexMeta?.chunkCount ?? "—" },
            { label: "Index built",    value: health?.indexMeta?.builtAt?.slice(0, 10) ?? "—" },
            { label: "Embedding model",value: health?.embeddingModel ?? "—" },
            { label: "LLM provider",   value: health?.llmProvider ?? "—" },
            { label: "LLM model",      value: health?.llmModel ?? "—" },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center justify-between border-b border-[rgba(244,237,224,0.06)] pb-2">
              <span className="font-sans text-caption text-ivory/40">{label}</span>
              <span className={`font-sans text-sm ${highlight ? "text-gold font-semibold" : "text-ivory/70"}`}>{String(value)}</span>
            </div>
          ))}
          {error && <p className="font-sans text-caption text-terracotta/60">Could not load health data</p>}
          <p className="font-sans text-[0.65rem] text-ivory/20 italic">
            Prototype — Smart India Hackathon 2026. API keys never shown.
          </p>
        </div>
      </Container>
    </div>
  );
}
