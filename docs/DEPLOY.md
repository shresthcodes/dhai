# DHAI — Deployment Guide

## Quick Deploy to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "DHAI SIH2026 prototype"
git remote add origin https://github.com/YOUR_USERNAME/dhai.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: leave blank (project root)

### Step 3 — Environment Variables (Vercel Dashboard → Settings → Environment Variables)
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...          # Server-only
ANTHROPIC_MODEL=claude-opus-4-5
EMBEDDINGS_PROVIDER=hosted            # Use hosted for Vercel (avoid local model cold-start)
EMBEDDINGS_API_URL=...                # Your embeddings endpoint
EMBEDDINGS_API_KEY=...                # Server-only
NEXT_PUBLIC_ASK_MODE=live
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
RAG_RELEVANCE_THRESHOLD=0.25
```

### Step 4 — Run Ingest (LOCAL, before deploy)
```bash
# Add corpus files to /corpus/ with sources.csv rows
npm run ingest
# This builds /data/index/ — commit it or upload to object storage
git add data/index/
git commit -m "Add RAG index"
git push
```

### Step 5 — Deploy
Vercel will auto-deploy on push. First deploy takes ~3–5 minutes.

### Step 6 — Verify
1. Open `https://your-project.vercel.app/status`
   - Should show mode: LIVE, index ready: Yes
2. Open `/ask` and ask: "What is in the archive about constitutional debates?"
   - Should produce a cited answer (not DEMO_SCRIPTED)
3. Ask an out-of-scope question: "What is the cricket score?"
   - Should produce "Not enough evidence" refusal

### Step 7 — Generate QR Codes
```bash
# Set NEXT_PUBLIC_SITE_URL in .env.local first
npm run qr
# Opens /assets-out/qr/ with printable QR codes
```

---

## Pre-Launch Checklist

- [ ] Anthropic console → monthly spend limit set
- [ ] API keys rotated after testing (don't use dev keys in production)
- [ ] NEXT_PUBLIC_SITE_URL set to real deployed URL (not localhost)
- [ ] Corpus rights verified — every file in sources.csv has a rights entry
- [ ] Timeline 13 events verified against primary sources or flagged as "seed"
- [ ] Hindi/Gujarati translations reviewed by native speaker or flagged
- [ ] Real story narrative and images added (or "placeholder" notice shown)
- [ ] /admin/login tested with all 4 roles
- [ ] /kiosk tested on a real touch device or tablet
- [ ] /display fullscreen tested at 1920×1080
- [ ] QR code scanned from a real phone (localhost QR = useless)
- [ ] Demo tour at /demo run end-to-end by a presenter
- [ ] Shift+D demo toolbar tested (reset, force-demo)
- [ ] npm run eval completed with real eval questions

---

## Serverless RAG Notes

**Local embeddings (transformers.js) on Vercel:**
- The embedding model (~100MB) is loaded at runtime
- Cold starts may be slow (10–30s first request)
- Vercel's free tier has a 50MB function limit — local model will NOT work
- Solution: use `EMBEDDINGS_PROVIDER=hosted` with a small API endpoint

**Index shipping:**
- Run `npm run ingest` locally → commit `/data/index/` → ships with deployment
- Alternative: store index in Vercel Blob or S3; implement the storage adapter interface

**CRITICAL:** The query embedding model MUST match the index embedding model.
The app refuses to serve LIVE answers if the model IDs don't match (checked in /api/health).

---

## Running as a Real Kiosk

To lock Chrome to kiosk mode on a physical device:
```bash
# Windows
chrome.exe --kiosk --no-first-run --disable-pinch https://your-url.com/kiosk

# Linux
google-chrome --kiosk https://your-url.com/kiosk

# Raspberry Pi / Ubuntu
chromium-browser --kiosk https://your-url.com/kiosk
```

Additional OS-level steps (PLANNED, not implemented in app code):
- Disable keyboard shortcuts (Win key, Alt+F4, Ctrl+Alt+Del)
- Auto-start Chrome on boot
- Set up a watchdog to restart the browser if it crashes
- Disable screensaver and sleep

The DHAI app itself does not enforce these — it provides the software layer only.
