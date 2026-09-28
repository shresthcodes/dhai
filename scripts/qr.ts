#!/usr/bin/env tsx
/* npm run qr — generates QR codes for the deployed URL */
import fs   from "fs";
import path from "path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

if (!SITE_URL || SITE_URL.includes("localhost")) {
  console.error([
    "",
    "❌  Cannot generate final QR codes.",
    "    NEXT_PUBLIC_SITE_URL is missing or points to localhost.",
    "    Localhost QR codes are useless for judges.",
    "    Set NEXT_PUBLIC_SITE_URL=https://your-deployed-url.com in .env.local",
    "    and run: npx dotenv -e .env.local -- npm run qr",
    "",
  ].join("\n"));
  process.exit(1);
}

const LINKS: { path: string; label: string }[] = [
  { path: "/",      label: "Home" },
  { path: "/demo",  label: "Demo Tour" },
  { path: "/ask",   label: "Ask the Archive" },
  { path: "/kiosk", label: "Kiosk Mode" },
];

async function generateQR(url: string, outPath: string) {
  const QRCode = await import("qrcode");
  const svg    = await QRCode.toString(url, { type: "svg",   margin: 4, errorCorrectionLevel: "M", width: 400 });
  const png    = await QRCode.toBuffer(url,  { type: "png",  margin: 4, errorCorrectionLevel: "M", width: 1200 });
  const svgPath = outPath.replace(".png", ".svg");
  fs.writeFileSync(svgPath, svg);
  fs.writeFileSync(outPath, png);
  console.log(`  ✓ ${outPath}`);

  // Verify by printing the encoded URL (canvas optional for full decode check)
  console.log(`  ℹ  Encoded URL: ${url}`);
  // Install 'canvas' package and uncomment below for full QR decode verification:
  // npm install canvas @types/canvas
  // const { createCanvas, loadImage } = await import("canvas");
  // const jsQR = (await import("jsqr")).default;
  // ...decode and compare...
}

async function run() {
  const outDir = path.join(process.cwd(), "assets-out", "qr");
  const pubDir = path.join(process.cwd(), "public", "qr");
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(pubDir, { recursive: true });

  console.log(`\n📱 Generating QR codes for ${SITE_URL}\n`);

  for (const link of LINKS) {
    const url       = `${SITE_URL}${link.path}`;
    const slug      = link.label.toLowerCase().replace(/\s+/g, "-");
    const outFile   = path.join(outDir, `${slug}.png`);
    const pubFile   = path.join(pubDir, `${slug}.png`);
    await generateQR(url, outFile);
    fs.copyFileSync(outFile, pubFile);
  }

  console.log(`\n✅ QR codes saved to assets-out/qr/ and public/qr/`);
  console.log(`\nAdd NEXT_PUBLIC_SITE_URL to .env.local, then run:\n  npx dotenv -e .env.local -- npm run qr\n`);
}

run().catch((e) => { console.error(e); process.exit(1); });
