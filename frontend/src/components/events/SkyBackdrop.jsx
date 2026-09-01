import { useMemo } from 'react';
import * as THREE from 'three';
import { SKY } from './config';

let cachedTexture = null;

/**
 * The scene had no actual sky — just a flat single-color background
 * (`<color attach="background">` in Atmosphere.jsx) plus fog. The
 * reference art's sky has a real gradient: darker at the top, a lighter
 * glowing band low around the horizon/moon. Without that gradient, the
 * cloud sprites had nothing to blend into — their soft edges faded to
 * transparent and exposed the flat colour underneath, which reads as a
 * cloud-shaped patch pasted on top rather than cloud sitting IN a sky.
 *
 * This paints that gradient once onto a canvas (same self-contained
 * technique as the cloud/torch glow textures elsewhere — no external
 * file that can fail to load) and wraps it on the inside of a large,
 * low-poly sphere that rides with the camera, same as the moon/stars in
 * Atmosphere.jsx's skyRef group.
 */
function getSkyTexture() {
  if (cachedTexture) return cachedTexture;

  const w = 8;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, SKY.zenithColor);
  gradient.addColorStop(0.45, SKY.midColor);
  gradient.addColorStop(0.72, SKY.glowColor);
  gradient.addColorStop(1, SKY.horizonColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.colorSpace = THREE.SRGBColorSpace;
  return cachedTexture;
}

export default function SkyBackdrop() {
  const texture = useMemo(() => getSkyTexture(), []);

  return (
    <mesh>
      {/* Low segment count on purpose — this only ever needs to show a
          soft gradient, never detail, so it costs almost nothing (one
          mesh, one draw call, no lighting computed against it). */}
      <sphereGeometry args={[SKY.domeRadius, 16, 12]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} fog={false} depthWrite={false} />
    </mesh>
  );
}
