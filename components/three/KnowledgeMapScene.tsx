"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { MuseumLighting } from "./MuseumLighting";
import type { SearchResult } from "@/data/archiveService";
import type { ArchiveItemType } from "@/data/models";

/* ─── Type colours ────────────────────────────────────────────────── */
const TYPE_COLOR: Record<ArchiveItemType, string> = {
  writing:    "#C9A24B",
  speech:     "#4C7FB8",
  manuscript: "#E8DCC3",
  debate:     "#B5573A",
  photograph: "#4C7FB8",
  record:     "#C9A24B",
  audio:      "#4C7FB8",
  video:      "#B5573A",
};

/* ─── Central query node ─────────────────────────────────────────── */
function QueryNode({ label }: { label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
  });
  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#C9A24B"
          emissive="#C9A24B"
          emissiveIntensity={0.3}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.008, 8, 64]} />
        <meshStandardMaterial color="#C9A24B" emissive="#C9A24B" emissiveIntensity={0.6} transparent opacity={0.3} />
      </mesh>
      <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "var(--font-inter, sans-serif)",
          fontSize: "0.55rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#E3C77A",
          whiteSpace: "nowrap",
          marginTop: "2.4rem",
          textShadow: "0 1px 6px rgba(0,0,0,0.8)",
        }}>
          {label.slice(0, 24)}
        </div>
      </Html>
    </group>
  );
}

/* ─── Result node ────────────────────────────────────────────────── */
interface ResultNodeProps {
  result:   SearchResult;
  position: THREE.Vector3;
  onSelect: (r: SearchResult) => void;
}

function ResultNode({ result, position, onSelect }: ResultNodeProps) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = TYPE_COLOR[result.item.type] ?? "#E8DCC3";
  const basePos = useMemo(() => position.clone(), [position]);
  const phase   = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = basePos.y + Math.sin(t * 0.4 + phase) * 0.06;
    meshRef.current.scale.setScalar(hovered
      ? THREE.MathUtils.lerp(meshRef.current.scale.x, 1.25, 0.1)
      : THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0,  0.08)
    );
  });

  return (
    <group>
      {/* Connector line to centre */}
      <Line
        points={[new THREE.Vector3(0, 0, 0), position]}
        color={color}
        lineWidth={0.4}
        transparent
        opacity={hovered ? 0.35 : 0.12}
      />

      {/* Pulse dot travelling along line */}
      <PulseDot start={new THREE.Vector3(0, 0, 0)} end={position} color={color} phase={phase} />

      <mesh
        ref={meshRef}
        position={position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onSelect(result)}
        castShadow
      >
        <boxGeometry args={[0.28, 0.36, 0.02]} />
        <meshStandardMaterial
          color={hovered ? "#F4EDE0" : "#E8DCC3"}
          roughness={0.82}
          metalness={0.05}
          transparent
          opacity={hovered ? 1.0 : 0.78}
        />
      </mesh>

      {/* Coloured type edge */}
      <mesh position={position}>
        <boxGeometry args={[0.30, 0.38, 0.015]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.5 : 0.22}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html position={[position.x, position.y + 0.28, position.z]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(22,27,38,0.92)",
            border: "1px solid rgba(201,162,75,0.25)",
            borderRadius: 8,
            padding: "8px 12px",
            maxWidth: 180,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}>
            <p style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: "0.75rem", color: "#F4EDE0", lineHeight: 1.3, marginBottom: 4 }}>
              {result.item.title}
            </p>
            <p style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.55rem", color: color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {result.item.type}
            </p>
            <p style={{ fontFamily: "var(--font-inter, sans-serif)", fontSize: "0.55rem", color: "rgba(244,237,224,0.4)", marginTop: 3 }}>
              {result.reason}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Pulse dot ──────────────────────────────────────────────────── */
function PulseDot({ start, end, color, phase }: { start: THREE.Vector3; end: THREE.Vector3; color: string; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const prog = ((Math.sin(t * 0.7 + phase) * 0.5 + 0.5));
    meshRef.current.position.lerpVectors(start, end, prog);
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.018, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.7} />
    </mesh>
  );
}

/* ─── Scene content ──────────────────────────────────────────────── */
function MapScene({ results, query, onSelect }: {
  results:  SearchResult[];
  query:    string;
  onSelect: (r: SearchResult) => void;
}) {
  const positions = useMemo(() => {
    return results.map((r, i) => {
      const radius = 1.8 + (1 - r.score / 100) * 1.4;
      const angle  = (i / results.length) * Math.PI * 2;
      const tilt   = (Math.random() - 0.5) * 0.8;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        tilt,
        Math.sin(angle) * radius
      );
    });
  }, [results]);

  return (
    <>
      <MuseumLighting />
      <QueryNode label={query} />
      {results.map((r, i) => (
        <ResultNode key={r.item.id} result={r} position={positions[i]} onSelect={onSelect} />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={9}
        autoRotate
        autoRotateSpeed={0.4}
        dampingFactor={0.08}
        enableDamping
      />
      <fog attach="fog" args={["#0B0D12", 8, 18]} />
    </>
  );
}

/* ─── SVG fallback (for 'none' tier) ─────────────────────────────── */
function SvgMapFallback({ results, query, onSelect }: {
  results:  SearchResult[];
  query:    string;
  onSelect: (r: SearchResult) => void;
}) {
  const W = 480; const H = 320; const cx = W / 2; const cy = H / 2;
  const nodes = results.slice(0, 10).map((r, i) => {
    const radius = 80 + (1 - r.score / 100) * 60;
    const angle  = (i / Math.max(results.length, 1)) * Math.PI * 2;
    return { r, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });

  return (
    <div className="relative w-full overflow-hidden rounded-card border border-[rgba(244,237,224,0.08)] bg-night" style={{ height: 320 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {nodes.map(({ r, x, y }) => (
          <line key={r.item.id} x1={cx} y1={cy} x2={x} y2={y} stroke="#C9A24B" strokeWidth={0.5} opacity={0.2} />
        ))}
        <circle cx={cx} cy={cy} r={16} fill="#C9A24B" opacity={0.8} />
        <text x={cx} y={cy + 28} textAnchor="middle" fill="#E3C77A" fontSize={9} fontFamily="sans-serif">{query.slice(0, 20)}</text>
        {nodes.map(({ r, x, y }) => (
          <g key={r.item.id} onClick={() => onSelect(r)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={8} fill={TYPE_COLOR[r.item.type]} opacity={0.7} />
            <text x={x} y={y + 18} textAnchor="middle" fill="rgba(244,237,224,0.5)" fontSize={7} fontFamily="sans-serif">{r.item.title.slice(0, 14)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────── */
interface KnowledgeMapProps {
  results:   SearchResult[];
  query:     string;
  tier:      "high" | "low" | "none";
  onSelect:  (r: SearchResult) => void;
}

export function KnowledgeMapScene({ results, query, tier, onSelect }: KnowledgeMapProps) {
  if (tier === "none" || !results.length) {
    return <SvgMapFallback results={results} query={query} onSelect={onSelect} />;
  }

  return (
    <div
      className="w-full rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]"
      style={{ height: 440 }}
      role="img"
      aria-label={`Knowledge map for query: ${query}`}
    >
      <Suspense fallback={<SvgMapFallback results={results} query={query} onSelect={onSelect} />}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{
            antialias: tier === "high",
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 2, 5.5], fov: 50 }}
          shadows={false}
          frameloop="always"
        >
          <MapScene results={results} query={query} onSelect={onSelect} />
        </Canvas>
      </Suspense>
    </div>
  );
}
