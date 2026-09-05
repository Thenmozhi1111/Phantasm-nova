import * as THREE from 'three';

/**
 * Flattens a loaded GLTF scene into one entry per unique (geometry,
 * material) pair, each carrying the mesh's local-to-root matrix. Used to
 * turn "the same small model repeated N times along a line" (Railway.jsx)
 * into N-instance <instancedMesh> draw calls — one draw call per distinct
 * sub-mesh in the source model, instead of one draw call per repeated
 * *copy* of the whole model (task sections 22/23: "Where many identical
 * meshes are rendered, investigate <instancedMesh />... reduce draw
 * calls").
 *
 * `fitScale`/`fitOffset` are the same values useFittedGLTF already
 * computes (see fitModel.js) — baked into each entry's base matrix here
 * so callers don't need a separate wrapping <group> per instance.
 */
export function buildInstanceGroups(scene, fitScale, fitOffset) {
  const outerScale = new THREE.Matrix4().makeScale(fitScale, fitScale, fitScale);
  const outerOffset = new THREE.Matrix4().makeTranslation(fitOffset[0], fitOffset[1], fitOffset[2]);
  // Matches the JSX pattern used elsewhere in this project:
  // <group scale={fit.scale}><primitive position={fit.offset} /></group>
  // i.e. scale is applied in the parent, then the child is translated by
  // fit.offset *in the parent's (already-scaled) local space*.
  const fitMatrix = new THREE.Matrix4().multiplyMatrices(outerScale, outerOffset);

  scene.updateMatrixWorld(true);

  const groups = [];
  scene.traverse((child) => {
    if (!child.isMesh) return;
    const localMatrix = new THREE.Matrix4().multiplyMatrices(fitMatrix, child.matrixWorld);
    groups.push({
      geometry: child.geometry,
      material: child.material,
      matrix: localMatrix,
      castShadow: child.castShadow,
      receiveShadow: child.receiveShadow,
    });
  });
  return groups;
}
