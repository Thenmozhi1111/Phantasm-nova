import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { generateTrackScatter } from '../../utils/rng';
import { events } from '../../data/events';
import { MODEL_PATHS, MODEL_FIT, SCENERY, PLATFORM } from './config';

/**
 * The ruined-towers-pack model, scattered sparingly close alongside the
 * rail — same exclusion logic as AncientTree.jsx (kept clear of every
 * event gate and both platforms), just a different seed/spacing/scale so
 * the two prop types don't line up or repeat in lockstep with each other.
 */
export default function RuinedTowers() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.towers, MODEL_FIT.towers);

  const layout = useMemo(
    () =>
      generateTrackScatter({
        seed: 5150,
        startZ: SCENERY.startZ - 8,
        endZ: SCENERY.endZ,
        clusterSpacing: 30,
        itemsPerCluster: 1,
        xRange: SCENERY.xRange,
        scaleRange: [0.6, 0.95],
        avoidZ: [...events.map((ev) => ev.z), PLATFORM.startZ, PLATFORM.endZ],
        avoidRadius: 12,
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

useGLTF.preload(MODEL_PATHS.towers);
