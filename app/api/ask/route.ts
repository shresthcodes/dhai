/* ─── POST /api/ask — SSE streaming RAG endpoint ─────────────────────
   Emits: stage events → sources payload → answer tokens → done event.
   API keys never logged or returned to client.
──────────────────────────────────────────────────────────────────── */
import { NextRequest } from "next/server";
import { ragAnswer }   from "@/server/rag/answer";
import type { RAGStage } from "@/server/rag/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ─── Simple in-memory rate limiter ──────────────────────────────── */
const RATE_MAP  = new Map<string, { count: number; reset: number }>();
const RATE_MAX  = 20;
const RATE_WIN  = 60_000;

function checkRate(ip: string): boolean {
  const now    = Date.now();
  const bucket = RATE_MAP.get(ip) ?? { count: 0, reset: now + RATE_WIN };
  if (now > bucket.reset) { bucket.count = 0; bucket.reset = now + RATE_WIN; }
  bucket.count++;
  RATE_MAP.set(ip, bucket);
  return bucket.count <= RATE_MAX;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRate(ip)) {
    return new Response("Rate limit exceeded", { status: 429 });
  }

  let body: { question?: string; language?: string; docId?: string };
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }

  const { question = "", language = "en", docId } = body;
  if (!question.trim() || question.length > 2000) {
    return new Response("Question required (max 2000 chars)", { status: 400 });
  }

  const encoder = new TextEncoder();
  let   closed  = false;

  const stream = new ReadableStream({
    async start(ctrl) {
      function send(event: string, data: unknown) {
        if (closed) return;
        const line = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try { ctrl.enqueue(encoder.encode(line)); } catch { closed = true; }
      }

      try {
        const result = await ragAnswer({
          question,
          language,
          docFilter: docId,
          onStage: (stage: RAGStage, ms: number) => send("stage", { stage, ms }),
          onToken: (token: string)  => send("token", { token }),
        });

        // Send sources BEFORE answer content (already streamed via onToken,
        // but also emit as a structured event for the UI)
        send("sources", result.sources.map((r, i) => ({
          index:         i + 1,
          id:            `cite-${i + 1}`,
          title:         r.chunk.title,
          type:          r.chunk.type,
          docId:         r.chunk.docId,
          excerpt:       r.chunk.text.slice(0, 280),
          retrievalScore: Math.round(r.retrievalScore * 100),
          vectorScore:   Math.round(r.vectorScore  * 100),
          bm25Score:     Math.round(r.bm25Score    * 100),
          charStart:     r.chunk.charStart,
          charEnd:       r.chunk.charEnd,
          page:          r.chunk.page,
          segment:       r.chunk.segment,
          isDemo:        r.chunk.isDemo,
          pageRef:       r.chunk.page ? `Page ${r.chunk.page}` : "Reference to be verified",
        })));

        send("done", {
          status:               result.status,
          concepts:             result.concepts,
          candidatesConsidered: result.candidatesConsidered,
          chunksUsed:           result.chunksUsed,
          mode:                 result.mode,
          llmProvider:          result.llmProvider,
          llmModel:             result.llmModel,
          embeddingModel:       result.embeddingModel,
          latencyMs:            result.latencyMs,
          stageTimings:         result.stageTimings,
          tokenCounts:          result.tokenCounts,
          validation:           result.validation,
          isDemo:               result.isDemo,
          answer:               result.answer,
        });
      } catch (err) {
        console.error("[/api/ask] Error:", err instanceof Error ? err.message : "unknown");
        send("error", { message: "Internal error" });
      } finally {
        if (!closed) { closed = true; ctrl.close(); }
      }
    },
    cancel() { closed = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
