import { useTexture } from '@react-three/drei';
import { SKY, TEXTURE_PATHS } from './config';

/**
 * Real photographic cloud puffs (cloud-01.webp — a working asset now;
 * an earlier pass fell back to a canvas-drawn approximation because the
 * original PNG this pointed at was missing/failing to resolve).
 *
 * Still layered/tinted the same way that pass introduced for blending:
 * several puffs, low opacity, each tinted toward the gradient sky's own
 * tones (SkyBackdrop.jsx) rather than one flat color — that's what
 * makes them read as sitting IN the sky instead of pasted over it, and
 * that part of the design didn't depend on where the texture came from.
 */
export default function SkyClouds() {
  const texture = useTexture(TEXTURE_PATHS.cloud);

  const puffs = [
    { position: [-18, 13, -32], scale: [30, 19, 1], opacity: 0.34, color: SKY.horizonColor },
    { position: [20, 16, -52], scale: [34, 22, 1], opacity: 0.26, color: SKY.midColor },
    { position: [-10, 12, -74], scale: [26, 17, 1], opacity: 0.3, color: SKY.horizonColor },
    { position: [12, 18, -98], scale: [22, 14, 1], opacity: 0.2, color: SKY.midColor },
    { position: [-22, 14.5, -115], scale: [24, 15, 1], opacity: 0.24, color: SKY.glowColor },
  ];

  return (
    <group>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.position} scale={p.scale}>
          <spriteMaterial
            map={texture}
            color={p.color}
            transparent
            opacity={p.opacity}
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  );
}

useTexture.preload(TEXTURE_PATHS.cloud);
