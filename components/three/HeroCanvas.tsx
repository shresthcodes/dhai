"use client";

import React, { useRef, useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace, TextureLoader } from "three";
import type * as THREE from "three";
import { MuseumLighting }    from "./MuseumLighting";
import { DustParticles }     from "./DustParticles";
import { usePerformanceTier } from "@/lib/performance";
import type { PerformanceTier } from "@/lib/performance";

/* Dynamic imports — never run on server */
const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => ({ default: m.HeroScene })),
  { ssr: false }
);
const PostFX = dynamic(
  () => import("./PostFX").then((m) => ({ default: m.PostFX })),
  { ssr: false }
);

/* ─── Safe texture loader ────────────────────────────────────────────
   Uses THREE.TextureLoader directly with onLoad/onError callbacks.
   Never throws. Returns null if the image 404s or fails.
──────────────────────────────────────────────────────────────────── */
function useSafeTexture(path: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(
      path,
      (loaded) => setTex(loaded),
      undefined,         // onProgress — not needed
      (_err) => {        // onError — silently ignore missing images
        setTex(null);
      }
    );
  }, [path]);

  return tex;
}

/* ─── CSS Hero Fallback ──────────────────────────────────────────── */
function CssHeroFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 62% 40%, rgba(201,162,75,0.08) 0%, rgba(16,20,28,0.5) 60%, #0B0D12 100%)",
      }}
      aria-hidden="true"
    >
      {[
        { top: "14%", left: "54%", w: 160, h: 210, rot: -4, op: 0.14, delay: "0s"   },
        { top: "30%", left: "70%", w: 120, h: 160, rot:  3, op: 0.10, delay: "1.2s" },
        { top: "52%", left: "47%", w: 100, h: 140, rot: -2, op: 0.08, delay: "2.1s" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top, left: s.left,
            width: s.w, height: s.h,
            background: "linear-gradient(135deg, #E8DCC3 0%, #D4C9B0 100%)",
            opacity: s.op,
            transform: `rotate(${s.rot}deg)`,
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            animation: `dustDrift ${5 + i * 1.5}s ease-in-out infinite alternate`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Canvas scene ──────────────────────────────────────────────── */
function Scene({
  tier, scrollY, mouseX, mouseY,
}: {
  tier:    PerformanceTier;
  scrollY: React.MutableRefObject<number>;
  mouseX:  React.MutableRefObject<number>;
  mouseY:  React.MutableRefObject<number>;
}) {
  /* Load textures safely — null if 404 */
  const paperTex   = useSafeTexture("/images/paper-texture.jpg");
  const portraitTex = useSafeTexture("/images/hero-portrait.jpg");

  return (
    <>
      <MuseumLighting />
      <DustParticles count={tier === "high" ? 200 : 70} />
      <HeroScene
        tier={tier}
        scrollY={scrollY}
        mouseX={mouseX}
        mouseY={mouseY}
        paperTex={paperTex}
        portraitTex={portraitTex}
      />
      {(tier === "high" || tier === "low") && <PostFX tier={tier} />}
    </>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
export function HeroCanvas({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  const tier   = usePerformanceTier();
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouseX.current = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (tier === "none") return <CssHeroFallback />;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Suspense fallback={<CssHeroFallback />}>
        <Canvas
          dpr={[1, tier === "high" ? 1.75 : 1.25]}
          gl={{
            antialias:        tier === "high",
            toneMapping:      ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
            powerPreference:  "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          shadows={tier === "high"}
          camera={{ position: [0, 0.5, 9.5], fov: 50 }}
          frameloop="always"
          onCreated={({ gl }) => {
            /* Prevent context-loss crash from propagating */
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
            }, false);
          }}
        >
          <Scene tier={tier} scrollY={scrollY} mouseX={mouseX} mouseY={mouseY} />
        </Canvas>
      </Suspense>
    </div>
  );
}
