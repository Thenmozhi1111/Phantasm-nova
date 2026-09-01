import { MathUtils } from 'three';
import { JOURNEY } from '../components/events/config';
import { getEventTrackPositions } from './trackLayout';

const EVENT_ZS = getEventTrackPositions().map((p) => p.z);

// Smoothstep — eases the very start/end of the whole journey rather than
// moving at a constant rate relative to scroll pixels.
export function easeProgress(t) {
  const c = MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/** Where the camera "should" be for a given raw scroll progress (0-1),
 * ignoring per-frame damping/slowdown — this is the target the damped
 * position chases each frame. */
export function getCameraTargetZ(progress) {
  return MathUtils.lerp(JOURNEY.cameraStartZ, JOURNEY.cameraEndZ, easeProgress(progress));
}

export function getCameraTargetY(progress) {
  return MathUtils.lerp(JOURNEY.cameraStartY, JOURNEY.cameraEndY, easeProgress(progress));
}

/**
 * 0-1 multiplier on movement speed based on how close `z` currently is to
 * any event gate. 1 = full speed, JOURNEY.minSpeedMultiplier = right on
 * top of an event. Distance-based, not scroll-based, so it's independent
 * of how fast the user is scrolling — it's about world position.
 */
export function getSpeedMultiplier(z) {
  let nearest = Infinity;
  for (const eventZ of EVENT_ZS) {
    const d = Math.abs(z - eventZ);
    if (d < nearest) nearest = d;
  }
  if (nearest >= JOURNEY.slowdownRadius) return 1;
  const t = nearest / JOURNEY.slowdownRadius; // 0 at gate, 1 at radius edge
  return MathUtils.lerp(JOURNEY.minSpeedMultiplier, 1, t);
}