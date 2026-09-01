import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { getCameraTargetZ, getCameraTargetY, getSpeedMultiplier } from '../../utils/journey';
import { JOURNEY } from './config';

/**
 * Damped, scroll-driven travel across the whole track. Damping itself is
 * modulated by getSpeedMultiplier(currentZ) — as the camera's *current*
 * position nears any event gate, the per-frame damping shrinks, so the
 * camera visibly slows there and speeds back up once past it. This is
 * distance-based (depends on where the camera actually is), not
 * scroll-velocity-based, so it works the same whether the user scrolls
 * fast or slow.
 *
 * Writes its resolved z/y into `cameraState` (a shared ref from
 * EventWorld) each frame so Minecart can read the exact same authoritative
 * position instead of computing its own — that's what keeps the two in
 * perfect lockstep. Previously the cart snapped straight to a raw scroll
 * value every frame while the camera was damped, which is why the two
 * visibly desynced (cart looked jerky/off-center relative to the smooth
 * camera).
 */
export default function JourneyCamera({ progress = 0, cameraState }) {
  const camRef = useRef();

  useFrame(() => {
    if (!camRef.current || !cameraState) return;

    // While a gate-click zoom is animating (EventGate.jsx sets this via
    // gsap), back off entirely and let that tween drive the camera
    // directly — otherwise this runs every frame too and fights it.
    if (cameraState.current.locked) return;

    const targetZ = getCameraTargetZ(progress);
    const targetY = getCameraTargetY(progress);
    const speed = getSpeedMultiplier(cameraState.current.z);
    const damping = JOURNEY.cameraDamping * speed;

    cameraState.current.z = MathUtils_lerp(cameraState.current.z, targetZ, damping);
    cameraState.current.y = MathUtils_lerp(cameraState.current.y, targetY, damping);
    cameraState.current.speed = speed;

    // Small idle sway, layered on top of the travel.
    const t = performance.now() * 0.00015;
    camRef.current.position.set(Math.sin(t) * 0.3, cameraState.current.y, cameraState.current.z);

    // Look-at point is deliberately tied to where the minecart actually
    // sits (JOURNEY.minecartLead ahead, at ground level) rather than an
    // arbitrary fixed offset — that mismatch (lookAt 10 units ahead while
    // the cart sat only 5 units ahead) is what pushed the cart toward the
    // bottom edge of frame before. Looking a bit past the cart (+4) keeps
    // it in the lower-middle of frame with headroom to see what's ahead.
    const lookAheadZ = cameraState.current.z - (JOURNEY.minecartLead + 4);
    const lookAtY = cameraState.current.y * 0.35; // tilt down toward track level
    camRef.current.lookAt(0, lookAtY, lookAheadZ);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={42}
      position={[0, JOURNEY.cameraStartY, JOURNEY.cameraStartZ]}
      near={0.1}
      far={260}
    />
  );
}

function MathUtils_lerp(a, b, t) {
  return a + (b - a) * t;
}