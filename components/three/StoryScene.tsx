"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { DustParticles } from "./DustParticles";
import type { PerformanceTier } from "@/lib/performance";
import type { StoryAccent } from "@/data/storyService";
import { ACCENT_HEX } from "@/data/storyService";

/* ─── Constants ───────────────────────────────────────────────────── */
const CORRIDOR_LENGTH = 60;   // total depth
const CORRIDOR_W      = 5.0;  // half-width
const CORRIDOR_H      = 4.2;  // half-height
const SHELF_SEGMENTS  = 14;   // number of shelf bays per side
const BAY_DEPTH       = CORRIDOR_LENGTH / SHELF_SEGMENTS;

/* ─── Camera waypoints (one per phase: cover + 5 chapters) ──────── */
const CAM_POSITIONS: THREE.Vector3[] = [
  new THREE.Vector3(0,  0.2,  12),   // cover — entrance, looking in
  new THREE.Vector3(0,  0.4,   6),   // ch01 dawn — stepping inside
  new THREE.Vector3(0,  0.2,  -2),   // ch02 study — deeper, slight tilt
  new THREE.Vector3(0,  0.0,  -14),  // ch03 assembly — corridor opens
  new THREE.Vector3(0,  0.5,  -26),  // ch04 constitutional — mid-corridor
  new THREE.Vector3(0,  0.8,  -42),  // ch05 legacy — far end, light ahead
];

/* ─── Floor ───────────────────────────────────────────────────────── */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CORRIDOR_H, 0]} receiveShadow>
      <planeGeometry args={[CORRIDOR_W * 2, CORRIDOR_LENGTH + 10]} />
      <meshStandardMaterial color="#1A1208" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

/* ─── Ceiling ─────────────────────────────────────────────────────── */
function Ceiling() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, CORRIDOR_H, 0]}>
      <planeGeometry args={[CORRIDOR_W * 2, CORRIDOR_LENGTH + 10]} />
      <meshStandardMaterial color="#0D0B08" roughness={1} metalness={0} />
    </mesh>
  );
}

/* ─── Single bookshelf bay ────────────────────────────────────────── */
function ShelfBay({
  x, z, side, accentHex,
}: {
  x: number; z: number; side: "left" | "right"; accentHex: string;
}) {
  const shelves   = 5;
  const shelfW    = 0.35;
  const shelfD    = BAY_DEPTH * 0.88;
  const shelfSpan = (CORRIDOR_H * 2 - 0.3) / shelves;
  const xDir      = side === "left" ? -1 : 1;

  // Book geometry — random heights per bay (stable across renders via z seed)
  const books = useMemo(() => {
    const seed  = Math.abs(Math.sin(z * 13.7 + (side === "left" ? 0 : 7.3)));
    const count = 7 + Math.floor(seed * 5);
    return Array.from({ length: count }, (_, i) => {
      const s2 = Math.abs(Math.sin(z * 3.1 + i * 7.7));
      const s3 = Math.abs(Math.sin(z * 5.3 + i * 2.9));
      return {
        h:     0.35 + s2 * 0.55,
        w:     0.06 + s3 * 0.06,
        color: s2 > 0.6 ? "#2A1F0A" : s3 > 0.5 ? "#1A2A1A" : "#1F1A2A",
        spine: s2 > 0.7 ? "#C9A24B22" : "#00000000",
      };
    });
  }, [z, side]);

  return (
    <group position={[x, 0, z]}>
      {/* Shelf boards */}
      {Array.from({ length: shelves }).map((_, si) => {
        const y = -CORRIDOR_H + 0.15 + si * shelfSpan;
        return (
          <mesh key={si} position={[xDir * (CORRIDOR_W - shelfW / 2), y, 0]}>
            <boxGeometry args={[shelfW, 0.045, shelfD]} />
            <meshStandardMaterial color="#1C1208" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Back panel */}
      <mesh position={[xDir * CORRIDOR_W, 0, 0]}>
        <boxGeometry args={[0.04, CORRIDOR_H * 2, shelfD]} />
        <meshStandardMaterial color="#100E07" roughness={1} metalness={0} />
      </mesh>

      {/* Books on each shelf */}
      {Array.from({ length: shelves - 1 }).map((_, si) => {
        const baseY = -CORRIDOR_H + 0.18 + si * shelfSpan;
        let offsetX = 0;
        return (
          <group key={`books-${si}`}>
            {books.map((b, bi) => {
              const bx = xDir * (CORRIDOR_W - shelfW + offsetX * xDir + b.w / 2 * xDir);
              offsetX += b.w + 0.008;
              return (
                <mesh key={bi} position={[bx, baseY + b.h / 2, (bi - books.length / 2) * (shelfD / books.length)]}>
                  <boxGeometry args={[b.w, b.h, shelfD / books.length * 0.85]} />
                  <meshStandardMaterial color={b.color} roughness={0.85} metalness={0.0} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Subtle gold trim on shelf edge */}
      <mesh position={[xDir * (CORRIDOR_W - shelfW), CORRIDOR_H - 0.1, 0]}>
        <boxGeometry args={[0.012, 0.012, shelfD]} />
        <meshStandardMaterial
          color={accentHex}
          roughness={0.2}
          metalness={0.8}
          emissive={accentHex}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ─── Full corridor of shelves ────────────────────────────────────── */
function ArchiveShelves({ accentHex }: { accentHex: string }) {
  return (
    <>
      {Array.from({ length: SHELF_SEGMENTS }).map((_, i) => {
        const z = (CORRIDOR_LENGTH / 2) - i * BAY_DEPTH - BAY_DEPTH / 2;
        return (
          <React.Fragment key={i}>
            <ShelfBay x={0} z={z} side="left"  accentHex={accentHex} />
            <ShelfBay x={0} z={z} side="right" accentHex={accentHex} />
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ─── Hanging pendant lamps ────────────────────────────────────────── */
function PendantLamps({ accentHex }: { accentHex: string }) {
  const lampZ = Array.from({ length: 8 }, (_, i) =>
    (CORRIDOR_LENGTH / 2) - i * (CORRIDOR_LENGTH / 8) - CORRIDOR_LENGTH / 16
  );
  return (
    <>
      {lampZ.map((z, i) => (
        <group key={i} position={[0, CORRIDOR_H - 0.1, z]}>
          {/* Cord */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 1.0, 4]} />
            <meshStandardMaterial color="#1A1208" roughness={1} />
          </mesh>
          {/* Shade cone */}
          <mesh position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.18, 0.22, 8]} />
            <meshStandardMaterial color="#1C1410" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Point light — warm amber */}
          <pointLight
            position={[0, -1.25, 0]}
            color={accentHex}
            intensity={0.8}
            distance={7}
            decay={2}
          />
        </group>
      ))}
    </>
  );
}

/* ─── End-of-corridor golden light portal ────────────────────────── */
function LightPortal() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const m = meshRef.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 0.4) * 0.15;
  });
  return (
    <group position={[0, 0, -(CORRIDOR_LENGTH / 2) - 1]}>
      {/* Glow plane */}
      <mesh ref={meshRef}>
        <planeGeometry args={[CORRIDOR_W * 1.8, CORRIDOR_H * 2]} />
        <meshStandardMaterial
          color="#C9A24B"
          emissive="#C9A24B"
          emissiveIntensity={0.7}
          roughness={1}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
      {/* Bright point */}
      <pointLight color="#E8C87A" intensity={4} distance={18} decay={2} />
    </group>
  );
}

/* ─── Floating documents (constitutional chapter) ─────────────────── */
function FloatingDocuments({ z }: { z: number }) {
  const count = 8;
  const refs  = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = -1.5 + Math.sin(t * 0.18 + i * 0.8) * 0.35;
      m.rotation.z = Math.sin(t * 0.12 + i * 0.5) * 0.04;
      m.rotation.y = Math.sin(t * 0.08 + i * 1.1) * 0.06;
    });
  });

  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r     = 1.2 + (i % 3) * 0.4;
        return (
          <mesh
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            position={[Math.cos(angle) * r, -1.0 + i * 0.15, Math.sin(angle) * r * 0.3]}
            rotation={[0.1, angle * 0.3, 0]}
          >
            <planeGeometry args={[0.55, 0.72]} />
            <meshStandardMaterial
              color="#EDE4CE"
              roughness={0.9}
              transparent
              opacity={0.55 - i * 0.03}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      {/* Gold lines on docs */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={`line-${i}`} position={[0, -1.8 + i * 0.38, 0.02]}>
          <planeGeometry args={[0.4, 0.007]} />
          <meshStandardMaterial color="#C9A24B" emissive="#C9A24B" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Single reading desk (study chapter) ─────────────────────────── */
function ReadingDesk({ z }: { z: number }) {
  const lampRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!lampRef.current) return;
    lampRef.current.intensity = 1.2 + Math.sin(clock.getElapsedTime() * 1.8) * 0.08;
  });
  return (
    <group position={[0.8, -CORRIDOR_H + 0.8, z]}>
      {/* Desk surface */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#1A1208" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Open book */}
      <mesh position={[0, 0.05, 0]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.36]} />
        <meshStandardMaterial color="#E8DCC3" roughness={0.95} />
      </mesh>
      {/* Lamp stand */}
      <mesh position={[0.4, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.8, 6]} />
        <meshStandardMaterial color="#2A2010" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Lamp shade */}
      <mesh position={[0.4, 0.85, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.14, 0.18, 8]} />
        <meshStandardMaterial color="#1C1410" roughness={0.7} metalness={0.3} />
      </mesh>
      <pointLight ref={lampRef} position={[0.4, 0.8, 0]} color="#E8A840" intensity={1.2} distance={5} decay={2} />
    </group>
  );
}

/* ─── Corridor arch (entry + chapter transitions) ─────────────────── */
function CorridorArch({ z, accentHex }: { z: number; accentHex: string }) {
  const color = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  return (
    <group position={[0, 0, z]}>
      {/* Top bar */}
      <mesh position={[0, CORRIDOR_H - 0.05, 0]}>
        <boxGeometry args={[CORRIDOR_W * 2 - 0.1, 0.07, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.75} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* Left post */}
      <mesh position={[-CORRIDOR_W + 0.05, 0, 0]}>
        <boxGeometry args={[0.07, CORRIDOR_H * 2, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.75} emissive={color} emissiveIntensity={0.12} />
      </mesh>
      {/* Right post */}
      <mesh position={[CORRIDOR_W - 0.05, 0, 0]}>
        <boxGeometry args={[0.07, CORRIDOR_H * 2, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.75} emissive={color} emissiveIntensity={0.12} />
      </mesh>
      {/* Floor strip */}
      <mesh position={[0, -CORRIDOR_H + 0.01, 0]}>
        <boxGeometry args={[CORRIDOR_W * 2 - 0.1, 0.012, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Ambient + dynamic scene lighting ────────────────────────────── */
function SceneLighting({ progress, accentHex }: { progress: number; accentHex: string }) {
  const dirRef  = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  // Key light colours per chapter phase
  const keyColors = ["#C8A060", "#7AAAD4", "#D4896A", "#E8C97A", "#F0E0A0"];
  const idx  = Math.min(Math.floor(progress * 5), 4);
  const frac = (progress * 5) % 1;
  const from = new THREE.Color(keyColors[idx]);
  const to   = new THREE.Color(keyColors[Math.min(idx + 1, 4)]);
  const target = from.clone().lerp(to, frac);

  useFrame(() => {
    if (dirRef.current)  dirRef.current.color.lerp(target, 0.025);
    if (fillRef.current) fillRef.current.color.lerp(new THREE.Color(accentHex), 0.02);
  });

  return (
    <>
      <ambientLight intensity={0.10} color="#3A2E1A" />
      <directionalLight
        ref={dirRef}
        position={[0, 3, 8]}
        intensity={0.9}
        color="#C8A060"
      />
      <pointLight
        ref={fillRef}
        position={[0, 1, 0]}
        color={accentHex}
        intensity={0.4}
        distance={20}
        decay={2}
      />
      <hemisphereLight args={["#1A1408", "#080604", 0.25]} />
    </>
  );
}

/* ─── Camera controller ───────────────────────────────────────────── */
function ArchiveCamera({ progress }: { progress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const total = CAM_POSITIONS.length;
    const raw   = progress * (total - 1);
    const i0    = Math.min(Math.floor(raw), total - 2);
    const frac  = raw - i0;

    const from = CAM_POSITIONS[i0];
    const to   = CAM_POSITIONS[i0 + 1];
    const target = from.clone().lerp(to, frac);

    camera.position.lerp(target, 0.035);

    // Look slightly ahead down the corridor
    const lookTarget = new THREE.Vector3(
      target.x * 0.1,
      target.y * 0.3,
      target.z - 8
    );
    camera.lookAt(lookTarget);
  });

  return null;
}

/* ─── Subtle mist / atmospheric fog plane ─────────────────────────── */
function MistPlane({ z }: { z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.04 + Math.sin(clock.getElapsedTime() * 0.15 + z) * 0.02;
  });
  return (
    <mesh ref={ref} position={[0, -0.5, z]} rotation={[0, 0, 0]}>
      <planeGeometry args={[CORRIDOR_W * 2, CORRIDOR_H * 2]} />
      <meshBasicMaterial color="#E8DCC3" transparent opacity={0.05} depthWrite={false} />
    </mesh>
  );
}

/* ─── Inner scene ─────────────────────────────────────────────────── */
function SceneInner({
  progress, accent, tier,
}: {
  progress: number;
  accent:   StoryAccent;
  tier:     PerformanceTier;
}) {
  const accentHex = ACCENT_HEX[accent];

  return (
    <>
      <SceneLighting progress={progress} accentHex={accentHex} />
      <ArchiveCamera progress={progress} />

      {/* Structural surfaces */}
      <Floor />
      <Ceiling />

      {/* The archive shelves down both sides */}
      <ArchiveShelves accentHex={accentHex} />

      {/* Pendant lamps overhead */}
      <PendantLamps accentHex={accentHex} />

      {/* Chapter arch frames */}
      {[8, -4, -16, -28, -40].map((z, i) => (
        <CorridorArch key={i} z={z} accentHex={Object.values(ACCENT_HEX)[i] ?? accentHex} />
      ))}

      {/* Ch02: Reading desk */}
      <ReadingDesk z={-2} />

      {/* Ch04: Floating constitutional documents */}
      <FloatingDocuments z={-26} />

      {/* Mist planes — atmospheric depth */}
      {[-5, -15, -30, -45].map((z) => (
        <MistPlane key={z} z={z} />
      ))}

      {/* End portal light */}
      <LightPortal />

      {/* Dust particles */}
      {tier !== "none" && (
        <DustParticles count={tier === "high" ? 220 : 120} spread={10} />
      )}

      {/* Depth fog */}
      <fog attach="fog" args={["#07060402", 12, 55]} />
    </>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
interface StorySceneProps {
  progress: number;
  accent:   StoryAccent;
  tier:     PerformanceTier;
}

export function StoryScene({ progress, accent, tier }: StorySceneProps) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, tier === "high" ? 1.5 : 1.2]}
          gl={{
            antialias: tier === "high",
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 0.2, 14], fov: 52 }}
          frameloop="always"
          shadows={false}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <SceneInner progress={progress} accent={accent} tier={tier} />
        </Canvas>
      </Suspense>
    </div>
  );
}
