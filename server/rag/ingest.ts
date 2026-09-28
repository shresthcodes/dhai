/* ─── Ingestion Pipeline ──────────────────────────────────────────────
   Run with: npm run ingest
   Reads /corpus/sources.csv + files, chunks, embeds, saves index.
──────────────────────────────────────────────────────────────────── */
import fs    from "fs";
import path  from "path";
import crypto from "crypto";
import type { CorpusSource, Chunk } from "./types";
import { chunkText }         from "./chunker";
import { embedPassages, getEmbeddingModelId, getDims } from "./embeddings";
import { saveIndex }         from "./store";

const CORPUS_DIR = path.join(process.cwd(), "corpus");
const CSV_PATH   = path.join(CORPUS_DIR, "sources.csv");

/* ─── Parse sources.csv ───────────────────────────────────────────── */
function parseCsv(csvText: string): CorpusSource[] {
  const lines  = csvText.trim().split("\n");
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return {
      file:       obj.file,
      title:      obj.title,
      type:       obj.type,
      language:   obj.language,
      source:     obj.source,
      sourceUrl:  obj.sourceUrl ?? "",
      date:       obj.date || null,
      rights:     obj.rights,
      reference:  obj.reference,
    } satisfies CorpusSource;
  });
}

/* ─── Read text from file ─────────────────────────────────────────── */
async function readFileText(filePath: string, mime: string): Promise<string | null> {
  if (!fs.existsSync(filePath)) return null;
  if (mime === "pdf" || filePath.endsWith(".pdf")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
      const pdfParse = (require("pdf-parse") as any).default ?? (require("pdf-parse") as any);
      const buf  = fs.readFileSync(filePath);
      const data = await pdfParse(buf);
      if (!data.text.trim()) { console.warn(`[ingest] ${filePath}: no text layer, needs OCR`); return null; }
      return data.text;
    } catch (e) {
      console.warn(`[ingest] PDF parse failed: ${filePath}`, e);
      return null;
    }
  }
  return fs.readFileSync(filePath, "utf8");
}

/* ─── Main ────────────────────────────────────────────────────────── */
export async function runIngest(rebuild = false): Promise<void> {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("[ingest] corpus/sources.csv not found. See corpus/PLACEHOLDER_README.txt");
    process.exit(1);
  }

  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  const sources = parseCsv(csvText);

  // Validate all entries have rights
  for (const s of sources) {
    if (!s.rights) {
      console.error(`[ingest] ABORT: missing rights for file "${s.file}". Add rights to sources.csv.`);
      process.exit(1);
    }
    if (s.file === "PLACEHOLDER_README.txt") continue; // skip template row
  }

  const allChunks:     Chunk[]       = [];
  const allEmbeddings: Float32Array[] = [];
  let   docCount = 0;

  for (const src of sources) {
    if (src.file === "PLACEHOLDER_README.txt") continue;
    const filePath = path.join(CORPUS_DIR, src.file);
    const text     = await readFileText(filePath, path.extname(src.file).slice(1));
    if (!text) { console.warn(`[ingest] Skipping ${src.file} (no text)`); continue; }

    const docId  = src.file.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const chunks = chunkText(text, src, docId);

    // Embed all chunks for this doc
    const texts   = chunks.map((c) => c.text);
    const vecs    = await embedPassages(texts);

    chunks.forEach((c, i) => { allChunks.push(c); allEmbeddings.push(vecs[i]); });
    docCount++;
    console.log(`[ingest] ✓ ${src.file} → ${chunks.length} chunks`);
  }

  if (allChunks.length === 0) {
    console.warn("[ingest] No chunks produced. Add real corpus files to /corpus/.");
  }

  // Flatten embeddings
  const dims    = getDims();
  const flatVec = new Float32Array(allChunks.length * dims);
  allEmbeddings.forEach((v, i) => flatVec.set(Array.from(v), i * dims));

  saveIndex(allChunks, Array.from(allEmbeddings), {
    embeddingModel: getEmbeddingModelId(),
    embeddingDims:  dims,
    chunkSize:      400,
    chunkOverlap:   60,
    docCount,
    chunkCount:     allChunks.length,
  });

  console.log(`\n[ingest] Done. ${docCount} docs, ${allChunks.length} chunks, model: ${getEmbeddingModelId()}`);
}

/* ─── Stats only ──────────────────────────────────────────────────── */
export async function printStats(): Promise<void> {
  const { loadIndex } = await import("./store");
  const idx = loadIndex();
  if (!idx) { console.log("[ingest] No index found. Run npm run ingest first."); return; }
  const { chunks, meta } = idx;
  const byLang = chunks.reduce<Record<string, number>>((a, c) => { a[c.language] = (a[c.language] ?? 0) + 1; return a; }, {});
  const avgLen = chunks.reduce((a, c) => a + c.text.length, 0) / (chunks.length || 1);
  console.log(`Index built:      ${meta.builtAt}`);
  console.log(`Embedding model:  ${meta.embeddingModel}`);
  console.log(`Documents:        ${meta.docCount}`);
  console.log(`Chunks:           ${meta.chunkCount}`);
  console.log(`Avg chunk length: ${avgLen.toFixed(0)} chars`);
  console.log(`Languages:        ${JSON.stringify(byLang)}`);
}
