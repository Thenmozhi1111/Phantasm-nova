import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import { generateTrackScatter } from '../../utils/rng';
import { MODEL_PATHS, MODEL_FIT, PLATFORM } from './config';

// Used sparingly, per the brief — wide spacing, few per cluster.
export default function Debris() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.debris, MODEL_FIT.debris);

  const layout = useMemo(
    () =>
      generateTrackScatter({
        seed: 777,
        startZ: -10,
        // Was cameraEndZ - 10 — ran almost to the very end, landing
        // debris right next to the end platform. Buffer it back.
        endZ: PLATFORM.endZ + PLATFORM.length / 2 + 20,
        clusterSpacing: 20,
        itemsPerCluster: 1,
        xRange: [3, 6.5],
        scaleRange: [0.6, 1.0],
        avoidZ: [PLATFORM.startZ, PLATFORM.endZ],
        avoidRadius: 8,
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

useGLTF.preload(MODEL_PATHS.debris);