# DHAI — Known Limitations

Honest list for the presentation. Every item here is intentional — the architecture is designed to address these in Phase 4.

## Data & Content
- All archival content is **placeholder demo data**. No real verified documents are in the demo archive.
- Timeline events are **seed data** — 13 events require verification against primary sources before public use.
- Story narrative is **placeholder** — "Chapter narrative to be written from verified sources."
- Hindi and Gujarati translations are **prototype quality** and require native speaker review.
- OCR output quality **varies by scan quality** — the demo uses a synthetic SVG scan.

## AI / RAG
- RAG accuracy is **not yet measured** — no real corpus has been ingested. Run `npm run eval` with real corpus.
- Local embedding model (transformers.js) may cause **cold-start delays** on serverless (Vercel). Use hosted embeddings for production.
- The system does **not prevent all hallucinations** — it prevents them by design (retrieve-first + validation), but edge cases exist.
- Hindi/Gujarati cross-lingual retrieval **quality is model-dependent** — not measured.

## Authentication & Security
- Admin portal uses **mock authentication** — no server session, no real security.
- Rate limiting is **in-memory** — unreliable on serverless instances. Upstash Redis adapter is PLANNED.
- No **encryption at rest** — files and data are stored in the browser (localStorage/IndexedDB).
- Activity log is **not tamper-proof** — stored locally, can be cleared.

## Deployment
- **Local embeddings cannot be used on Vercel's free tier** (bundle size + cold start). Use `EMBEDDINGS_PROVIDER=hosted`.
- No **offline capability** — requires network for LLM calls.
- No **real kiosk lockdown** — browser cannot be OS-locked. Chrome `--kiosk` flag is a deployment step.

## Accessibility
- 3D scenes provide a **2D fallback** but are not screen-reader accessible.
- **WCAG 2.1 AA compliance is not certified** — features are implemented but no formal audit has been done.
- TTS narration depends on **device-installed voices** — Hindi/Gujarati may not be available on all systems.

## Scale
- Data layer is **client-side JSON** — not suitable for lakhon (hundreds of thousands) of documents without a server-side database.
- Admin portal stores data in **localStorage** — limited to ~5MB, clears on browser data reset.
