import { NextResponse } from "next/server";
import { getIndexMeta } from "@/server/rag/store";
import { getLLMProvider, getLLMModelId } from "@/server/rag/llm";
import { getEmbeddingModelId } from "@/server/rag/embeddings";

export const dynamic = "force-dynamic";

export async function GET() {
  const meta = getIndexMeta();
  return NextResponse.json({
    indexReady:     !!meta,
    indexMeta:      meta ? {
      embeddingModel: meta.embeddingModel,
      docCount:       meta.docCount,
      chunkCount:     meta.chunkCount,
      builtAt:        meta.builtAt,
    } : null,
    llmProvider:    getLLMProvider(),
    llmModel:       getLLMModelId(),
    embeddingModel: getEmbeddingModelId(),
    // Keys configured (never their values)
    anthropicKeySet:   !!process.env.ANTHROPIC_API_KEY,
    ollamaUrlSet:      !!process.env.OLLAMA_URL,
    embeddingsKeySet:  !!process.env.EMBEDDINGS_API_KEY,
  });
}
