import * as THREE from 'three';

let cached = null;

/**
 * A soft radial-gradient texture, generated once and shared by every
 * TorchGlow sprite. Used to fake torch glow without an actual THREE.Light
 * — see TorchGlow.jsx for why that distinction matters here.
 */
export function getGlowTexture() {
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  cached = new THREE.CanvasTexture(canvas);
  return cached;
}