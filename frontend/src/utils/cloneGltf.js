import { SkeletonUtils } from 'three-stdlib';

/**
 * Clone a loaded GLTF scene graph for reuse (e.g. repeating ruins/railway
 * segments along the track). Always clone through this helper instead of
 * calling useGLTF() again for the same file — useGLTF caches the parsed
 * GLTF, but the scene graph itself is still shared unless cloned.
 */
export function cloneGltfScene(scene) {
  return SkeletonUtils.clone(scene);
}
