"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PerformanceTier } from "@/lib/performance";

export interface HeroSceneProps {
  tier:        PerformanceTier;
  scrollY:     React.MutableRefObject<number>;
  mouseX:      React.MutableRefObject<number>;
  mouseY:      React.MutableRefObject<number>;
  paperTex:    THREE.Texture | null;
  portraitTex: THREE.Texture | null;
}

function CameraController({ scrollY, mouseX, mouseY }: {
  scrollY: React.MutableRefObject<number>;
  mouseX:  React.MutableRefObject<number>;
  mouseY:  React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const start = useRef(Date.now());

  useFrame(({ clock }) => {
    const t       = clock.getElapsedTime();
    const elapsed = (Date.now() - start.current) / 1000;
    const prog    = Math.min(elapsed / 2.5, 1);
    const eased   = 1 - Math.pow(1 - prog, 3);
    const baseZ   = THREE.MathUtils.lerp(9.5, 6.5, eased);
    const sway    = prog >= 1;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x,
      (sway ? Math.sin(t * 0.15) * 0.06 : 0) + mouseX.current * 0.08, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y,
      (sway ? Math.sin(t * 0.12) * 0.03 : 0) - mouseY.current * 0.05, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z,
      baseZ + scrollY.current * 0.004, 0.05);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroScene({ tier, scrollY, mouseX, mouseY }: HeroSceneProps) {
  return (
    <CameraController scrollY={scrollY} mouseX={mouseX} mouseY={mouseY} />
  );
}
