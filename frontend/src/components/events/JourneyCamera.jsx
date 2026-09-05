import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { getCameraTargetZ, getCameraTargetY, getSpeedMultiplier } from '../../utils/journey';
import { JOURNEY } from './config';

// A fixed vertical FOV (the old `fov={42}`) means the HORIZONTAL field of
// view shrinks as the viewport gets narrower — on a portrait phone
// (aspect ~0.5 vs. a landscape ~1.6-1.8), that's roughly a 3x narrower
// horizontal view, which is exactly why the gate (wide relative to tall
// on screen) was cropped out of frame and only became visible by zooming
// the whole page out. Instead we hold the HORIZONTAL fov roughly
// constant and derive the vertical fov (three.js's `fov` prop is always
// vertical) from the current aspect ratio, so the gate's actual width on
// screen stays consistent whether the viewport is a wide desktop window
// or a tall phone screen.
const BASE_VERTICAL_FOV_DEG = 42;
const BASE_ASPECT = 16 / 9;
const MAX_FOV_DEG = 92; // clamp so extremely narrow/tall screens don't fisheye

function computeFov(aspect) {
  if (!aspect || aspect >= BASE_ASPECT) return BASE_VERTICAL_FOV_DEG;
  const baseVFovRad = THREE.MathUtils.degToRad(BASE_VERTICAL_FOV_DEG);
  const targetHFovRad = 2 * Math.atan(Math.tan(baseVFovRad / 2) * BASE_ASPECT);
  const vFovRad = 2 * Math.atan(Math.tan(targetHFovRad / 2) / aspect);
  return Math.min(THREE.MathUtils.radToDeg(vFovRad), MAX_FOV_DEG);
}

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
 *
 * `progressRef` is a plain ref (see useJourneyProgress.js), read fresh
 * every frame here — not a React prop — so scrolling never triggers a
 * React re-render of this component or anything above it; only this
 * useFrame callback (already outside React's render cycle) sees the
 * updated value.
 */
export default function JourneyCamera({ progressRef, cameraState }) {
  const camRef = useRef();
  const { size } = useThree(); // reactive — re-renders (rarely) on resize/orientation change
  const fov = computeFov(size.width / size.height);

  useFrame(() => {
    if (!camRef.current || !cameraState) return;

    // While a gate-click zoom is animating (EventGate.jsx sets this via
    // gsap), back off entirely and let that tween drive the camera
    // directly — otherwise this runs every frame too and fights it.
    if (cameraState.current.locked) return;

    const progress = progressRef ? progressRef.current : 0;
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
      fov={fov}
      position={[0, JOURNEY.cameraStartY, JOURNEY.cameraStartZ]}
      near={0.1}
      far={260}
    />
  );
}

function MathUtils_lerp(a, b, t) {
  return a + (b - a) * t;
}