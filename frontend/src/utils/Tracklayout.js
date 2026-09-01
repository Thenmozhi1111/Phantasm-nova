import { TRACK } from '../components/events/config';

/**
 * Returns [{ z, side, facingY }] for every event gate, alternating
 * right/left starting with right, at regular intervals — matches TRACK in
 * config.js. `facingY` is the gate's rotation so its archway opening
 * faces back along the spur that leads into it (derived from the exact
 * same spur geometry DivergingTracks.jsx uses to draw the rail, via
 * TRACK.spurLeadIn/spurOvershoot) — without this the gate keeps its
 * default orientation (matching the entrance, facing +Z) regardless of
 * which direction the spur actually approaches from, which is why the
 * track and the arch opening didn't line up.
 *
 * Anything that needs to know where an event physically sits (data layer,
 * EventGates, camera slowdown) calls this instead of hardcoding numbers.
 */
export function getEventTrackPositions() {
  return Array.from({ length: TRACK.eventCount }, (_, i) => {
    const side = i % 2 === 0 ? 'right' : 'left';
    const z = TRACK.eventStartZ - i * TRACK.eventSpacing;

    // Same start/end points DivergingTracks.jsx computes for this event's
    // spur (start on the main line, LEAD_IN before the gate; end at the
    // gate's X, OVERSHOOT past its Z).
    const dx = (side === 'right' ? 1 : -1) * TRACK.eventSideOffset;
    const dz = -(TRACK.spurLeadIn + TRACK.spurOvershoot);
    const dirX = dx / Math.hypot(dx, dz);
    const dirZ = dz / Math.hypot(dx, dz);

    // Rotation so the gate's default-facing direction (+Z, same as the
    // unrotated entrance) points back along -dir — i.e. toward wherever
    // the spur is arriving from, so approaching along the spur looks
    // straight into the opening. See EventGate.jsx for the derivation.
    const facingY = Math.atan2(-dirX, -dirZ);

    return { z, side, facingY };
  });
}

export function getFinaleZ() {
  const positions = getEventTrackPositions();
  const lastZ = positions[positions.length - 1]?.z ?? TRACK.entranceZ;
  return lastZ - TRACK.finaleSpacing;
}