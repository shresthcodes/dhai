"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { MuseumLighting } from "./MuseumLighting";
import { DustParticles } from "./DustParticles";
import type { RichMediaItem } from "@/data/mediaModels";
import { useRouter } from "next/navigation";
import { useAccessibilityStore } from "@/store/accessibility";

const KIND_COLORS: Record<string, string> = {
  speech:      "#C9A24B",
  lecture:     "#4C7FB8",
  documentary: "#B5573A",
  interview:   "#E8DCC3",
  audio:       "#C9A24B",
};

/* ─── Single frame ────────────────────────────────────────────────── */
function MediaFrame({
  item, position, index,
}: {
  item:     RichMediaItem;
  position: [number, number, number];
  index:    number;
}) {
  const router   = useRouter();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = KIND_COLORS[item.kind] ?? "#E8DCC3";
  const phase = useMemo(() => index * 0.4, [index]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const targetZ = position[2] + (hovered ? 0.35 : 0);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);
    groupRef.current.position.y = position[1] + Math.sin(t * 0.3 + phase) * 0.04;
    const targetScale = hovered ? 1.06 : 1;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08));
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Frame back (gold edge) */}
      <mesh>
        <boxGeometry args={[2.16, 1.26, 0.04]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.6} emissive={color} emissiveIntensity={hovered ? 0.15 : 0.05} />
      </mesh>

      {/* Screen */}
      <mesh
        position={[0, 0, 0.03]}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = ""; }}
        onClick={() => router.push(`/media/${item.id}`)}
      >
        <planeGeometry args={[2.0, 1.12]} />
        <meshStandardMaterial
          color={hovered ? "#1A1512" : "#12100D"}
          roughness={0.85}
          metalness={0.05}
          emissive={hovered ? new THREE.Color(color).multiplyScalar(0.08) : new THREE.Color(0, 0, 0)}
        />
      </mesh>

      {/* Kind glyph overlay */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.15}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Spotlight cone shadow */}
      <spotLight
        position={[0, 2.5, 1.5]}
        target-position={[0, 0, 0]}
        intensity={hovered ? 0.8 : 0.35}
        angle={0.4}
        penumbra={0.6}
        color="#E8C97A"
        castShadow={false}
      />

      {/* HTML label — show on hover */}
      <Html center position={[0, -0.75, 0.1]} distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div style={{
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s",
          textAlign: "center",
          background: "rgba(11,13,18,0.85)",
          border: `1px solid ${color}40`,
          borderRadius: 6,
          padding: "6px 12px",
          maxWidth: 200,
        }}>
          <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "0.72rem", color: "#F4EDE0", lineHeight: 1.3 }}>
            {item.title}
          </p>
          <p style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.52rem", color, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>
            {item.kind}
          </p>
        </div>
      </Html>
    </group>
  );
}

/* ─── Camera parallax ─────────────────────────────────────────────── */
function CameraRig({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>; mouseY: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseX.current * 0.8, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouseY.current * 0.4, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ─── SVG 2D fallback ─────────────────────────────────────────────── */
function GridFallback({ items }: { items: RichMediaItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {items.map((item) => (
        <a key={item.id} href={`/media/${item.id}`}
          className="aspect-video bg-[#12100D] rounded-sharp border border-[rgba(244,237,224,0.08)] hover:border-gold/25 transition-all flex items-center justify-center"
          aria-label={item.title}
        >
          <div className="text-center px-2">
            <p className="font-sans text-[0.58rem] text-gold/50 uppercase tracking-wider">{item.kind}</p>
            <p className="font-serif text-xs text-ivory/50 mt-1 line-clamp-2">{item.title}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */
interface MediaWallProps {
  items: RichMediaItem[];
  tier:  "high" | "low" | "none";
}

export function MediaWall({ items, tier }: MediaWallProps) {
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const { reduceMotion } = useAccessibilityStore();

  // Curved wall layout
  const positions = useMemo((): [number, number, number][] => {
    const cols = Math.min(items.length, 4);
    const rows = Math.ceil(items.length / cols);
    return items.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x   = (col - (cols - 1) / 2) * 2.4;
      const y   = (row === 0 ? 0.5 : -0.7);
      const z   = -Math.abs(col - (cols - 1) / 2) * 0.3;   // slight curve
      return [x, y, z];
    });
  }, [items]);

  if (tier === "none" || reduceMotion) {
    return <GridFallback items={items} />;
  }

  return (
    <div
      className="w-full rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]"
      style={{ height: 420 }}
      onMouseMove={(e) => {
        mouseX.current = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2;
      }}
      aria-label="Media wall"
    >
      {/* Keyboard-accessible hidden list */}
      <ul className="sr-only" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`/media/${item.id}`}>{item.title} — {item.kind}</a>
          </li>
        ))}
      </ul>

      <Suspense fallback={<GridFallback items={items} />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: tier === "high", toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
          camera={{ position: [0, 0.3, 5.5], fov: 48 }}
          shadows={false}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <MuseumLighting />
          <DustParticles count={tier === "high" ? 80 : 30} spread={6} />
          <CameraRig mouseX={mouseX} mouseY={mouseY} />
          {items.map((item, i) => (
            <MediaFrame key={item.id} item={item} position={positions[i]} index={i} />
          ))}
          <fog attach="fog" args={["#0A0806", 6, 16]} />
        </Canvas>
      </Suspense>
    </div>
  );
}
