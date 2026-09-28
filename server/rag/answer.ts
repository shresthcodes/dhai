/* ─── RAG Orchestrator ────────────────────────────────────────────────
   retrieve → gate → generate → validate → return
──────────────────────────────────────────────────────────────────── */
import { retrieve, detectLanguage, type RetrieveOptions } from "./retrieve";
import { buildContext, generateAnswer, getLLMProvider, getLLMModelId } from "./llm";
import { validateAnswer } from "./validate";
import { getEmbeddingModelId } from "./embeddings";
import type { RAGAnswer, RAGStage } from "./types";

interface AnswerOptions extends RetrieveOptions {
  question:   string;
  language?:  string;
  onStage?:   (stage: RAGStage, ms: number) => void;
  onToken?:   (token: string) => void;
}

export async function ragAnswer(opts: AnswerOptions): Promise<RAGAnswer> {
  const start      = Date.now();
  const timings: Record<string, number> = {};
  const mark       = (stage: RAGStage) => {
    const ms = Date.now() - start;
    timings[stage] = ms;
    opts.onStage?.(stage, ms);
    return ms;
  };

  mark("understanding");
  const lang = opts.language ?? detectLanguage(opts.question);

  // ── Retrieve ──────────────────────────────────────────────────── //
  mark("retrieving");
  const retrieval = await retrieve(opts.question, {
    topN:        5,
    includeDemo: true,   // include demo chunks when real corpus is empty
    langFilter:  opts.langFilter,
    docFilter:   opts.docFilter,
  });
  mark("ranking");

  if (retrieval.insufficient || retrieval.results.length === 0) {
    return {
      status:   "insufficient_evidence",
      answer:   "",
      sources:  retrieval.results,
      concepts: [],
      candidatesConsidered: retrieval.candidatesConsidered,
      chunksUsed: 0,
      mode:     "LIVE",
      embeddingModel: getEmbeddingModelId(),
      llmModel: getLLMModelId(),
      llmProvider: getLLMProvider(),
      latencyMs: Date.now() - start,
      stageTimings: timings,
      validation: "skipped",
      isDemo:   retrieval.results.every((r) => r.chunk.isDemo),
    };
  }

  // ── Build context ─────────────────────────────────────────────── //
  const context = buildContext(retrieval.results);

  // ── Generate ──────────────────────────────────────────────────── //
  mark("composing");
  let answerText   = "";
  let tokenCounts: { input: number; output: number } | undefined;
  let validation:  RAGAnswer["validation"] = "skipped";

  try {
    const gen = await generateAnswer(opts.question, context, lang, opts.onToken ?? (() => {}));
    answerText  = gen.text;
    tokenCounts = gen.tokenCounts;
  } catch (err) {
    console.error("[RAG] Generation error:", err instanceof Error ? err.message : "unknown");
    answerText = "INSUFFICIENT_EVIDENCE";
  }

  mark("citing");

  if (answerText.trim() === "INSUFFICIENT_EVIDENCE") {
    return {
      status:   "insufficient_evidence",
      answer:   "",
      sources:  retrieval.results,
      concepts: [],
      candidatesConsidered: retrieval.candidatesConsidered,
      chunksUsed: retrieval.results.length,
      mode:     "LIVE",
      embeddingModel: getEmbeddingModelId(),
      llmModel: getLLMModelId(),
      llmProvider: getLLMProvider(),
      latencyMs: Date.now() - start,
      stageTimings: timings,
      tokenCounts,
      validation: "skipped",
      isDemo: retrieval.results.every((r) => r.chunk.isDemo),
    };
  }

  // ── Validate citations ────────────────────────────────────────── //
  const v1 = validateAnswer(answerText, retrieval.results);
  if (v1.valid) {
    validation = "passed";
  } else {
    // One retry with stricter prompt
    try {
      const gen2 = await generateAnswer(
        opts.question + "\n\n[IMPORTANT: Every claim MUST have an inline [S#] citation. No uncited sentences.]",
        context,
        lang,
        () => {}
      );
      const v2 = validateAnswer(gen2.text, retrieval.results);
      if (v2.valid) {
        answerText = gen2.text;
        validation = "passed";
        // Re-stream the validated answer if callback provided
        if (opts.onToken) {
          for (const word of answerText.split(" ")) {
            opts.onToken(word + " ");
            await new Promise<void>((r) => setTimeout(r, 5));
          }
        }
      } else {
        // Fall back to extractive
        validation = "fallback_extractive";
        const { generateAnswer: gen3 } = await import("./llm");
        const ext  = await generateAnswer(opts.question, context, lang, opts.onToken ?? (() => {}));
        answerText = ext.text;
      }
    } catch {
      validation = "fallback_extractive";
    }
  }

  // ── Extract concepts ──────────────────────────────────────────── //
  const concepts = Array.from(new Set(
    retrieval.results.flatMap((r) =>
      r.chunk.text.toLowerCase().split(/\W+/).filter((w) => w.length > 4)
    )
  )).slice(0, 6);

  return {
    status:   "answered",
    answer:   answerText,
    sources:  retrieval.results,
    concepts,
    candidatesConsidered: retrieval.candidatesConsidered,
    chunksUsed: retrieval.results.length,
    mode:     "LIVE",
    embeddingModel: getEmbeddingModelId(),
    llmModel: getLLMModelId(),
    llmProvider: getLLMProvider(),
    latencyMs: Date.now() - start,
    stageTimings: timings,
    tokenCounts,
    validation,
    isDemo: retrieval.results.every((r) => r.chunk.isDemo),
  };
}
