import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLORS } from './config';
import { useQuality } from '../../performance/PerformanceProvider';

/**
 * See FireLight.jsx for the full explanation of the cameraState/
 * lightCullRadius proximity culling — this is the same mechanism, used
 * for the cool-colored "magic" torch pairs and every event gate's portal
 * light (EventGate.jsx passes cameraState through here too).
 */
export default function MagicLight({ position = [0, 1.2, 0], intensity = 2.5, cameraState, worldZ }) {
  const ref = useRef();
  const { quality } = useQuality();
  // worldZ overrides position[2] for the distance check when this light
  // sits inside a rotated/translated parent group (event gates) — its
  // local z is meaningless for "how far is this from the camera along
  // the track", so the caller supplies the gate's actual world Z instead.
  const cullZ = worldZ ?? position[2];

  useFrame(({ clock }) => {
    if (!ref.current) return;

    if (cameraState) {
      const dist = Math.abs(cameraState.current.z - cullZ);
      ref.current.visible = dist <= quality.lightCullRadius;
      if (!ref.current.visible) return;
    }

    const t = clock.getElapsedTime();
    ref.current.intensity = intensity + Math.cos(t * 5 + position[2]) * 0.3;
  });

  return (
    <pointLight
      ref={ref}
      color={COLORS.magic}
      intensity={intensity}
      distance={10}
      decay={2}
      position={position}
    />
  );
}
