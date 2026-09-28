import fs   from "fs";
import path  from "path";
import type { Chunk, IndexMeta } from "./types";
import { getDims, getEmbeddingModelId } from "./embeddings";

const INDEX_DIR  = path.join(process.cwd(), "data", "index");
const META_FILE  = path.join(INDEX_DIR, "meta.json");
const CHUNKS_FILE= path.join(INDEX_DIR, "chunks.json");
const VECS_FILE  = path.join(INDEX_DIR, "vectors.bin");

let _chunks:  Chunk[]       | null = null;
let _vectors: Float32Array  | null = null;
let _meta:    IndexMeta     | null = null;

/* ─── Persist ─────────────────────────────────────────────────────── */
export function saveIndex(chunks: Chunk[], vectors: Float32Array[], meta: Omit<IndexMeta, "builtAt">) {
  fs.mkdirSync(INDEX_DIR, { recursive: true });
  const fullMeta: IndexMeta = { ...meta, builtAt: new Date().toISOString() };
  // Strip embeddings from JSON (stored separately)
  const stripped = chunks.map((c) => { const { embedding: _, ...rest } = c; return rest; });
  fs.writeFileSync(META_FILE,   JSON.stringify(fullMeta));
  fs.writeFileSync(CHUNKS_FILE, JSON.stringify(stripped));
  const dims  = meta.embeddingDims;
  const buf   = Buffer.alloc(chunks.length * dims * 4);
  vectors.forEach((v, ci) => {
    for (let d = 0; d < dims; d++) {
      buf.writeFloatLE(v[ci * dims + d] ?? 0, (ci * dims + d) * 4);
    }
  });
  // Flatten all vectors into one Float32Array
  const flat = new Float32Array(chunks.length * dims);
  vectors.forEach((v, i) => { flat.set(Array.from(v), i * dims); });
  fs.writeFileSync(VECS_FILE, Buffer.from(flat.buffer));
  _chunks = stripped as Chunk[]; _vectors = flat; _meta = fullMeta;
}

/* ─── Load ────────────────────────────────────────────────────────── */
export function loadIndex(): { chunks: Chunk[]; vectors: Float32Array; meta: IndexMeta } | null {
  if (_chunks && _vectors && _meta) return { chunks: _chunks, vectors: _vectors, meta: _meta };
  if (!fs.existsSync(META_FILE)) return null;
  try {
    const meta    = JSON.parse(fs.readFileSync(META_FILE, "utf8")) as IndexMeta;
    const current = getEmbeddingModelId();
    if (meta.embeddingModel !== current) {
      console.warn(`[RAG] Index built with ${meta.embeddingModel}, current ${current}. Rebuild with --rebuild.`);
      return null;
    }
    const chunks  = JSON.parse(fs.readFileSync(CHUNKS_FILE, "utf8")) as Chunk[];
    const rawBuf  = fs.readFileSync(VECS_FILE);
    const vectors = new Float32Array(rawBuf.buffer, rawBuf.byteOffset, rawBuf.length / 4);
    _chunks = chunks; _vectors = vectors; _meta = meta;
    return { chunks, vectors, meta };
  } catch (e) {
    console.error("[RAG] Failed to load index:", e);
    return null;
  }
}

/* ─── Cosine similarity ───────────────────────────────────────────── */
export function cosineSim(a: Float32Array, bOffset: number, vectors: Float32Array, dims: number): number {
  let dot = 0;
  for (let i = 0; i < dims; i++) dot += a[i] * vectors[bOffset + i];
  return Math.max(0, Math.min(1, dot)); // already L2-normalised
}

/* ─── Stats ───────────────────────────────────────────────────────── */
export function getIndexMeta(): IndexMeta | null {
  if (_meta) return _meta;
  if (!fs.existsSync(META_FILE)) return null;
  return JSON.parse(fs.readFileSync(META_FILE, "utf8")) as IndexMeta;
}

export function clearCache() {
  _chunks = null; _vectors = null; _meta = null;
}
