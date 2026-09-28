/* ─── RAG Core Types ──────────────────────────────────────────────────
   Server-only. Never imported in client bundles.
──────────────────────────────────────────────────────────────────── */

export interface CorpusSource {
  file:       string;
  title:      string;
  type:       string;
  language:   string;
  source:     string;
  sourceUrl:  string;
  date:       string | null;
  rights:     string;
  reference:  string;
}

export interface Chunk {
  id:          string;    // docId_chunkIndex
  docId:       string;    // slugified filename
  title:       string;
  type:        string;
  language:    string;
  source:      string;
  sourceUrl:   string;
  date:        string | null;
  page:        number | null;
  segment:     number | null;
  text:        string;
  charStart:   number;
  charEnd:     number;
  chunkIndex:  number;
  prevId:      string | null;
  nextId:      string | null;
  isDemo:      boolean;
  contentHash: string;
  embedding?:  Float32Array;
}

export interface IndexMeta {
  embeddingModel:  string;
  embeddingDims:   number;
  chunkSize:       number;
  chunkOverlap:    number;
  builtAt:         string;
  docCount:        number;
  chunkCount:      number;
}

export interface RetrievedChunk {
  chunk:         Chunk;
  vectorScore:   number;   // cosine similarity 0-1
  bm25Score:     number;   // normalised 0-1
  fusedScore:    number;   // RRF-fused
  retrievalScore:number;   // 0-1 for UI
}

export interface RAGAnswer {
  status:       "answered" | "insufficient_evidence";
  answer:       string;
  sources:      RetrievedChunk[];
  concepts:     string[];
  candidatesConsidered: number;
  chunksUsed:   number;
  mode:         "LIVE" | "DEMO_SCRIPTED";
  embeddingModel: string;
  llmModel:     string;
  llmProvider:  string;
  latencyMs:    number;
  stageTimings: Record<string, number>;
  tokenCounts?: { input: number; output: number };
  validation:   "passed" | "fallback_extractive" | "skipped";
  isDemo:       boolean;
}

export type RAGStage =
  | "understanding" | "retrieving" | "ranking" | "composing" | "citing";
