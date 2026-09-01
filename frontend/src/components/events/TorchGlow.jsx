import * as THREE from 'three';
import { getGlowTexture } from '../../utils/glowTexture';

/**
 * A camera-facing additive-blended glow sprite — no THREE.Light involved.
 * Used for the many distant/decorative torches along the track, where the
 * point is "there's a warm/cool glow here" rather than "this actually
 * illuminates nearby geometry". A real PointLight forces the renderer to
 * evaluate that light for every fragment of every lit material currently
 * in view, regardless of distance — with ~26 of these along the full
 * track, that was a genuine, measurable cost, not a style choice. Sprites
 * have none of that: they're just a textured quad, additively blended.
 *
 * Real PointLights (FireLight/MagicLight) are kept only where they matter:
 * the entrance and the 8 event gates, where actually lighting nearby
 * geometry (and the hover-brighten interaction) is the point.
 */
export default function TorchGlow({ position = [0, 1, 0], color = '#ff8a3d', scale = 1.8 }) {
  return (
    <sprite position={position} scale={[scale, scale, scale]}>
      <spriteMaterial
        map={getGlowTexture()}
        color={color}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}