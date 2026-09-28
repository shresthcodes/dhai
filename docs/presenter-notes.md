# DHAI Demo — Presenter Notes

## Before you start
- Open /demo in a browser tab
- Have a second tab open at the first step URL
- Shift+D opens the demo toolbar (reset, force-demo)
- If network/LLM is down: Force DEMO mode from the toolbar

---

## Step-by-step

### 01 Home
**Say:** "This is the web portal — a cinematic 3D archive experience with a museum-quality interface."
**PS requirement:** Digital museum + AI research platform (immersive web experience)
**Show:** Hero scene loading, floating parchment sheets, mouse parallax, then scroll to pipeline section

### 02 Smart Search
**Say:** "Search 'constitutional democracy' — the system uses hybrid semantic + keyword retrieval to find relevant records."
**PS requirement:** AI-powered discovery and intelligent search
**Show:** Type in search bar, watch semantic results appear with relevance bars. Click Knowledge Map tab.

### 03 Document Viewer
**Say:** "Every document has a scan viewer, extracted text via OCR, AI summary and metadata — all in one place."
**PS requirement:** Full-text access, OCR digitisation, provenance metadata
**Show:** Scan on left, click tabs Read/Summary/Metadata. Switch to OCR Lab, click Run OCR.

### 04 Ask the Archive
**Say:** "Ask a question. Watch the 5 stages — understanding → retrieval → ranking → composing → citing. Sources appear FIRST, before the answer."
**PS requirement:** Evidence-grounded AI research assistant with source citations
**Show:** Type "What archival material relates to constitutional debates?" → watch stages → sources appear → answer streams

### 05 Refusal Demo ← IMPORTANT FOR JUDGES
**Say:** "Ask something out of scope. The system refuses to answer rather than hallucinate."
**PS requirement:** Anti-hallucination mechanism
**Show:** Type "What is the cricket score?" → show the "Not enough evidence" state
**Judges ask:** "How do you prevent hallucination?" → Point to this screen.

### 06 Audio-Visual
**Say:** "The media player has synchronized transcripts and language switching."
**PS requirement:** Audio-video archival system for lectures and interviews
**Show:** Play button, click transcript lines to seek, switch to Translation tab

### 07 Timeline
**Say:** "An interactive 3D corridor through 13 key events — all flagged as seed data, pending official source verification."
**PS requirement:** Interactive historical timeline
**Show:** Scroll through corridor, click an event card, see Detail panel with verification chip

### 08 Story Mode
**Say:** "Five-chapter memorial story drawn from verified archival records. Chapter text is placeholder — narrative requires verified sources."
**PS requirement:** Memorial storytelling module
**Show:** Begin → navigate to Chapter 4 (Constitutional Journey), show key events list

### 09 My Collection
**Say:** "Save items across the archive into a personal research collection, then export as Markdown or citations."
**PS requirement:** Research compilation and access
**Show:** Show saved items, click Export Markdown, file downloads

### 10 Admin Portal
**Say:** "The institutional management layer: upload a scan, run OCR, validate, add metadata, approve, and publish to the public archive."
**PS requirement:** Institutional archival management, metadata, digital preservation
**Show:** /admin → Assets → Upload → OCR tab → Metadata → Review → Preservation → SHA-256 verify

### 11 Kiosk Mode
**Say:** "The same knowledge layer powers a touch-first museum kiosk — attract screen, language selection, large-target tiles."
**PS requirement:** Interactive touch-screen kiosk for museum/gallery
**Show:** /kiosk → touch/click attract → language chooser → home tiles → search with on-screen keyboard

### 12 Smart Display
**Say:** "And an auto-playing exhibition display for gallery walls — timeline events, archive spotlights, QR handoff."
**PS requirement:** Smart wall display for exhibitions
**Show:** /display → let it cycle through 2-3 scenes

### 13 Showcase
**Say:** "One knowledge layer powering four interfaces. This is the architecture claim: same data, same RAG, different experience layers."
**PS requirement:** Multi-platform digital heritage system
**Show:** /showcase → concept visual with 4 floating devices → click Screenshot mode

---

## Safe claims for Q&A

✅ "Hybrid retrieval: semantic embeddings + BM25 keyword search, merged with Reciprocal Rank Fusion"  
✅ "Citation validation: every [S#] is verified against the source text"  
✅ "Refusal when evidence is insufficient — demonstrated live"  
✅ "SHA-256 integrity verification via Web Crypto API — real, browser-native"  
✅ "OCR via Tesseract.js — real, runs in the browser"  
✅ "UI in English, Hindi, Gujarati — prototype quality, pending native review"  

❌ Never say: "99% accuracy", "hallucination-free", "encrypted", "certified", "deployed on hardware"
