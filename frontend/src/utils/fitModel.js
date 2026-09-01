import * as THREE from 'three';
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * Sketchfab downloads are frequently authored in wildly inconsistent units
 * (a 1-unit-tall gate next to an 11,000-unit-tall minecart is a real
 * example from this project — see chat). Rather than hand-tune a magic
 * scale number per asset that breaks the moment the asset is replaced,
 * measure the model's actual bounding box and fit it to a deliberate
 * target size, recentering its pivot to (0, 0, 0) at ground level.
 *
 * axis:
 *  'y'   - fit by height (architectural pieces: gate, ruins)
 *  'z'   - fit by depth/length (things tiled along the track: railway)
 *  'max' - fit by largest of the three dimensions (irregular props:
 *          minecart, debris, where "height" isn't a meaningful anchor)
 */
export function fitObjectToSize(object, { axis = 'y', target = 1 } = {}) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const current =
    axis === 'x' ? size.x : axis === 'z' ? size.z : axis === 'max' ? Math.max(size.x, size.y, size.z) : size.y;

  const scale = current > 0 ? target / current : 1;

  return {
    scale,
    // Recenter horizontally, drop base to y=0 (assumes model is roughly
    // upright — flag it in review if an asset needs a rotation fix too).
    offset: [-center.x, -box.min.y, -center.z],
    rawSize: size,
  };
}

/**
 * Loads a GLTF and returns { scene, fit } where `fit` is ready to apply as
 * a wrapping <group scale={fit.scale}><primitive position={fit.offset} /></group>.
 * The fit is computed once per loaded scene (useMemo keyed on the scene
 * reference), so cloning that scene for instancing elsewhere still reuses
 * the same fit values correctly since geometry is identical across clones.
 */
export function useFittedGLTF(url, fitOptions) {
  const { scene } = useGLTF(url);
  const fit = useMemo(() => fitObjectToSize(scene, fitOptions), [scene]); // eslint-disable-line react-hooks/exhaustive-deps
  return { scene, fit };
}
