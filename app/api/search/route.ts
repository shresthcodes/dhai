import { NextRequest, NextResponse } from "next/server";
import { retrieve } from "@/server/rag/retrieve";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { query?: string; language?: string; topN?: number };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const { query = "", language, topN = 10 } = body;
  if (!query.trim()) return NextResponse.json({ results: [], total: 0, query, queryTime: 0, concepts: [] });

  const start  = Date.now();
  const result = await retrieve(query, { topN, langFilter: language, includeDemo: true });
  const qTime  = Date.now() - start;

  const concepts = Array.from(new Set(
    result.results.flatMap((r) => r.chunk.text.toLowerCase().split(/\W+/).filter((w) => w.length > 4))
  )).slice(0, 5);

  return NextResponse.json({
    results:   result.results.map((r) => ({
      item: {
        id:         r.chunk.docId,
        title:      r.chunk.title,
        type:       r.chunk.type,
        language:   r.chunk.language,
        source:     r.chunk.source,
        summary:    r.chunk.text.slice(0, 200),
        keywords:   [],
        topic:      [],
        collection: r.chunk.source,
        isDemo:     r.chunk.isDemo,
      },
      score:         Math.round(r.retrievalScore * 100),
      matchedTerms:  [],
      reason:        `Retrieval score: ${Math.round(r.retrievalScore * 100)}%`,
    })),
    total:     result.results.length,
    query,
    queryTime: qTime,
    concepts,
  });
}
