import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A swirling "portal" filling the event-gate opening, matching the
 * reference image (concentric rings of color spiraling toward a bright
 * core) instead of a flat black rectangle. Built from primitives — a
 * dark backing disc, a soft glow, a few counter-rotating rings, and a
 * bright core — rather than a custom shader/texture, since this repeats
 * across 8 gates and needs to stay cheap.
 *
 * The dark backing disc still does the job GateVoid used to do alone
 * (nothing from behind ever shows through the opening); the rings and
 * core sit in front of it, so what used to read as "a black spot" now
 * reads as a lit magical threshold.
 */
export default function GatePortal({ colorA = '#55c8ff', colorB = '#b06bff', coreColor = '#fff2d8', z = -0.85 }) {
  const ringRefs = useRef([]);

  useFrame((_, delta) => {
    ringRefs.current.forEach((r, i) => {
      if (r) r.rotation.z += delta * (i % 2 === 0 ? 0.55 : -0.4) * (1 + i * 0.18);
    });
  });

  const rings = [1.05, 0.82, 0.6, 0.38];

  return (
    <group position={[0, 1.9, z]}>
      {/* dark backing — occludes anything behind the opening */}
      <mesh position={[0, 0, -0.08]}>
        <circleGeometry args={[1.3, 32]} />
        <meshBasicMaterial color="#05060a" toneMapped={false} />
      </mesh>
      {/* soft outer glow */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[1.25, 32]} />
        <meshBasicMaterial
          color={colorA}
          transparent
          opacity={0.22}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {rings.map((r, i) => (
        <mesh key={i} ref={(el) => (ringRefs.current[i] = el)} position={[0, 0, 0.01 * (i + 1)]}>
          <torusGeometry args={[r, r * 0.09, 8, 48]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? colorA : colorB}
            transparent
            opacity={0.85}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {/* bright core */}
      <mesh position={[0, 0, 0.06]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color={coreColor} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
