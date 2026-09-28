/* ─── BM25 Index ──────────────────────────────────────────────────────
   Lightweight in-memory BM25 built at ingest time.
   Persisted as part of the index (chunks.json has the text).
──────────────────────────────────────────────────────────────────── */
import type { Chunk } from "./types";

const K1 = 1.5;
const B  = 0.75;

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s।]/gu, " ").split(/\s+/).filter((t) => t.length > 1);
}

export interface BM25Index {
  idf:      Map<string, number>;
  tf:       Map<string, number>[];     // per chunk
  avgLen:   number;
  docLens:  number[];
}

export function buildBM25(chunks: Chunk[]): BM25Index {
  const df     = new Map<string, number>();
  const tfs    = chunks.map((c) => {
    const tokens = tokenize(c.text);
    const freq   = new Map<string, number>();
    for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
    // Update DF
    for (const t of freq.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return freq;
  });

  const N      = chunks.length;
  const idf    = new Map<string, number>();
  for (const [term, docFreq] of df) {
    idf.set(term, Math.log((N - docFreq + 0.5) / (docFreq + 0.5) + 1));
  }

  const docLens = tfs.map((tf) => Array.from(tf.values()).reduce((a, b) => a + b, 0));
  const avgLen  = docLens.reduce((a, b) => a + b, 0) / (N || 1);

  return { idf, tf: tfs, avgLen, docLens };
}

export function bm25Score(query: string, chunkIdx: number, index: BM25Index): number {
  const tokens  = tokenize(query);
  const { idf, tf, avgLen, docLens } = index;
  const docLen  = docLens[chunkIdx] ?? 0;
  let   score   = 0;

  for (const term of tokens) {
    const termIdf = idf.get(term) ?? 0;
    const termTf  = tf[chunkIdx]?.get(term) ?? 0;
    const num     = termTf * (K1 + 1);
    const den     = termTf + K1 * (1 - B + B * docLen / avgLen);
    score        += termIdf * (num / (den || 1));
  }

  return score;
}
