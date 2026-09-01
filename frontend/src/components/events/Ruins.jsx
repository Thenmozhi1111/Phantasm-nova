import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { generateTrackScatter } from '../../utils/rng';
import { events } from '../../data/events';
import { MODEL_PATHS, MODEL_FIT, TRACK, PLATFORM } from './config';

/**
 * Procedurally scattered along the whole track (deterministic seed, so the
 * layout is stable across reloads).
 *
 * Two things keep these ruins from merging into the glowing event-gate
 * arches (TRACK.eventSideOffset = 12, plus their spurs reaching further
 * out still) — previously xRange started at 10.5, well inside that
 * footprint, which is why a temple piece would regularly land right
 * beside/behind a gate:
 *   1. xRange now starts well past eventSideOffset, with a gap left over
 *      for the spur's own width.
 *   2. avoidZ/avoidRadius drop any ruin that would land within a gate's
 *      own Z range, so a piece can't sit right in front of/behind a gate
 *      just because it happened to land at the same distance down the
 *      track, even out at this wider X.
 */
export default function Ruins() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.temple, MODEL_FIT.temple);

  const layout = useMemo(
    () =>
      generateTrackScatter({
        seed: 42,
        startZ: -6,
        // Was cameraEndZ - 10 — that ran almost the full length of the
        // track, piling temple pieces up right next to the end platform.
        // Stop with a real buffer before it instead.
        endZ: PLATFORM.endZ + PLATFORM.length / 2 + 22,
        clusterSpacing: 16,
        itemsPerCluster: 2,
        xRange: [TRACK.eventSideOffset + 9, TRACK.eventSideOffset + 19],
        scaleRange: [0.8, 1.3],
        avoidZ: [...events.map((ev) => ev.z), PLATFORM.startZ, PLATFORM.endZ],
        avoidRadius: 11,
      }),
    []
  );

  const instances = useMemo(
    () => layout.map((item, i) => ({ key: i, clone: cloneGltfScene(scene), ...item })),
    [scene, layout]
  );

  return (
    <group>
      {instances.map((item) => (
        <group key={item.key} position={item.pos} rotation={[0, item.rot, 0]} scale={item.scale}>
          <group scale={fit.scale}>
            <primitive object={item.clone} position={fit.offset} />
          </group>
        </group>
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.temple);