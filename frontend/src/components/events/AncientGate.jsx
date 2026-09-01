import { useGLTF } from '@react-three/drei';
import { useFittedGLTF } from '../../utils/fitModel';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { MODEL_PATHS, MODEL_FIT } from './config';
import { useMemo } from 'react';

export default function AncientGate({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.gate, MODEL_FIT.gate);
  // Must clone: EventGate loads the same URL 8 more times, and useGLTF
  // returns the SAME cached scene object to every caller. A THREE.Object3D
  // can only have one parent — without cloning, only the last gate mounted
  // in the tree actually stays attached, which is why every arch was
  // missing (not just this one).
  const instance = useMemo(() => cloneGltfScene(scene), [scene]);

  return (
    <group position={position} rotation={rotation}>
      <group scale={fit.scale}>
        <primitive object={instance} position={fit.offset} />
      </group>
      {/* No GateVoid here on purpose — the dark backing is for the 8
          event gates only (see EventGate.jsx). On the entrance it was
          reading as a visible black box rather than depth inside the
          opening, and this is also the very first thing on screen, so
          the mismatch was most visible right here. */}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.gate);