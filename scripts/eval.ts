#!/usr/bin/env tsx
async function runEvalScript() {
  const { runEval } = await import("../server/rag/eval");
  await runEval();
}
runEvalScript().catch((e) => { console.error(e); process.exit(1); });
