/* ─── Citation Validator ──────────────────────────────────────────────
   Checks:
   (a) every [S#] refers to a provided source (1..N)
   (b) every quoted string "..." appears verbatim in the cited source
──────────────────────────────────────────────────────────────────── */
import type { RetrievedChunk } from "./types";

export interface ValidationResult {
  valid:    boolean;
  errors:   string[];
}

function normalise(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

export function validateAnswer(answer: string, sources: RetrievedChunk[]): ValidationResult {
  const errors: string[] = [];
  const N = sources.length;

  // ── (a) Citation references ──────────────────────────────────── //
  const citationRe = /\[S(\d+)\]/g;
  let   m: RegExpExecArray | null;
  const foundRefs = new Set<number>();
  while ((m = citationRe.exec(answer)) !== null) {
    const n = parseInt(m[1]);
    if (n < 1 || n > N) {
      errors.push(`[S${n}] references a source that does not exist (only S1..S${N} provided).`);
    }
    foundRefs.add(n);
  }

  // ── (b) Verbatim quote check ─────────────────────────────────── //
  const quoteRe = /"([^"]{10,}?)"\s*\[S(\d+)\]/g;
  while ((m = quoteRe.exec(answer)) !== null) {
    const quote  = normalise(m[1]);
    const srcIdx = parseInt(m[2]) - 1;
    if (srcIdx < 0 || srcIdx >= N) continue; // already caught above
    const srcText = normalise(sources[srcIdx].chunk.text);
    if (!srcText.includes(quote)) {
      errors.push(`Quoted text "${m[1].slice(0, 60)}…" not found verbatim in [S${m[2]}].`);
    }
  }

  // ── (c) INSUFFICIENT_EVIDENCE token check ────────────────────── //
  if (answer.includes("INSUFFICIENT_EVIDENCE") && answer.trim() !== "INSUFFICIENT_EVIDENCE") {
    // The model emitted INSUFFICIENT_EVIDENCE mid-answer — treat as failure
    errors.push("Model emitted INSUFFICIENT_EVIDENCE mixed with answer text.");
  }

  return { valid: errors.length === 0, errors };
}
