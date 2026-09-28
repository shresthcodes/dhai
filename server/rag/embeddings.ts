/* ─── Embedding Provider ──────────────────────────────────────────────
   'local'  — transformers.js (multilingual-e5-small), lazy singleton
   'hosted' — generic HTTP adapter via env
   Vectors are L2-normalised; cosine sim = dot product.
──────────────────────────────────────────────────────────────────── */

export type EmbeddingProvider = "local" | "hosted";

let   pipeline: ((text: string | string[], opts?: Record<string, unknown>) => Promise<{ data: Float32Array[] }>) | null = null;

function l2norm(v: Float32Array): Float32Array {
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm);
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = v[i] / (norm || 1);
  return out;
}

async function getLocalPipeline() {
  if (pipeline) return pipeline;
  const { pipeline: pipelineFn } = await import("@huggingface/transformers");
  const model = process.env.EMBEDDINGS_MODEL ?? "Xenova/multilingual-e5-small";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipeline = (await pipelineFn("feature-extraction", model, { dtype: "fp32" } as any)) as any;
  return pipeline!;
}

export async function embedQuery(text: string): Promise<Float32Array> {
  const provider = process.env.EMBEDDINGS_PROVIDER ?? "local";
  if (provider === "local") {
    const pipe   = await getLocalPipeline();
    const prefix = "query: ";
    const result = await pipe(prefix + text, { pooling: "mean", normalize: true });
    return l2norm(result.data[0]);
  }
  return embedHosted([text]).then((r) => r[0]);
}

export async function embedPassages(texts: string[]): Promise<Float32Array[]> {
  const provider = process.env.EMBEDDINGS_PROVIDER ?? "local";
  if (provider === "local") {
    const pipe    = await getLocalPipeline();
    const results = await Promise.all(
      texts.map((t) => pipe("passage: " + t, { pooling: "mean", normalize: true }))
    );
    return results.map((r) => l2norm(r.data[0]));
  }
  return embedHosted(texts);
}

async function embedHosted(texts: string[]): Promise<Float32Array[]> {
  const url   = process.env.EMBEDDINGS_API_URL ?? "";
  const key   = process.env.EMBEDDINGS_API_KEY ?? "";
  const model = process.env.EMBEDDINGS_MODEL   ?? "";
  if (!url || !key) throw new Error("EMBEDDINGS_API_URL and EMBEDDINGS_API_KEY required for hosted provider");
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body:    JSON.stringify({ model, input: texts }),
  });
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json() as { data: { embedding: number[] }[] };
  return data.data.map((d) => l2norm(new Float32Array(d.embedding)));
}

export function getEmbeddingModelId(): string {
  return process.env.EMBEDDINGS_MODEL ?? "Xenova/multilingual-e5-small";
}

export function getDims(): number {
  return 384; // multilingual-e5-small default; update for other models
}
