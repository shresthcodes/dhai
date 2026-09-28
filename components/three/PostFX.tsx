"use client";

import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { PerformanceTier } from "@/lib/performance";

interface PostFXProps {
  tier?: PerformanceTier;
}

/* ─── PostFX ────────────────────────────────────────────────────────────
   Very restrained post-processing:
   - Subtle bloom on bright gold surfaces
   - Soft vignette for museum-frame feel
   - Gentle depth of field (high tier only)

   'low' tier = bloom + vignette only, no DoF.
   'none' tier = skip entirely (caller should not render this).
──────────────────────────────────────────────────────────────────────── */
export function PostFX({ tier = "high" }: PostFXProps) {
  if (tier === "none") return null;

  if (tier === "high") {
    return (
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.18}
          luminanceThreshold={0.82}
          luminanceSmoothing={0.6}
          blendFunction={BlendFunction.ADD}
        />
        <Vignette
          offset={0.5}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.06}
          bokehScale={1.4}
          height={480}
        />
      </EffectComposer>
    );
  }

  // tier === "low"
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.18}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.6}
        blendFunction={BlendFunction.ADD}
      />
      <Vignette
        offset={0.5}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
