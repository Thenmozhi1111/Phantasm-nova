import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { events } from '../../data/events';
import { MODEL_PATHS, MODEL_FIT, RAILWAY_SEGMENT_LENGTH, TRACK } from './config';

// Spur geometry constants moved to TRACK.spurLeadIn/spurOvershoot in
// config.js — trackLayout.js needs the exact same numbers to compute each
// gate's facing rotation, so they live in one shared place now rather
// than as local consts here that could silently drift out of sync with
// the gate rotation logic.

/**
 * For each event, a rail spur forking off the main line (x=0) and running
 * up to that event's gate — a single APPROACH leg, mainline joint to the
 * gate's position, angled diagonally.
 *
 * There used to be a second "through" leg continuing past the gate along
 * its own facing direction, on the idea that the track should visibly run
 * through the opening. In practice it just showed up as a stray extra
 * length of rail behind/through each arch leading nowhere (clicking a
 * gate hands off to a separate static page — nothing ever travels that
 * stretch), so it's removed. The spur now simply ends at the gate it
 * leads into.
 */
export default function DivergingTracks() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.railway, MODEL_FIT.railway);

  const allSegments = useMemo(() => {
    const segs = [];

    events.forEach((ev) => {
      const startX = 0;

      // Snap the fork's start Z to an actual joint between two main-line
      // segments (main segments are centered at z=-i*RAILWAY_SEGMENT_LENGTH
      // and span RAILWAY_SEGMENT_LENGTH, so their joints fall at
      // z=-(2+4k)). Without this, the spur could start mid-way through a
      // main segment's mesh, which reads as branching off nothing rather
      // than a clean fork at a rail joint.
      const rawStartZ = ev.z + TRACK.spurLeadIn;
      const half = RAILWAY_SEGMENT_LENGTH / 2;
      const k = Math.round((-rawStartZ - half) / RAILWAY_SEGMENT_LENGTH);
      const startZ = -(half + k * RAILWAY_SEGMENT_LENGTH);

      const gateX = (ev.side === 'right' ? 1 : -1) * TRACK.eventSideOffset;
      const gateZ = ev.z;

      // --- Leg 1: approach, mainline joint -> gate position ---
      const dxA = gateX - startX;
      const dzA = gateZ - startZ;
      const lengthA = Math.hypot(dxA, dzA);
      const dirXA = dxA / lengthA;
      const dirZA = dzA / lengthA;
      // Same mapping as Railway.jsx's base rotation: local +X -> world
      // (cos t, 0, -sin t), so t = atan2(-dz, dx).
      const rotationYA = Math.atan2(-dzA, dxA);
      const countA = Math.max(1, Math.round(lengthA / RAILWAY_SEGMENT_LENGTH));

      for (let i = 0; i < countA; i++) {
        const dist = RAILWAY_SEGMENT_LENGTH * (i + 0.5);
        if (dist > lengthA) break; // don't overshoot into leg 2's territory
        segs.push({
          key: `${ev.id}-a${i}`,
          pos: [startX + dirXA * dist, 0, startZ + dirZA * dist],
          rotationY: rotationYA,
          clone: cloneGltfScene(scene),
        });
      }

    });

    return segs;
  }, [scene]);

  return (
    <group>
      {allSegments.map((seg) => (
        <group key={seg.key} position={seg.pos}>
          <group rotation={[0, seg.rotationY, 0]}>
            <group scale={fit.scale}>
              <primitive object={seg.clone} position={fit.offset} />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.railway);
