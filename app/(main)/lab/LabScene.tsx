"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "@/lib/performance";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { MuseumLighting } from "@/components/three/MuseumLighting";
import { DustParticles } from "@/components/three/DustParticles";
import { OrbitControls } from "@react-three/drei";

// PostFX and ParchmentPlane dynamic import so they don't block SSR
const PostFX = dynamic(
  () => import("@/components/three/PostFX").then((m) => ({ default: m.PostFX })),
  { ssr: false }
);

const ParchmentPlane = dynamic(
  () => import("@/components/three/ParchmentPlane").then((m) => ({ default: m.ParchmentPlane })),
  { ssr: false }
);

function SceneFallback({ tier }: { tier: string }) {
  return (
    <div className="h-[60vh] flex items-center justify-center bg-panel rounded-card border border-[rgba(244,237,224,0.08)] mx-6">
      <div className="text-center space-y-3">
        <div className="eyebrow text-ivory/30">WebGL not available</div>
        <p className="font-sans text-caption text-ivory/20">
          Performance tier: <span className="text-gold/50">{tier}</span>.
          Showing CSS fallback.
        </p>
      </div>
    </div>
  );
}

export function LabScene() {
  const tier = usePerformanceTier();

  if (tier === "none") {
    return <SceneFallback tier={tier} />;
  }

  return (
    <div className="mx-6 h-[65vh] rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]">
      <SceneCanvas>
        <MuseumLighting />
        <DustParticles count={tier === "high" ? 280 : 120} />
        <ParchmentPlane />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.6}
          autoRotate={false}
        />
        {(tier === "high" || tier === "low") && <PostFX tier={tier} />}
      </SceneCanvas>

      {/* Tier badge */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <span className="eyebrow text-gold/40 text-[0.6rem]">
          GPU tier: {tier}
        </span>
      </div>
    </div>
  );
}
