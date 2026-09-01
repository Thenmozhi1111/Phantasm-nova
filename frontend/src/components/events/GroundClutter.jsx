import { useEffect, useMemo, useRef } from 'react';
import { Object3D } from 'three';
import { generateTrackScatter } from '../../utils/rng';
import { PLATFORM } from './config';

const dummy = new Object3D();

/**
 * Procedural low-poly rock scatter along both sides of the track, for the
 * whole journey length (JOURNEY.cameraEndZ) — no per-track-length manual
 * array to maintain. One InstancedMesh, cheap regardless of how long the
 * track gets.
 */
export default function GroundClutter() {
  const meshRef = useRef();

  const rocks = useMemo(
    () =>
      generateTrackScatter({
        seed: 1337,
        startZ: 4,
        // Was cameraEndZ - 10 — ran almost to the very end, scattering
        // rocks right next to the end platform. Buffer it back.
        endZ: PLATFORM.endZ + PLATFORM.length / 2 + 18,
        clusterSpacing: 10,
        itemsPerCluster: 4,
        xRange: [4.5, 8.5],
        scaleRange: [0.15, 0.5],
        avoidZ: [PLATFORM.startZ, PLATFORM.endZ],
        avoidRadius: 7,
      }),
    []
  );

  useEffect(() => {
    if (!meshRef.current) return;
    rocks.forEach((r, i) => {
      const squash = 0.6;
      dummy.position.set(r.pos[0], r.scale * squash * 0.5, r.pos[2]);
      dummy.rotation.set(0, r.rot, 0);
      dummy.scale.set(r.scale, r.scale * squash, r.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rocks]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, rocks.length]} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#1c2028" roughness={1} flatShading />
    </instancedMesh>
  );
}