# DHAI — Claims Reference

**Use this file before every presentation to check what you can and cannot claim.**

> Status codes: ✅ IMPLEMENTED (works in prototype) · 🔵 DEMO (simulated with sample data) · 🗓 PLANNED (roadmap)

---

## Claim Table

| Problem-Statement Requirement | DHAI Module | Technology | Status | Evidence |
|---|---|---|---|---|
| Digital archive for writings, speeches, manuscripts, debates, photographs, audio-visual | /archive, /media | JSON data layer, real OCR (Tesseract.js) | ✅ IMPLEMENTED | /archive shows 16 demo records across all types |
| Full-text access and search | /search, /document | Hybrid BM25 + vector retrieval | ✅ IMPLEMENTED | /search?q=constitutional+democracy |
| OCR digitisation pipeline | /document → OCR Lab | Tesseract.js (browser) | ✅ IMPLEMENTED | /document/doc-001 → OCR Lab tab |
| AI-powered research assistant with citations | /ask | RAG: embeddings + LLM + citation validation | ✅ IMPLEMENTED | /ask — LIVE mode with keys, DEMO mode without |
| Evidence-grounded answers (no hallucination) | /ask | Retrieve-first RAG + refusal gate + citation validator | ✅ IMPLEMENTED | Out-of-scope question → "Not enough evidence" state |
| Audio-visual archive (lectures, documentaries) | /media | Custom video/audio player | ✅ IMPLEMENTED | /media, /media/av-001 |
| Synchronized transcript | /media/[id] | Timestamped transcript with click-to-seek | ✅ IMPLEMENTED | /media/av-001 → Transcript tab |
| Multilingual UI (EN/HI/GU) | All pages | Typed i18n dictionary | ✅ IMPLEMENTED | Language switcher in navbar |
| Interactive timeline | /timeline | 3D corridor + Classic mode | ✅ IMPLEMENTED | /timeline |
| Memorial story mode | /story | Scroll-driven 5-chapter experience | ✅ IMPLEMENTED | /story |
| Research collection / compilation | /collection | Zustand + localStorage, export MD/JSON/citations | ✅ IMPLEMENTED | /collection |
| Institutional archive management | /admin | Upload, OCR workflow, metadata, approval, publish | ✅ IMPLEMENTED | /admin (mock auth) |
| SHA-256 integrity verification | /admin/preservation | Web Crypto API | ✅ IMPLEMENTED | /admin/preservation → Verify integrity |
| Museum kiosk (touch-first) | /kiosk | On-screen keyboard, idle reset, 3 languages | ✅ IMPLEMENTED | /kiosk |
| Smart display / exhibition mode | /display | Auto-playing playlist, scene types | ✅ IMPLEMENTED | /display |
| Real semantic search (hybrid) | /search + /api/search | transformers.js + BM25 + RRF | ✅ IMPLEMENTED | Requires corpus + ingest; degrades to demo |
| Accessibility (text size, contrast, motion) | All pages | Zustand + CSS data-attributes | ✅ IMPLEMENTED | Accessibility panel in navbar |
| Translation (EN→HI/GU) | /document, /media | Machine translation (demo strings only) | 🔵 DEMO | "Machine translation — demo" label visible |
| Speech synthesis narration | /document, /timeline, /story, /media | Web Speech API | 🔵 DEMO | Device-dependent voice availability |
| OCR confidence + human validation | /admin/ocr, /document OCR Lab | Tesseract word confidence | 🔵 DEMO | Confidence values shown; vary by scan quality |
| Role-based access control (RBAC) | /admin | Client-side role matrix | 🔵 DEMO | "Client-side only" label in UI |
| Activity log (tamper-proof) | /admin/activity | localStorage, NOT tamper-proof | 🔵 DEMO | "Not tamper-proof" label in UI |
| Encryption at rest | — | NOT implemented | 🗓 PLANNED | — |
| Geo-redundant backup | — | NOT implemented | 🗓 PLANNED | — |
| Real server-side authentication | — | Mock only (no server session) | 🗓 PLANNED | — |
| Production PostgreSQL / S3 | — | File-backed index only | 🗓 PLANNED | — |
| Offline capability | — | Browser cache only; no service worker | 🗓 PLANNED | — |
| Hardware kiosk lockdown | — | OS-level (Chrome --kiosk) is PLANNED | 🗓 PLANNED | — |

---

## Safe Wording (per module)

### /ask
✅ Say: "Evidence-grounded AI research assistant. Retrieves sources first, answers only from them, cites inline, refuses when evidence is insufficient."  
❌ Don't say: "Hallucination-free", "99% accuracy", "trained on Ambedkar's works", "real AI"

### /admin
✅ Say: "Prototype institutional archive workflow: upload, OCR, metadata, approval, integrity verification (SHA-256 via Web Crypto)."  
❌ Don't say: "Secure backend", "encrypted storage", "audit-proof", "production-ready"

### OCR
✅ Say: "Real browser-based OCR via Tesseract.js with confidence scores and human validation workflow."  
❌ Don't say: "High accuracy OCR", "99% character accuracy" — accuracy depends on scan quality

### Multilingual
✅ Say: "UI available in English, Hindi and Gujarati (prototype quality, pending native review). Archive content translation is demo strings only."  
❌ Don't say: "Full archive in 3 languages", "machine translation of all archival content"

### RAG accuracy
✅ Say: "Retrieval accuracy not yet evaluated (no real corpus ingested). Eval harness is implemented; run `npm run eval` with real corpus for measured numbers."  
❌ Don't say any accuracy percentage until `npm run eval` produces a result

---

## Do Not Claim (ever)

- Military-grade encryption
- Tamper-proof audit logs
- ISO/OAIS compliance
- Certified accessibility (WCAG 2.1 AA)
- Offline deployment
- Hardware integration (kiosk lockdown, display hardware)
- Trained AI model (this is retrieval + grounding, not training)
- Any statistic not from a measured run in /eval/results/
