#!/usr/bin/env tsx
const args    = process.argv.slice(2);
const rebuild = args.includes("--rebuild");
const stats   = args.includes("--stats");

async function runIngestScript() {
  if (stats) {
    const { printStats } = await import("../server/rag/ingest");
    await printStats();
  } else {
    const { runIngest } = await import("../server/rag/ingest");
    await runIngest(rebuild);
  }
}

runIngestScript().catch((e) => { console.error(e); process.exit(1); });
