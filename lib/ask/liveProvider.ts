/* ─── LIVE Provider ───────────────────────────────────────────────────
   Calls /api/ask (SSE) and maps events to the existing AskResult type.
   Activate: NEXT_PUBLIC_ASK_MODE=live in .env.local
──────────────────────────────────────────────────────────────────── */
import type {
  AskProvider, AskInput, AskResult, AskStage,
  AnswerBlock, SourceCitation, RetrievalMeta,
} from "./types";
import type { ArchiveItemType } from "@/data/models";

/* ─── SSE helper types ────────────────────────────────────────────── */
interface DonePayload {
  status:               string;
  concepts:             string[];
  candidatesConsidered: number;
  chunksUsed:           number;
  mode:                 string;
  llmProvider:          string;
  llmModel:             string;
  embeddingModel:       string;
  latencyMs:            number;
  stageTimings:         Record<string, number>;
  tokenCounts?:         { input: number; output: number };
  validation:           string;
  isDemo:               boolean;
  answer:               string;
}

interface RawSource {
  index:          number;
  id:             string;
  title:          string;
  type:           string;
  docId:          string;
  excerpt:        string;
  retrievalScore: number;
  pageRef:        string;
  isDemo:         boolean;
}

export const liveProvider: AskProvider = {
  async ask({ question, language, docId, onStage }: AskInput): Promise<AskResult> {
    const t0 = Date.now();

    const res = await fetch("/api/ask", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ question, language, docId }),
      signal:  AbortSignal.timeout(55_000),
    });

    if (!res.ok || !res.body) {
      throw new Error(`/api/ask returned ${res.status}`);
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf     = "";

    let sources:     SourceCitation[]  = [];
    let answerText   = "";
    let donePayload: DonePayload | null = null;

    function parseSSE(chunk: string) {
      buf += chunk;
      const parts = buf.split("\n\n");
      buf = parts.pop() ?? "";

      for (const part of parts) {
        const eventLine = part.match(/^event: (.+)$/m)?.[1];
        const dataLine  = part.match(/^data: (.+)$/m)?.[1];
        if (!eventLine || !dataLine) continue;

        try {
          const data = JSON.parse(dataLine) as unknown;
          if (eventLine === "stage") {
            const d = data as { stage: AskStage };
            onStage?.(d.stage);
          }
          if (eventLine === "token") {
            const d = data as { token: string };
            answerText += d.token;
          }
          if (eventLine === "sources" && Array.isArray(data)) {
            sources = (data as RawSource[]).map((s) => ({
              id:             s.id,
              title:          s.title,
              type:           s.type as ArchiveItemType,
              docId:          s.docId,
              excerpt:        s.excerpt,
              retrievalScore: s.retrievalScore,
              pageRef:        s.pageRef,
            }));
          }
          if (eventLine === "done") {
            donePayload = data as DonePayload;
          }
        } catch { /* skip malformed */ }
      }
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parseSSE(decoder.decode(value));
    }

    if (!donePayload) throw new Error("Stream ended without done event");

    // Capture as typed local to avoid 'never' inference after null guard
    const dp: DonePayload = donePayload;
    const isInsufficient = dp.status === "insufficient_evidence";

    const blocks: AnswerBlock[] = isInsufficient ? [] : [
      { type: "paragraph",   text: answerText },
      { type: "disclaimer",  text: `LIVE — ${dp.llmProvider} / ${dp.llmModel}` +
        (dp.validation === "passed" ? " · Citations verified." : ` · ${dp.validation}`) },
    ];

    const retrieval: RetrievalMeta = {
      query:                question,
      concepts:             dp.concepts ?? [],
      candidatesConsidered: dp.candidatesConsidered ?? 0,
      used:                 dp.chunksUsed ?? sources.length,
    };

    return {
      status:    isInsufficient ? "insufficient_evidence" : "answered",
      answer:    { blocks },
      sources,
      retrieval,
      meta: {
        mode:      "LIVE",
        latencyMs: Date.now() - t0,
      },
    };
  },
};
