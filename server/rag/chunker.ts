import crypto from "crypto";
import type { Chunk, CorpusSource } from "./types";

const CHUNK_SIZE    = 400;   // tokens approx (chars / 4)
const CHUNK_OVERLAP = 60;

/* ─── Sentence boundary split ─────────────────────────────────────── */
function splitSentences(text: string): string[] {
  // Handles English '. ' and Indic '। ' boundaries
  return text.split(/(?<=[.!?।])\s+/).filter((s) => s.trim().length > 0);
}

/* ─── Build chunks from a single document ─────────────────────────── */
export function chunkText(
  text:   string,
  source: CorpusSource,
  docId:  string
): Chunk[] {
  const sentences   = splitSentences(text);
  const chunks: Chunk[] = [];
  let   buf         = "";
  let   bufStart    = 0;
  let   charCursor  = 0;
  let   chunkIndex  = 0;

  function flush(overlapSentences: string[]) {
    if (!buf.trim()) return;
    const id   = `${docId}_${chunkIndex}`;
    const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
    chunks.push({
      id,
      docId,
      title:       source.title,
      type:        source.type,
      language:    source.language,
      source:      source.source,
      sourceUrl:   source.sourceUrl ?? "",
      date:        source.date ?? null,
      page:        null,
      segment:     chunkIndex,
      text:        buf.trim(),
      charStart:   bufStart,
      charEnd:     bufStart + buf.length,
      chunkIndex,
      prevId:      chunkIndex > 0 ? `${docId}_${chunkIndex - 1}` : null,
      nextId:      null,
      isDemo:      false,
      contentHash: hash,
    });
    chunkIndex++;
    // Seed next chunk with overlap
    buf       = overlapSentences.join(" ") + " ";
    bufStart  = charCursor - buf.length;
  }

  let   sentBuf: string[] = [];

  for (const sent of sentences) {
    sentBuf.push(sent);
    buf        += sent + " ";
    charCursor += sent.length + 1;

    if (buf.length >= CHUNK_SIZE * 4) {
      // Keep last N chars worth of sentences for overlap
      const overlapChars = CHUNK_OVERLAP * 4;
      const overlapSents: string[] = [];
      let   overlapLen  = 0;
      for (let i = sentBuf.length - 1; i >= 0; i--) {
        overlapLen += sentBuf[i].length + 1;
        if (overlapLen > overlapChars) break;
        overlapSents.unshift(sentBuf[i]);
      }
      flush(overlapSents);
      sentBuf = [...overlapSents];
    }
  }
  if (buf.trim()) flush([]);

  // Set nextId pointers
  for (let i = 0; i < chunks.length - 1; i++) {
    chunks[i].nextId = chunks[i + 1].id;
  }
  return chunks;
}
