import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { useFittedGLTF } from '../../utils/fitModel';
import {
  MODEL_PATHS,
  MODEL_FIT,
  RAILWAY_SEGMENT_LENGTH,
  RAILWAY_SEGMENT_COUNT,
  RAILWAY_LEAD_SEGMENT_COUNT,
} from './config';

/**
 * Tiles railway.glb end-to-end along Z, covering both:
 *  - the "lead-in" stretch in front of the entrance (+Z), so the track is
 *    visible for the whole starting run the camera begins in (including
 *    the start platform) instead of stopping dead at the gate, and
 *  - the long run behind the entrance (-Z) through every event and the
 *    finale, as before.
 *
 * The raw asset's rail direction is along its local X axis (measured
 * bounding box: x≈4.0, z≈2.82 — X is the long axis). We fit against X
 * (see MODEL_FIT.railway) so the scale is correct, then rotate each
 * instance 90° around Y so that local-X (rail direction) lines up with
 * world -Z (the direction the track/camera travels). Without this
 * rotation the segments tile correctly in world space but each individual
 * rail mesh still points sideways, which is why the track was invisible/
 * looked broken before.
 */
export default function Railway() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.railway, MODEL_FIT.railway);

  const segments = useMemo(
    () =>
      Array.from(
        { length: RAILWAY_LEAD_SEGMENT_COUNT + RAILWAY_SEGMENT_COUNT },
        (_, idx) => {
          const i = idx - RAILWAY_LEAD_SEGMENT_COUNT; // negative = ahead of the gate (+Z)
          return {
            key: i,
            z: -i * RAILWAY_SEGMENT_LENGTH,
            clone: cloneGltfScene(scene),
          };
        }
      ),
    [scene]
  );

  return (
    <group>
      {segments.map((seg) => (
        <group key={seg.key} position={[0, 0, seg.z]}>
          <group rotation={[0, Math.PI / 2, 0]}>
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