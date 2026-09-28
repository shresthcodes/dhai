"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

/* ─── ParchmentPlane ────────────────────────────────────────────────────
   Placeholder floating plane to verify the 3D engine and lighting.
   Gentle float animation. Will be replaced with archival artwork.
──────────────────────────────────────────────────────────────────────── */
export function ParchmentPlane() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.12;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.06;
    groupRef.current.rotation.z = Math.sin(t * 0.25) * 0.015;
  });

  return (
    <group ref={groupRef}>
      {/* Main plane */}
      <RoundedBox args={[2.8, 3.8, 0.04]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#E8DCC3"
          roughness={0.82}
          metalness={0.02}
        />
      </RoundedBox>

      {/* Gold border trim */}
      <RoundedBox args={[2.84, 3.84, 0.03]} radius={0.07} smoothness={4} position={[0, 0, -0.005]}>
        <meshStandardMaterial
          color="#C9A24B"
          roughness={0.45}
          metalness={0.6}
          emissive="#C9A24B"
          emissiveIntensity={0.08}
        />
      </RoundedBox>

      {/* Demo text on plane */}
      <Text
        position={[0, 0.3, 0.03]}
        fontSize={0.18}
        color="#0B0D12"
        anchorX="center"
        anchorY="middle"
        font="/fonts/cormorant-garamond-v16-latin-600.woff2"
        maxWidth={2.2}
        textAlign="center"
      >
        DHAI
      </Text>
      <Text
        position={[0, -0.05, 0.03]}
        fontSize={0.065}
        color="#5A4E3A"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
        textAlign="center"
        letterSpacing={0.12}
      >
        DIGITAL HERITAGE ARCHIVE
      </Text>
      <Text
        position={[0, -0.8, 0.03]}
        fontSize={0.055}
        color="#8A7A62"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.0}
        textAlign="center"
      >
        Engine verification · Demo placeholder
      </Text>
    </group>
  );
}
