"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { cn } from "@/lib/utils";

interface SceneCanvasProps {
  children: React.ReactNode;
  className?: string;
}

function SceneLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        {/* Elegant gold spinner */}
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          className="animate-spin"
          aria-hidden="true"
        >
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke="rgba(201,162,75,0.15)"
            strokeWidth="1.5"
          />
          <path
            d="M 18 3 A 15 15 0 0 1 33 18"
            fill="none"
            stroke="#C9A24B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="eyebrow text-ivory/30">Loading scene</span>
      </div>
    </div>
  );
}

export function SceneCanvas({ children, className }: SceneCanvasProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          dpr={[1, 1.75]}
          gl={{
            antialias:     true,
            toneMapping:   ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
          }}
          shadows
          camera={{ position: [0, 0, 6], fov: 45 }}
          aria-label="3D scene"
          role="img"
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
