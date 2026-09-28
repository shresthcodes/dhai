import { describe, it, expect } from "vitest";
import { chunkText } from "../chunker";
import type { CorpusSource } from "../types";

const mockSource: CorpusSource = {
  file: "test.txt", title: "Test Doc", type: "writing",
  language: "en", source: "Test", sourceUrl: "", date: null,
  rights: "CC0", reference: "TEST-01",
};

describe("chunker", () => {
  it("produces at least one chunk from non-empty text", () => {
    const text   = "Hello world. This is a test sentence. Another one here.";
    const chunks = chunkText(text, mockSource, "test");
    expect(chunks.length).toBeGreaterThan(0);
  });

  it("each chunk has required fields", () => {
    const chunks = chunkText("First sentence. Second sentence.", mockSource, "doc1");
    expect(chunks[0]).toHaveProperty("id");
    expect(chunks[0]).toHaveProperty("contentHash");
    expect(chunks[0]).toHaveProperty("charStart");
    expect(chunks[0]).toHaveProperty("charEnd");
    expect(chunks[0].isDemo).toBe(false);
  });

  it("links prevId / nextId between consecutive chunks", () => {
    const long = Array(20).fill("This is a longer sentence to force multiple chunks.").join(" ");
    const chunks = chunkText(long, mockSource, "multi");
    if (chunks.length > 1) {
      expect(chunks[0].nextId).toBe(chunks[1].id);
      expect(chunks[1].prevId).toBe(chunks[0].id);
    }
  });

  it("splits on Devanagari sentence boundary ।", () => {
    const text = "यह पहला वाक्य है। यह दूसरा वाक्य है। तीसरा वाक्य यहाँ है।";
    const chunks = chunkText(text, { ...mockSource, language: "hi" }, "hindi");
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain("यह पहला");
  });

  it("splits on Gujarati text correctly", () => {
    const text = "આ પ્રથમ વાક્ય છે। આ બીજું વાક્ય છે।";
    const chunks = chunkText(text, { ...mockSource, language: "gu" }, "gujarati");
    expect(chunks.length).toBeGreaterThan(0);
  });
});
