import type { Metadata } from "next";
import { LabScene } from "./LabScene";

export const metadata: Metadata = { title: "Lab — Engine Verification" };

export default function LabPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <div className="px-6 py-10 max-w-2xl">
        <p className="eyebrow text-gold/70 mb-3">Engine Lab</p>
        <h1 className="font-serif text-h1 text-ivory mb-3">3D Engine Verification</h1>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent opacity-70 mb-4" />
        <p className="font-sans text-body text-ivory/50">
          This route verifies the WebGL scene infrastructure: lighting, dust particles,
          post-processing and performance tier detection. Not a final experience.
        </p>
      </div>

      {/* 3D Scene */}
      <LabScene />
    </div>
  );
}
