import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFittedGLTF } from '../../utils/fitModel';
import { buildInstanceGroups } from '../../utils/instanceGltf';
import {
  MODEL_PATHS,
  MODEL_FIT,
  RAILWAY_SEGMENT_LENGTH,
  RAILWAY_SEGMENT_COUNT,
  RAILWAY_LEAD_SEGMENT_COUNT,
} from './config';

const dummy = new THREE.Object3D();
const segmentMatrix = new THREE.Matrix4();
const combined = new THREE.Matrix4();

/**
 * Tiles railway.glb end-to-end along Z.
 *
 * PERFORMANCE REWRITE: the original version cloned the entire GLTF scene
 * graph once per segment (~90-100 segments for a track this long) and
 * mounted each clone as its own <primitive>, i.e. ~90-100 separate draw
 * calls (times however many sub-meshes railway.glb itself contains) for
 * something that is visually the exact same geometry repeated in a
 * straight line. That's exactly the case task section 22/23 calls out:
 * "Where many identical meshes are rendered, investigate <instancedMesh />
 * ... The objective is to reduce draw calls."
 *
 * This version flattens railway.glb into its distinct sub-meshes once
 * (buildInstanceGroups), then renders ONE <instancedMesh> per sub-mesh
 * with instanceCount = total segment count — so the whole tiled railway,
 * however long the journey is, costs a fixed handful of draw calls
 * instead of one per segment. Visual result is identical: same geometry,
 * same materials, same positions.
 *
 * The raw asset's rail direction is along its local X axis (measured
 * bounding box: x≈4.0, z≈2.82 — X is the long axis). We fit against X
 * (see MODEL_FIT.railway) so the scale is correct, then rotate each
 * instance 90° around Y so that local-X (rail direction) lines up with
 * world -Z (the direction the track/camera travels).
 */
export default function Railway() {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.railway, MODEL_FIT.railway);
  const meshRefs = useRef([]);

  const groups = useMemo(() => buildInstanceGroups(scene, fit.scale, fit.offset), [scene, fit]);

  const segmentCount = RAILWAY_LEAD_SEGMENT_COUNT + RAILWAY_SEGMENT_COUNT;

  useEffect(() => {
    for (let g = 0; g < groups.length; g++) {
      const mesh = meshRefs.current[g];
      if (!mesh) continue;

      for (let idx = 0; idx < segmentCount; idx++) {
        const i = idx - RAILWAY_LEAD_SEGMENT_COUNT; // negative = ahead of the gate (+Z)
        const z = -i * RAILWAY_SEGMENT_LENGTH;

        dummy.position.set(0, 0, z);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();

        segmentMatrix.copy(dummy.matrix);
        combined.multiplyMatrices(segmentMatrix, groups[g].matrix);
        mesh.setMatrixAt(idx, combined);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [groups, segmentCount]);

  return (
    <group>
      {groups.map((g, i) => (
        <instancedMesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          args={[g.geometry, g.material, segmentCount]}
          castShadow={g.castShadow}
          receiveShadow={g.receiveShadow}
          frustumCulled={false /* segments span the whole track; per-instance culling isn't available on InstancedMesh */}
        />
      ))}
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.railway);
