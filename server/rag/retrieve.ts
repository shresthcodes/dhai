import { loadIndex, cosineSim } from "./store";
import { embedQuery }           from "./embeddings";
import { buildBM25, bm25Score } from "./lexical";
import type { Chunk, RetrievedChunk } from "./types";

const TOP_K_VEC  = 30;
const TOP_K_BM25 = 30;
const TOP_N_USED = 5;
const MIN_SCORE  = parseFloat(process.env.RAG_RELEVANCE_THRESHOLD ?? "0.25");

/* ─── Language detection (script-based) ──────────────────────────── */
export function detectLanguage(text: string): "hi" | "gu" | "en" {
  const devanagari = /[\u0900-\u097F]/;
  const gujarati   = /[\u0A80-\u0AFF]/;
  if (gujarati.test(text))   return "gu";
  if (devanagari.test(text)) return "hi";
  return "en";
}

/* ─── Reciprocal Rank Fusion ──────────────────────────────────────── */
function rrf(rankA: number, rankB: number, k = 60): number {
  return 1 / (k + rankA) + 1 / (k + rankB);
}

/* ─── Main retrieval ──────────────────────────────────────────────── */
export interface RetrieveOptions {
  topN?:     number;
  langFilter?: string;
  docFilter?: string;   // restrict to a single docId
  includeDemo?: boolean;
}

export interface RetrieveResult {
  results:              RetrievedChunk[];
  candidatesConsidered: number;
  bestScore:            number;
  insufficient:         boolean;
  vecTimeMs:            number;
  bm25TimeMs:           number;
}

export async function retrieve(query: string, opts: RetrieveOptions = {}): Promise<RetrieveResult> {
  const topN = opts.topN ?? TOP_N_USED;
  const idx  = loadIndex();

  if (!idx || idx.chunks.length === 0) {
    return { results: [], candidatesConsidered: 0, bestScore: 0, insufficient: true, vecTimeMs: 0, bm25TimeMs: 0 };
  }

  const { chunks, vectors, meta } = idx;
  const dims = meta.embeddingDims;

  // Filter
  const eligible = chunks
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      if (!opts.includeDemo && c.isDemo) return false;
      if (opts.langFilter && c.language !== opts.langFilter) return false;
      if (opts.docFilter  && c.docId    !== opts.docFilter)  return false;
      return true;
    });

  if (eligible.length === 0) {
    return { results: [], candidatesConsidered: 0, bestScore: 0, insufficient: true, vecTimeMs: 0, bm25TimeMs: 0 };
  }

  // ── Vector search ────────────────────────────────────────────── //
  const vecStart = Date.now();
  const qVec     = await embedQuery(query);
  const vecScores: { idx: number; score: number }[] = eligible.map(({ i }) => ({
    idx:   i,
    score: cosineSim(qVec, i * dims, vectors, dims),
  }));
  vecScores.sort((a, b) => b.score - a.score);
  const topVec = vecScores.slice(0, TOP_K_VEC);
  const vecTimeMs = Date.now() - vecStart;

  // ── BM25 ─────────────────────────────────────────────────────── //
  const bm25Start = Date.now();
  const bm25Idx   = buildBM25(eligible.map((e) => e.c));
  const bm25Scores: { idx: number; score: number }[] = eligible.map(({ i }, ei) => ({
    idx:   i,
    score: bm25Score(query, ei, bm25Idx),
  }));
  bm25Scores.sort((a, b) => b.score - a.score);
  const topBM25   = bm25Scores.slice(0, TOP_K_BM25);
  const bm25TimeMs = Date.now() - bm25Start;

  // ── RRF fusion ────────────────────────────────────────────────── //
  const vecRank  = new Map(topVec.map(({ idx }, r)  => [idx, r + 1]));
  const bm25Rank = new Map(topBM25.map(({ idx }, r) => [idx, r + 1]));
  const allIds   = new Set([...vecRank.keys(), ...bm25Rank.keys()]);

  const fused: { idx: number; fused: number; vec: number; bm25: number }[] = [];
  let   maxVec  = vecScores[0]?.score  ?? 1;
  let   maxBM25 = bm25Scores[0]?.score ?? 1;
  if (maxVec  === 0) maxVec  = 1;
  if (maxBM25 === 0) maxBM25 = 1;

  for (const idx of allIds) {
    const rv  = vecRank.get(idx)  ?? (TOP_K_VEC  + 1);
    const rb  = bm25Rank.get(idx) ?? (TOP_K_BM25 + 1);
    const vsc = vecScores.find((s) => s.idx === idx)?.score  ?? 0;
    const bsc = bm25Scores.find((s) => s.idx === idx)?.score ?? 0;
    fused.push({ idx, fused: rrf(rv, rb), vec: vsc / maxVec, bm25: bsc / maxBM25 });
  }
  fused.sort((a, b) => b.fused - a.fused);

  // ── MMR diversity (per-doc cap of 2) ─────────────────────────── //
  const docCount = new Map<string, number>();
  const diverse: typeof fused = [];
  for (const f of fused) {
    const doc = chunks[f.idx].docId;
    if ((docCount.get(doc) ?? 0) >= 2) continue;
    docCount.set(doc, (docCount.get(doc) ?? 0) + 1);
    diverse.push(f);
    if (diverse.length >= topN * 2) break;
  }

  const maxFused = diverse[0]?.fused ?? 1;
  const results: RetrievedChunk[] = diverse.slice(0, topN).map((f) => ({
    chunk:          chunks[f.idx],
    vectorScore:    f.vec,
    bm25Score:      f.bm25,
    fusedScore:     f.fused,
    retrievalScore: f.fused / (maxFused || 1),
  }));

  const bestScore = results[0]?.retrievalScore ?? 0;

  return {
    results,
    candidatesConsidered: eligible.length,
    bestScore,
    insufficient: bestScore < MIN_SCORE,
    vecTimeMs,
    bm25TimeMs,
  };
}
