#!/usr/bin/env tsx
/* npm run shots — Playwright screenshot pack for SIH PPT */
import fs   from "fs";
import path from "path";

const BASE    = process.env.SHOTS_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "assets-out", "screenshots");

interface Shot {
  num:    string;
  route:  string;
  label:  string;
  vp:     { width: number; height: number };
  lang?:  string;
  setup?: string;  // description of setup actions
  slide?: string;
}

const SHOTS: Shot[] = [
  { num: "01", route: "/",                          label: "Home hero 3D",                             vp: { width: 1440, height: 900 } },
  { num: "02", route: "/#archive",                  label: "Home pipeline + Ask preview",             vp: { width: 1440, height: 900 } },
  { num: "03", route: "/search?q=constitutional+democracy", label: "Smart Search results",            vp: { width: 1440, height: 900 } },
  { num: "04", route: "/search?q=constitutional+democracy#map", label: "Search Knowledge Map",        vp: { width: 1440, height: 900 } },
  { num: "05", route: "/document/doc-001",           label: "Document viewer scan + summary",         vp: { width: 1440, height: 900 } },
  { num: "06", route: "/document/doc-001",           label: "OCR Lab side-by-side",                   vp: { width: 1440, height: 900 }, setup: "Switch to OCR Lab tab" },
  { num: "07", route: "/ask",                        label: "Ask — empty state",                       vp: { width: 1440, height: 900 } },
  { num: "08", route: "/ask",                        label: "Ask — answer with citations",             vp: { width: 1440, height: 900 }, setup: "Pre-fill question" },
  { num: "09", route: "/ask",                        label: "How DHAI answered + Retrieval Space",    vp: { width: 1440, height: 900 } },
  { num: "10", route: "/ask",                        label: "Insufficient evidence refusal",           vp: { width: 1440, height: 900 }, setup: "Out-of-scope question" },
  { num: "11", route: "/media",                      label: "Audio-Visual wall",                       vp: { width: 1440, height: 900 } },
  { num: "12", route: "/media/av-001",               label: "Media player with transcript",            vp: { width: 1440, height: 900 } },
  { num: "13", route: "/timeline",                   label: "Timeline immersive + detail panel",       vp: { width: 1440, height: 900 } },
  { num: "14", route: "/story",                      label: "Story Mode chapter view",                 vp: { width: 1440, height: 900 } },
  { num: "15", route: "/collection",                 label: "My Collection populated",                 vp: { width: 1440, height: 900 } },
  { num: "16", route: "/",                           label: "Home in Hindi",                           vp: { width: 1440, height: 900 }, lang: "hi" },
  { num: "17", route: "/document/doc-001",           label: "Document in Gujarati",                   vp: { width: 1440, height: 900 }, lang: "gu" },
  { num: "18", route: "/accessibility",              label: "Accessibility panel + high contrast",    vp: { width: 1440, height: 900 } },
  { num: "19", route: "/admin",                      label: "Admin overview",                          vp: { width: 1440, height: 900 } },
  { num: "20", route: "/admin/assets",               label: "Admin assets + checksum",                 vp: { width: 1440, height: 900 } },
  { num: "21", route: "/admin/ocr",                  label: "Admin OCR validation",                   vp: { width: 1440, height: 900 } },
  { num: "22", route: "/admin/metadata",             label: "Admin metadata + completeness",           vp: { width: 1440, height: 900 } },
  { num: "23", route: "/admin/preservation",         label: "Admin preservation + integrity",          vp: { width: 1440, height: 900 } },
  { num: "24", route: "/admin/rag",                  label: "Admin RAG playground",                   vp: { width: 1440, height: 900 } },
  { num: "25", route: "/eval/results",               label: "Eval results",                           vp: { width: 1440, height: 900 } },
  { num: "26", route: "/kiosk",                      label: "Kiosk attract screen",                   vp: { width: 1920, height: 1080 } },
  { num: "27", route: "/kiosk",                      label: "Kiosk home tiles",                       vp: { width: 1920, height: 1080 }, setup: "Touch to begin → language → home" },
  { num: "28", route: "/kiosk/search",               label: "Kiosk search + keyboard",                vp: { width: 1920, height: 1080 } },
  { num: "29", route: "/kiosk/ask",                  label: "Kiosk Ask + QR handoff",                 vp: { width: 1920, height: 1080 } },
  { num: "30", route: "/display",                    label: "Display chapter title scene",             vp: { width: 1920, height: 1080 } },
  { num: "31", route: "/display",                    label: "Display timeline highlight",              vp: { width: 1920, height: 1080 }, setup: "Wait for 2nd scene" },
  { num: "32", route: "/showcase",                   label: "Showcase concept visual",                 vp: { width: 1440, height: 900 } },
  { num: "33", route: "/",                           label: "Mobile Home",                             vp: { width: 390,  height: 844 } },
  { num: "34", route: "/search?q=equality",          label: "Mobile Search",                          vp: { width: 390,  height: 844 } },
  { num: "35", route: "/ask",                        label: "Mobile Ask",                              vp: { width: 390,  height: 844 } },
  { num: "36", route: "/document/doc-001",           label: "Mobile Document",                         vp: { width: 390,  height: 844 } },
];

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch();

  const manifest: object[] = [];

  for (const shot of SHOTS) {
    const page    = await browser.newPage({
      viewport: shot.vp,
      deviceScaleFactor: 2,
    });

    // Hide cursor
    await page.addStyleTag({ content: "* { cursor: none !important; }" });

    try {
      await page.goto(`${BASE}${shot.route}`, { waitUntil: "networkidle", timeout: 30000 });
      // Wait for fonts and animations to settle
      await page.waitForTimeout(2000);

      // Set language if needed
      if (shot.lang) {
        await page.evaluate((lang) => localStorage.setItem("dhai-language", JSON.stringify({ state: { language: lang }, version: 0 })), shot.lang);
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
      }

      const file = path.join(OUT_DIR, `${shot.num}-${shot.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`  ✓ ${shot.num} — ${shot.label}`);

      manifest.push({
        num:    shot.num,
        file:   path.basename(file),
        route:  shot.route,
        viewport: `${shot.vp.width}×${shot.vp.height}`,
        lang:   shot.lang ?? "en",
        label:  shot.label,
        date:   new Date().toISOString().slice(0, 10),
        setup:  shot.setup ?? null,
      });
    } catch (e) {
      console.error(`  ❌ ${shot.num} failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      await page.close();
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  await browser.close();
  console.log(`\n✅ ${manifest.length} screenshots saved to assets-out/screenshots/`);
  console.log(`   manifest.json written`);
}

run().catch((e) => { console.error(e); process.exit(1); });
