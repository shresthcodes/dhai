"use client";

/* ─── MuseumLighting ────────────────────────────────────────────────────
   Warm key light + cool rim light + soft ambient.
   Gallery spotlight feel — not generic three-point studio.
──────────────────────────────────────────────────────────────────────── */
export function MuseumLighting() {
  return (
    <>
      {/* Ambient — very low, warm tint */}
      <ambientLight intensity={0.18} color="#F4EDE0" />

      {/* Key — warm tungsten gallery spot, from upper-left front */}
      <directionalLight
        castShadow
        position={[3, 5, 3]}
        intensity={1.6}
        color="#E8C97A"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
      />

      {/* Rim — cool moonlight / sky, from upper-right back */}
      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.55}
        color="#7AAAD4"
      />

      {/* Ground bounce — very faint warm fill from below */}
      <directionalLight
        position={[0, -3, 1]}
        intensity={0.08}
        color="#C9A24B"
      />

      {/* Hemisphere — sky warm, ground dark */}
      <hemisphereLight
        args={["#E8DCC3", "#10141C", 0.25]}
        position={[0, 8, 0]}
      />
    </>
  );
}
