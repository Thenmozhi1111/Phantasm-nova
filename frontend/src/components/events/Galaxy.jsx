import { useMemo } from 'react';
import * as THREE from 'three';
import { SKY } from './config';

let cachedTexture = null;

/**
 * The reference art's sky reads as a real night environment (moon, stars,
 * faint cloud haze) rather than empty black. The photographic cloud
 * sprites (SkyClouds.jsx, now removed) were meant to be that texture, but
 * clean, convincing cloud puffs at this scale/lighting were fighting the
 * scene rather than helping it. A soft Milky Way band is a better fit for
 * a night sky like this one anyway — it reads as atmosphere without
 * needing to look like a specific, well-lit cloud shape from a specific
 * angle, which is exactly the part that wasn't landing.
 *
 * Built the same way as SkyBackdrop.jsx's gradient — one canvas, drawn
 * once, cached — so this is a single extra draw call (one sprite) for
 * the whole feature, not a particle system. A diagonal soft band of
 * layered color + a scatter of tiny bright dots for the dense star field
 * inside the band reads convincingly as a galaxy at this distance without
 * needing real astronomical data or an external texture that can fail to
 * load.
 */
function getGalaxyTexture() {
  if (cachedTexture) return cachedTexture;

  const w = 1024;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, w, h);

  // Diagonal band: draw everything relative to a rotated canvas so the
  // band itself is just a horizontal gradient strip, easier to layer than
  // computing a diagonal gradient by hand.
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-0.35);
  ctx.translate(-w / 2, -h / 2);

  // Soft core glow of the band — a few overlapping horizontal gradients
  // of decreasing width/increasing opacity toward the center, so it
  // fades smoothly rather than showing a hard-edged strip.
  const bandLayers = [
    { height: h * 0.62, color: '30, 40, 70', peak: 0.16 },
    { height: h * 0.4, color: '60, 70, 110', peak: 0.24 },
    { height: h * 0.22, color: '150, 160, 200', peak: 0.3 },
    { height: h * 0.1, color: '210, 215, 235', peak: 0.34 },
  ];
  bandLayers.forEach(({ height, color, peak }) => {
    const y0 = h / 2 - height / 2;
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + height);
    grad.addColorStop(0, `rgba(${color}, 0)`);
    grad.addColorStop(0.5, `rgba(${color}, ${peak})`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y0, w, height);
  });

  // A few darker dust-lane patches breaking up the band, so it doesn't
  // read as a flat uniform glow — real Milky Way photos have these
  // mottled dark streaks running through the bright core.
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) {
    const x = (i / 5) * w + Math.random() * 80;
    const y = h / 2 + (Math.random() - 0.5) * h * 0.15;
    const rw = w * (0.12 + Math.random() * 0.08);
    const rh = h * (0.05 + Math.random() * 0.03);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rw);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, rh / rw);
    ctx.translate(-x, -y);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rw, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';

  // Dense scatter of tiny bright points inside/around the band — this is
  // what sells "countless distant stars" rather than "colored smoke".
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * w;
    // Bias toward the vertical center of the band (denser star field
    // where the galactic core glow is brightest).
    const bandBias = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1);
    const y = h / 2 + bandBias * h * 0.28;
    const r = Math.random() * 1.1 + 0.15;
    const a = 0.25 + Math.random() * 0.6;
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  cachedTexture = new THREE.CanvasTexture(canvas);
  cachedTexture.colorSpace = THREE.SRGBColorSpace;
  return cachedTexture;
}

export default function Galaxy() {
  const texture = useMemo(() => getGalaxyTexture(), []);

  return (
    // Big enough to span most of the visible sky dome, positioned like
    // the old cloud layer was — high and far — but as one sprite instead
    // of several, additively blended so it brightens the gradient sky
    // underneath rather than covering it like an opaque cloud would.
    <sprite position={[10, 30, -SKY.domeRadius * 0.55]} scale={[220, 220, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.55}
        depthWrite={false}
        fog={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}
