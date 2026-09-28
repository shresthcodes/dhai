"use client";

import { useEffect, useState } from "react";

export type PerformanceTier = "high" | "low" | "none";

/* ─── usePerformanceTier ────────────────────────────────────────────────
   Detects device capability and user preferences.
   Returns:
     "high" — full 3D + postFX
     "low"  — reduced particles, no postFX
     "none" — skip WebGL entirely, render CSS fallback
──────────────────────────────────────────────────────────────────────── */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("high");

  useEffect(() => {
    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setTier("none");
      return;
    }

    // Mobile detection (rough)
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      setTier("low");
      return;
    }

    // WebGL capability check
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");

      if (!gl) {
        setTier("none");
        return;
      }

      // Check renderer for software/low-end GPUs
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
        const lowEndPatterns = /swiftshader|llvmpipe|software|mesa/i;
        if (lowEndPatterns.test(renderer)) {
          setTier("low");
          return;
        }
      }
    } catch {
      setTier("none");
      return;
    }

    setTier("high");
  }, []);

  return tier;
}
