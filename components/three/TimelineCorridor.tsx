"use client";

import React, {
  useRef, useMemo, useState, useEffect, Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { MuseumLighting } from "./MuseumLighting";
import {
  CHAPTERS, type TimelineEvent, type TimelineChapter,
} from "@/data/timelineService";
import type { PerformanceTier } from "@/lib/performance";
import { useAccessibilityStore } from "@/store/accessibility";

/* ─── Layout ──────────────────────────────────────────────────────── */
const SPACING   = 4.5;    // distance between plates
const PLATE_W   = 2.2;
const PLATE_H   = 2.8;

function eventPosition(index: number): THREE.Vector3 {
  // Gentle curve — alternate left/right slightly
  const z = -index * SPACING;
  const x = Math.sin(index * 0.5) * 0.6;
  const y = 0;
  return new THREE.Vector3(x, y, z);
}

function cameraForIndex(index: number): THREE.Vector3 {
  const pos = eventPosition(index);
  return new THREE.Vector3(pos.x * 0.3, 0.4, pos.z + 5.5);
}

/* ─── Camera ──────────────────────────────────────────────────────── */
function CameraController({ targetIdx }: { targetIdx: number }) {
  const { camera } = useThree();
  const target = useMemo(() => cameraForIndex(targetIdx), [targetIdx]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Smooth camera move toward target
    camera.position.lerp(
      new THREE.Vector3(
        target.x + Math.sin(t * 0.2) * 0.04,
        target.y + Math.sin(t * 0.15) * 0.02,
        target.z
      ),
      0.035
    );
    // Look slightly ahead
    const lookAt = eventPosition(targetIdx);
    camera.lookAt(new THREE.Vector3(lookAt.x, lookAt.y + 0.2, lookAt.z));
  });
  return null;
}

/* ─── Timeline gold path ──────────────────────────────────────────── */
function TimelinePath({ events }: { events: TimelineEvent[] }) {
  const points = useMemo(
    () => events.map((_, i) => eventPosition(i)),
    [events]
  );
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <line geometry={geometry} {...{} as any}>
      <lineBasicMaterial color="#C9A24B" transparent opacity={0.3} />
    </line>
  );
}

/* ─── Single event plate ──────────────────────────────────────────── */
function EventPlate({
  event, index, activeIdx, onSelect,
}: {
  event:    TimelineEvent;
  index:    number;
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  const groupRef  = useRef<THREE.Group>(null);
  const isActive  = index === activeIdx;
  const isPassed  = index < activeIdx;
  const isFuture  = index > activeIdx;
  const accentHex = CHAPTERS[event.chapter]?.accentHex ?? "#C9A24B";
  const accent    = useMemo(() => new THREE.Color(accentHex), [accentHex]);
  const pos       = useMemo(() => eventPosition(index), [index]);
  const phase     = useMemo(() => index * 0.6, [index]);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle float
    groupRef.current.position.y = pos.y + Math.sin(t * 0.3 + phase) * 0.05;
    // Scale based on state
    const targetScale = isActive ? 1.0 : hovered ? 0.88 : isPassed ? 0.72 : 0.78;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.06)
    );
    // Opacity via material (handled below)
  });

  const opacity = isActive ? 1.0 : isPassed ? 0.5 : isFuture ? 0.65 : 0.65;
  const emissiveInt = isActive ? 0.12 : hovered ? 0.06 : 0.0;

  return (
    <group ref={groupRef} position={pos}>
      {/* Gold accent frame */}
      <mesh>
        <boxGeometry args={[PLATE_W + 0.06, PLATE_H + 0.06, 0.02]} />
        <meshStandardMaterial
          color={accent}
          roughness={0.3} metalness={0.7}
          emissive={accent}
          emissiveIntensity={isActive ? 0.3 : 0.05}
          transparent opacity={opacity * 0.9}
        />
      </mesh>

      {/* Parchment face */}
      <mesh
        position={[0, 0, 0.02]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onSelect(index)}
      >
        <planeGeometry args={[PLATE_W, PLATE_H]} />
        <meshStandardMaterial
          color={isActive ? "#EDE4CE" : "#1C180F"}
          roughness={0.88}
          emissive={isActive ? new THREE.Color("#C9A24B") : new THREE.Color(0,0,0)}
          emissiveIntensity={emissiveInt}
          transparent opacity={opacity}
        />
      </mesh>

      {/* Spotlight for active plate */}
      {isActive && (
        <spotLight
          position={[0, 3, 2]}
          target-position={[0, 0, 0]}
          intensity={1.2}
          angle={0.45}
          penumbra={0.7}
          color="#E8C97A"
          castShadow={false}
        />
      )}

      {/* HTML label */}
      <Html
        center
        position={[0, 0, 0.06]}
        distanceFactor={8}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div style={{
          textAlign: "center",
          maxWidth: 180,
          opacity: opacity,
          transition: "opacity 0.4s",
          padding: "8px 12px",
        }}>
          {/* Year */}
          <p style={{
            fontFamily: "var(--font-cormorant, serif)",
            fontSize: isActive ? "2rem" : "1.4rem",
            fontWeight: 700,
            color: isActive ? "#1A1208" : accentHex,
            lineHeight: 1,
            marginBottom: 6,
            transition: "all 0.3s",
          }}>
            {event.year}
          </p>
          {/* Date label */}
          <p style={{
            fontFamily: "var(--font-inter, sans-serif)",
            fontSize: "0.5rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: isActive ? "#5A4020" : accentHex + "99",
            textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {event.dateLabel}
          </p>
          {/* Title — only for active */}
          {isActive && (
            <p style={{
              fontFamily: "var(--font-cormorant, serif)",
              fontSize: "0.82rem",
              color: "#2A1A08",
              lineHeight: 1.3,
              fontWeight: 500,
            }}>
              {event.title}
            </p>
          )}
          {/* Chapter badge */}
          <div style={{
            marginTop: isActive ? 8 : 4,
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 3,
            backgroundColor: accentHex + "22",
            border: `1px solid ${accentHex}44`,
          }}>
            <span style={{
              fontFamily: "var(--font-inter, sans-serif)",
              fontSize: "0.48rem",
              color: accentHex,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}>
              {CHAPTERS[event.chapter]?.label ?? event.chapter}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ─── Pulse dot on path ───────────────────────────────────────────── */
function PathPulse({ events, activeIdx }: { events: TimelineEvent[]; activeIdx: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const from = useMemo(() => eventPosition(Math.max(0, activeIdx - 1)), [activeIdx]);
  const to   = useMemo(() => eventPosition(activeIdx), [activeIdx]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const p = (Math.sin(clock.getElapsedTime() * 1.2) * 0.5 + 0.5);
    ref.current.position.lerpVectors(from, to, p);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#E3C77A" emissive="#C9A24B" emissiveIntensity={1.5} />
    </mesh>
  );
}

/* ─── Full scene ──────────────────────────────────────────────────── */
function CorridorScene({
  events, activeIdx, onSelect, tier,
}: {
  events:   TimelineEvent[];
  activeIdx: number;
  onSelect: (i: number) => void;
  tier:     PerformanceTier;
}) {
  return (
    <>
      <MuseumLighting />
      <CameraController targetIdx={activeIdx} />
      <TimelinePath events={events} />
      <PathPulse events={events} activeIdx={activeIdx} />

      {events.map((evt, i) => (
        <EventPlate
          key={evt.id}
          event={evt}
          index={i}
          activeIdx={activeIdx}
          onSelect={onSelect}
        />
      ))}

      {/* Ambient fog for depth */}
      <fog attach="fog" args={["#060402", 8, 32]} />
    </>
  );
}

/* ─── Classic 2D fallback ─────────────────────────────────────────── */
function ClassicFallback({ events, activeIdx, onSelect }: {
  events:   TimelineEvent[];
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex gap-0 overflow-x-auto pb-4 pt-2" role="list">
      {events.map((evt, i) => {
        const meta    = CHAPTERS[evt.chapter];
        const isActive = i === activeIdx;
        return (
          <div key={evt.id} className="flex flex-col items-center shrink-0 w-40 relative" role="listitem">
            {i < events.length - 1 && (
              <div className="absolute top-5 left-[50%] w-40 h-px"
                style={{ background: i < activeIdx ? meta.accentHex : "rgba(244,237,224,0.1)" }} />
            )}
            <button
              onClick={() => onSelect(i)}
              className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-gold"
              style={{
                borderColor: meta.accentHex,
                background:  isActive ? meta.accentHex + "33" : "transparent",
                boxShadow:   isActive ? `0 0 12px ${meta.accentHex}50` : "none",
              }}
              aria-label={`${evt.dateLabel} — ${evt.title}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="font-sans text-[0.52rem] font-bold" style={{ color: meta.accentHex }}>
                {evt.year}
              </span>
            </button>
            <p className={`font-serif text-[0.72rem] text-center mt-1.5 px-1 leading-tight ${isActive ? "text-ivory" : "text-ivory/45"}`}>
              {evt.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
interface TimelineCorridorProps {
  events:    TimelineEvent[];
  activeIdx: number;
  onSelect:  (i: number) => void;
  tier:      PerformanceTier;
  mode:      "immersive" | "classic";
}

export function TimelineCorridor({ events, activeIdx, onSelect, tier, mode }: TimelineCorridorProps) {
  const { reduceMotion } = useAccessibilityStore();
  const useImmersive = mode === "immersive" && tier !== "none" && !reduceMotion;

  if (!useImmersive) {
    return <ClassicFallback events={events} activeIdx={activeIdx} onSelect={onSelect} />;
  }

  return (
    <div
      className="w-full rounded-card overflow-hidden border border-[rgba(244,237,224,0.08)]"
      style={{ height: 460 }}
      role="img"
      aria-label="Interactive 3D timeline corridor"
    >
      <ol className="sr-only">
        {events.map((evt, i) => (
          <li key={evt.id} aria-current={i === activeIdx ? "step" : undefined}>
            {evt.dateLabel} — {evt.title}
          </li>
        ))}
      </ol>

      <Suspense fallback={<ClassicFallback events={events} activeIdx={activeIdx} onSelect={onSelect} />}>
        <Canvas
          dpr={[1, tier === "high" ? 1.5 : 1.25]}
          gl={{
            antialias: tier === "high",
            toneMapping: ACESFilmicToneMapping,
            outputColorSpace: SRGBColorSpace,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          camera={{ position: [0, 0.4, 9], fov: 50 }}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <CorridorScene events={events} activeIdx={activeIdx} onSelect={onSelect} tier={tier} />
        </Canvas>
      </Suspense>
    </div>
  );
}
