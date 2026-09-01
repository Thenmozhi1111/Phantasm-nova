import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { generateTrackScatter } from '../../utils/rng';
import { events } from '../../data/events';
import { MODEL_PATHS, MODEL_FIT, SCENERY, PLATFORM } from './config';

/**
 * Ancient trees scattered close alongside the rail (SCENERY.xRange is much
 * narrower than Ruins.jsx's temple scatter, which sits out past the event
 * gates) — these read as trackside landmarks close to the journey itself.
 *
 * avoidZ keeps them clear of every event gate AND both platforms, so a
 * tree can never land in front of a gate's arch or on top of a platform
 * purely by chance.
 */
export default function AncientTree() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.tree, MODEL_FIT.tree);

  const layout = useMemo(
    () =>
      generateTrackScatter({
        seed: 2024,
        startZ: SCENERY.startZ,
        endZ: SCENERY.endZ,
        clusterSpacing: 22,
        itemsPerCluster: 1,
        xRange: SCENERY.xRange,
        scaleRange: [0.8, 1.2],
        avoidZ: [...events.map((ev) => ev.z), PLATFORM.startZ, PLATFORM.endZ],
        avoidRadius: 10,
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

useGLTF.preload(MODEL_PATHS.tree);
