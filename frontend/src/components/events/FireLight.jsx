import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLORS } from './config';
import { useQuality } from '../../performance/PerformanceProvider';

/**
 * A warm point light with a subtle flicker, meant to sit near torches
 * baked into the ruin/gate models. Position it manually next to a visible
 * torch mesh rather than lighting empty space.
 *
 * Perf note (task section 11): three.js's default forward renderer
 * evaluates every ENABLED light against every lit fragment in the scene,
 * regardless of the light's `distance`/`decay` falloff — a point light
 * 300 units behind the camera still costs the same per-fragment shader
 * work as one right in view. With 8 event gates plus the entrance/exit
 * pairs, that was 10+ always-on dynamic lights. Since the camera only
 * ever travels along a single predictable line (task section 20), we can
 * exploit that directly: when `cameraState` is supplied, this light sets
 * itself `.visible = false` once it's further than the quality tier's
 * `lightCullRadius` from the camera's current Z. Toggling `.visible` on
 * a light removes it from three's per-frame light list entirely (it's
 * not just clipped by falloff), so a culled light costs nothing.
 */
export default function FireLight({ position = [0, 1.2, 0], intensity = 2.5, cameraState }) {
  const ref = useRef();
  const { quality } = useQuality();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    if (cameraState) {
      const dist = Math.abs(cameraState.current.z - position[2]);
      ref.current.visible = dist <= quality.lightCullRadius;
      if (!ref.current.visible) return; // skip the flicker math too — nothing to update
    }

    const t = clock.getElapsedTime();
    ref.current.intensity = intensity + Math.sin(t * 8 + position[0]) * 0.35;
  });

  return (
    <pointLight
      ref={ref}
      color={COLORS.ember}
      intensity={intensity}
      distance={10}
      decay={2}
      position={position}
    />
  );
}
