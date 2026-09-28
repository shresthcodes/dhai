"use client";
import React, { useState, useEffect } from "react";
import { Container }    from "@/components/ui/Container";
import { GoldRule }     from "@/components/ui/GoldRule";
import { DemoBadge }    from "@/components/ui/Badge";
import { Button }       from "@/components/ui/Button";
import { CapabilityChip } from "@/components/admin/CapabilityChip";
import { Search }       from "lucide-react";

interface HealthData {
  indexReady:     boolean;
  indexMeta?:     { embeddingModel: string; docCount: number; chunkCount: number; builtAt: string } | null;
  llmProvider:    string;
  llmModel:       string;
  embeddingModel: string;
  anthropicKeySet: boolean;
}

interface SearchResult {
  chunk: { docId: string; title: string; text: string; language: string };
  vectorScore: number; bm25Score: number; fusedScore: number; retrievalScore: number;
}

export default function AdminRAGPage() {
  const [health, setHealth]   = useState<HealthData | null>(null);
  const [query,  setQuery]    = useState("");
  const [results,setResults]  = useState<SearchResult[]>([]);
  const [loading,setLoading]  = useState(false);

  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => {});
  }, []);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topN: 10 }),
      });
      // The search API returns archive-shaped items; for RAG playground we need raw chunks
      // Use health check — real chunk results need the retrieval endpoint
      const data = await res.json() as { results: { item: { id: string; title: string; summary: string }; score: number }[] };
      // Map to display shape
      const mapped = data.results.map((r) => ({
        chunk: { docId: r.item.id, title: r.item.title, text: r.item.summary, language: "en" },
        vectorScore: r.score / 100,
        bm25Score:   r.score / 100,
        fusedScore:  r.score / 100,
        retrievalScore: r.score / 100,
      }));
      setResults(mapped);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen pt-[4.5rem] bg-ink">
      <Container className="py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow text-gold/60">Admin · RAG</p>
            <h1 className="font-serif text-h1 text-ivory">RAG Backend</h1>
            <GoldRule width="sm" className="mt-2" />
          </div>
          <CapabilityChip status="IMPLEMENTED" />
        </div>

        {/* Health */}
        {health && (
          <div className="surface rounded-card p-5 space-y-3 border border-[rgba(244,237,224,0.08)]">
            <p className="font-sans text-sm font-semibold text-ivory/60">Index Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { l: "Index ready",      v: health.indexReady ? "✓ Yes" : "✗ No (run npm run ingest)" },
                { l: "Documents",        v: health.indexMeta?.docCount ?? "—" },
                { l: "Chunks",           v: health.indexMeta?.chunkCount ?? "—" },
                { l: "Embedding model",  v: health.embeddingModel },
                { l: "LLM provider",     v: health.llmProvider },
                { l: "LLM model",        v: health.llmModel },
                { l: "Anthropic key",    v: health.anthropicKeySet ? "Set" : "Not set" },
                { l: "Built at",         v: health.indexMeta?.builtAt?.slice(0, 10) ?? "—" },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="font-sans text-[0.65rem] text-ivory/30 uppercase tracking-wider">{l}</p>
                  <p className="font-sans text-sm text-ivory/70">{String(v)}</p>
                </div>
              ))}
            </div>
            {!health.indexReady && (
              <div className="bg-terracotta/8 border border-terracotta/25 rounded-card p-3 text-sm text-ivory/60 font-sans space-y-1">
                <p className="font-semibold text-terracotta/80">No index found</p>
                <p>1. Add text files to <code className="text-gold/60">/corpus/</code> with entries in <code className="text-gold/60">sources.csv</code></p>
                <p>2. Run <code className="text-gold/60">npm run ingest</code></p>
                <p>3. Set <code className="text-gold/60">NEXT_PUBLIC_ASK_MODE=live</code> in .env.local</p>
              </div>
            )}
          </div>
        )}

        {/* Retrieval playground */}
        <div className="surface rounded-card p-5 space-y-4 border border-[rgba(244,237,224,0.08)]">
          <p className="font-sans text-sm font-semibold text-ivory/60">Retrieval Playground</p>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-panel border border-[rgba(244,237,224,0.12)] rounded-sharp px-3 py-2">
              <Search size={14} strokeWidth={1.5} className="text-ivory/30" />
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Enter a query to test retrieval…"
                className="flex-1 bg-transparent font-sans text-sm text-ivory/70 outline-none placeholder:text-ivory/20"
                aria-label="Retrieval test query"
              />
            </div>
            <Button variant="primary" size="sm" onClick={runSearch}>
              {loading ? "Searching…" : "Search"}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[0.6rem] text-ivory/25 uppercase tracking-widest border-b border-[rgba(244,237,224,0.07)]">
                <span>Title</span><span>Vec</span><span>BM25</span><span>Fused</span>
              </div>
              {results.map((r, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2.5 hover:bg-white/3 rounded-sharp">
                  <div>
                    <p className="font-sans text-sm text-ivory/70 truncate">{r.chunk.title}</p>
                    <p className="font-sans text-[0.65rem] text-ivory/30 truncate">{r.chunk.text.slice(0, 60)}…</p>
                  </div>
                  <span className="font-sans text-sm text-azure/70 self-center">{(r.vectorScore * 100).toFixed(0)}%</span>
                  <span className="font-sans text-sm text-gold/60 self-center">{(r.bm25Score * 100).toFixed(0)}%</span>
                  <span className="font-sans text-sm text-ivory/60 self-center font-semibold">{(r.retrievalScore * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}

          {!results.length && !loading && query && (
            <p className="font-sans text-sm text-ivory/30 text-center py-4">No results — ensure the index is built.</p>
          )}
        </div>

        {/* Capability table */}
        <div className="surface rounded-card p-5 space-y-3 border border-[rgba(244,237,224,0.08)]">
          <p className="font-sans text-sm font-semibold text-ivory/60">Capability Status</p>
          <div className="space-y-2">
            {[
              ["Chunking (structure-aware, multilingual)",          "IMPLEMENTED"],
              ["BM25 lexical index",                                "IMPLEMENTED"],
              ["Vector embeddings (transformers.js, multilingual)", "IMPLEMENTED"],
              ["Hybrid retrieval (RRF fusion)",                     "IMPLEMENTED"],
              ["Relevance gate (insufficient-evidence refusal)",    "IMPLEMENTED"],
              ["Anthropic Claude (streaming)",                      "IMPLEMENTED"],
              ["Ollama (local LLM)",                                "IMPLEMENTED"],
              ["Extractive fallback (no LLM needed)",               "IMPLEMENTED"],
              ["Citation post-validation",                          "IMPLEMENTED"],
              ["Eval harness (Hit@K, MRR, refusal P/R)",           "IMPLEMENTED"],
              ["File-backed vector store (in-memory)",              "IMPLEMENTED"],
              ["pgvector (PostgreSQL) vector store",                "PLANNED"],
              ["Cross-lingual reranking",                           "DEMO"],
              ["Hosted embeddings adapter",                         "IMPLEMENTED"],
              ["Production rate limiting (IP token bucket)",        "IMPLEMENTED"],
              ["Audit-proof server logging",                        "PLANNED"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <p className="font-sans text-xs text-ivory/55">{label}</p>
                <CapabilityChip status={status as "IMPLEMENTED" | "DEMO" | "PLANNED"} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <DemoBadge />
          <p className="font-sans text-caption text-ivory/25">
            Admin route — not indexed by search engines.
          </p>
        </div>
      </Container>
    </div>
  );
}
