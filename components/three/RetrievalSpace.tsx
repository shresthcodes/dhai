"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { MuseumLighting } from "./MuseumLighting";
import type { SourceCitation } from "@/lib/ask/types";
import type { ArchiveItemType } from "@/data/models";

const TYPE_COLOR: Partial<Record<ArchiveItemType, string>> = {
  writing:    "#C9A24B",
  speech:     "#4C7FB8",
  manuscript: "#E8DCC3",
  debate:     "#B5573A",
  photograph: "#4C7FB8",
  record:     "#C9A24B",
  audio:      "#4C7FB8",
  video:      "#B5573A",
};

/* ─── Central query orb ───────────────────────────────────────────── */
function QueryOrb({ label }: { label: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.4;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.6) * 0.05;
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#C9A24B" emissive="#C9A24B" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.006, 8, 64]} />
        <meshStandardMaterial color="#C9A24B" emissive="#C9A24B" emissiveIntensity={0.7} transparent opacity={0.4} />
      </mesh>
      <Html center distanceFactor={5} style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.5rem",
          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#E3C77A", whiteSpace: "nowrap", marginTop: "2rem",
          textShadow: "0 1px 6px rgba(0,0,0,0.9)",
        }}>
          {label.slice(0, 28)}
        </div>
      </Html>
    </group>
  );
}

/* ─── Travelling light pulse ──────────────────────────────────────── */
function Pulse({ start, end, color, phase }: {
  start: THREE.Vector3; end: THREE.Vector3; color: string; phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const p = (Math.sin(clock.getElapsedTime() * 0.9 + phase) * 0.5 + 0.5);
    ref.current.position.lerpVectors(start, end, p);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.016, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} transparent opacity={0.8} />
    </mesh>
  );
}

/* ─── Source node ─────────────────────────────────────────────────── */
function SourceNode({ source, position, isTop, onHover }: {
  source:  SourceCitation;
  position: THREE.Vector3;
  isTop:   boolean;
  onHover: (id: string | null) => void;
}) {
  const ref  = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hov, setHov] = useState(false);
  const color  = TYPE_COLOR[source.type] ?? "#E8DCC3";
  const phase  = useMemo(() => Math.random() * Math.PI * 2, []);
  const liftedPos = useMemo(() => position.clone().multiplyScalar(isTop ? 0.65 : 1), [position, isTop]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.lerp(liftedPos, isTop ? 0.04 : 0.02);
    ref.current.position.y += Math.sin(t * 0.35 + phase) * 0.002;
    if (meshRef.current) {
      const s = hov ? 1.3 : isTop ? 1.0 : 0.75;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, s, 0.08));
    }
  });

  const origin = new THREE.Vector3(0, 0, 0);

  return (
    <group ref={ref} position={position}>
      <Line points={[origin.clone().sub(position), new THREE.Vector3(0, 0, 0)]}
        color={color} lineWidth={isTop ? 0.6 : 0.25} transparent opacity={isTop ? 0.35 : 0.1}
      />
      {isTop && <Pulse start={origin.clone().sub(position)} end={new THREE.Vector3(0, 0, 0)} color={color} phase={phase} />}

      <mesh ref={meshRef}
        onPointerEnter={() => { setHov(true);  onHover(source.id); }}
        onPointerLeave={() => { setHov(false); onHover(null); }}
      >
        <boxGeometry args={[0.22, 0.28, 0.018]} />
        <meshStandardMaterial
          color={hov ? "#F4EDE0" : "#D8C9A8"}
          roughness={0.85} metalness={0.04}
          transparent opacity={isTop ? (hov ? 1 : 0.9) : 0.45}
        />
      </mesh>
      {/* Coloured edge */}
      <mesh>
        <boxGeometry args={[0.24, 0.30, 0.013]} />
        <meshStandardMaterial color={color} transparent opacity={isTop ? 0.35 : 0.1} roughness={0.3} metalness={0.5} />
      </mesh>

      {hov && (
        <Html center distanceFactor={6} position={[0, 0.22, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(22,27,38,0.93)", border: "1px solid rgba(201,162,75,0.3)",
            borderRadius: 8, padding: "7px 11px", maxWidth: 170,
            boxShadow: "0 4px 20px rgba(0,0,0,0.55)",
          }}>
            <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "0.72rem", color: "#F4EDE0", lineHeight: 1.3, marginBottom: 3 }}>
              {source.title}
            </p>
            <p style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.52rem", color: color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {source.type}
            </p>
            <p style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.52rem", color: "rgba(244,237,224,0.4)", marginTop: 3 }}>
              Demo retrieval: {source.retrievalScore}%
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── SVG fallback ────────────────────────────────────────────────── */
function SvgFallback({ sources, query }: { sources: SourceCitation[]; query: string }) {
  const W = 440; const H = 260; const cx = W / 2; const cy = H / 2;
  const nodes = sources.slice(0, 8).map((s, i) => {
    const r = 70 + (1 - s.retrievalScore / 100) * 50;
    const a = (i / Math.max(sources.length, 1)) * Math.PI * 2;
    return { s, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
  return (
    <div className="w-full rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)] bg-night" style={{ height: 260 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {nodes.map(({ s, x, y }) => (
          <line key={s.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#C9A24B" strokeWidth={0.8} opacity={0.2} />
        ))}
        <circle cx={cx} cy={cy} r={14} fill="#C9A24B" opacity={0.85} />
        <text x={cx} y={cy + 24} textAnchor="middle" fill="#E3C77A" fontSize={8} fontFamily="sans-serif">{query.slice(0, 22)}</text>
        {nodes.map(({ s, x, y }) => (
          <g key={s.id}>
            <circle cx={x} cy={y} r={s.retrievalScore > 50 ? 8 : 5} fill={TYPE_COLOR[s.type] ?? "#E8DCC3"} opacity={0.7} />
            <text x={x} y={y + 16} textAnchor="middle" fill="rgba(244,237,224,0.45)" fontSize={7} fontFamily="sans-serif">
              {s.title.slice(0, 14)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Scene inner ─────────────────────────────────────────────────── */
function SceneInner({ sources, query }: { sources: SourceCitation[]; query: string }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const positions = useMemo(() => sources.map((s, i) => {
    const radius = 1.6 + (1 - s.retrievalScore / 100) * 1.2;
    const angle  = (i / Math.max(sources.length, 1)) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.7, Math.sin(angle) * radius);
  }), [sources]);

  return (
    <>
      <MuseumLighting />
      <QueryOrb label={query} />
      {sources.map((s, i) => (
        <SourceNode
          key={s.id}
          source={s}
          position={positions[i]}
          isTop={i < 3}
          onHover={setHoveredId}
        />
      ))}
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={7}
        autoRotate autoRotateSpeed={0.35} dampingFactor={0.1} enableDamping />
      <fog attach="fog" args={["#0B0D12", 7, 15]} />
    </>
  );
}

/* ─── Public component ────────────────────────────────────────────── */
interface RetrievalSpaceProps {
  sources:    SourceCitation[];
  query:      string;
  tier:       "high" | "low" | "none";
}

export function RetrievalSpace({ sources, query, tier }: RetrievalSpaceProps) {
  if (tier === "none" || !sources.length) {
    return <SvgFallback sources={sources} query={query} />;
  }

  return (
    <div className="w-full rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]" style={{ height: 260 }} role="img" aria-label={`Retrieval space visualisation for: ${query}`}>
      <Suspense fallback={<SvgFallback sources={sources} query={query} />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: tier === "high", toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
          camera={{ position: [0, 1.8, 4.5], fov: 52 }}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <SceneInner sources={sources} query={query} />
        </Canvas>
      </Suspense>
    </div>
  );
}
