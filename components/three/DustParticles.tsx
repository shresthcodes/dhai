"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DustParticlesProps {
  count?: number;
  spread?: number;
}

export function DustParticles({ count = 280, spread = 5 }: DustParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases    = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      phases[i]             = Math.random() * Math.PI * 2;
    }

    return { positions, phases };
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = (meshRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < count; i++) {
      const phase = phases[i];
      // Gentle drift on Y axis, tiny sway on X
      pos[i * 3 + 0] += Math.sin(t * 0.12 + phase) * 0.0004;
      pos[i * 3 + 1] += Math.sin(t * 0.08 + phase * 1.3) * 0.0003;
      pos[i * 3 + 2] += Math.cos(t * 0.10 + phase * 0.7) * 0.0002;

      // Wrap particles that drift out of bounds
      if (pos[i * 3 + 1] > spread * 0.5)  pos[i * 3 + 1] = -spread * 0.5;
      if (pos[i * 3 + 1] < -spread * 0.5) pos[i * 3 + 1] = spread * 0.5;
    }

    (meshRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#E8DCC3"
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
