import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { MODEL_PATHS } from './config';

const TARGET_DIAMETER = 2.2; // was 3.2 — too large in frame

export default function Moon() {
  const { scene } = useGLTF(MODEL_PATHS.moon);
  const instance = useMemo(() => cloneGltfScene(scene), [scene]);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(instance);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    return {
      scale: TARGET_DIAMETER / maxDim,
      offset: [-center.x, -center.y, -center.z],
    };
  }, [instance]);

  // Give the moon a subtle self-glow independent of scene lighting — it's
  // meant to read as bright regardless of how dark/lit the ground below
  // is, matching the reference art rather than being shaded like terrain.
  useEffect(() => {
    instance.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.emissive = new THREE.Color('#dfe8ff');
        child.material.emissiveIntensity = 0.22; // was 0.5 — was blowing out to a flat white disc
      }
    });
  }, [instance]);

  // Raised above and pushed further out than the tallest scenery piece
  // (gate/towers fit to y=6.5-7) so the disc clears every monument's
  // silhouette instead of settling in behind it. Previously y=5.5 sat
  // below the gate's own height, which is what let it read as "inside"
  // the tower.
  return (
    <group position={[-11, 9.5, -26]}>
      <group scale={scale}>
        <primitive object={instance} position={offset} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.moon);