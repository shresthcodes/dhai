/* ─── SHA-256 via Web Crypto API ─────────────────────────────────────
   IMPLEMENTED in this prototype.
   Files are hashed client-side using the browser's native crypto.
────────────────────────────────────────────────────────────────── */

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256File(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return sha256Hex(buf);
}

export async function sha256String(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  return sha256Hex(buf.buffer);
}

/* ─── Verify stored hex vs re-computed ───────────────────────────── */
export async function verifyChecksum(
  data: ArrayBuffer,
  storedHex: string
): Promise<{ match: boolean; computed: string }> {
  const computed = await sha256Hex(data);
  return { match: computed === storedHex, computed };
}
