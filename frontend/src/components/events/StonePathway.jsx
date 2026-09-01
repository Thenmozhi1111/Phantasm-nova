import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { makeRng } from '../../utils/rng';
import { PATHWAY, JOURNEY } from './config';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

/**
 * Procedural flagstone tiles flanking the railway — built from a plain
 * BoxGeometry rather than the uploaded pathway asset (see prior note:
 * that asset renders as domed boulders once tiled, not flat pavers).
 *
 * Reworked to match the reference art (dense, glossy, near-seamless wet
 * flagstone) rather than the previous "scattered slabs" look:
 *   - tiles sized/spaced tighter so grout lines read as thin seams, not
 *     visible gaps between separate slabs
 *   - size variance widened (not just uniform jitter) so the pattern
 *     reads as irregular cut stone rather than a repeating grid
 *   - MeshPhysicalMaterial + clearcoat for the wet-stone sheen/reflection
 *     in the reference — MeshStandardMaterial has no clearcoat layer, so
 *     it can only ever look matte no matter how low roughness goes
 *
 * Still one InstancedMesh, one draw call, regardless of tile count.
 */
export default function StonePathway() {
  const meshRef = useRef();

  const tiles = useMemo(() => {
    const rng = makeRng(2024);
    const items = [];
    const rowSpacing = PATHWAY.tileTargetSize * PATHWAY.rowSpacingFactor;
    const startZ = 8;
    const endZ = JOURNEY.cameraEndZ - 10;
    const rowCount = Math.ceil(Math.abs(endZ - startZ) / rowSpacing);

    for (let row = 0; row < rowCount; row++) {
      const z = startZ - row * rowSpacing - rng() * 0.3;
      PATHWAY.columnOffsets.forEach((colX) => {
        [-1, 1].forEach((sign) => {
          items.push({
            x: sign * colX + (rng() - 0.5) * 0.25,
            z: z + (rng() - 0.5) * 0.25,
            rotY: (rng() - 0.5) * 0.18,
            // Wider size variance (was a tight 0.85-1.15 band) so
            // neighboring tiles read as irregularly-cut stone rather than
            // a uniform grid once packed this tightly.
            scaleX: 0.75 + rng() * 0.55,
            scaleZ: 0.75 + rng() * 0.55,
            heightJitter: rng() * 0.025,
            shade: 0.7 + rng() * 0.4,
          });
        });
      });
    }
    return items;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    tiles.forEach((t, i) => {
      dummy.position.set(t.x, -0.02 + t.heightJitter, t.z);
      dummy.rotation.set(0, t.rotY, 0);
      dummy.scale.set(t.scaleX, 1, t.scaleZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Per-instance gray-scale variation, pushed slightly cooler/darker
      // on average so the clearcoat highlight has contrast to read
      // against, matching the reference's dark-wet-stone base tone.
      color.setRGB(0.16 * t.shade, 0.18 * t.shade, 0.22 * t.shade);
      mesh.setColorAt(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [tiles]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, tiles.length]} receiveShadow castShadow>
      {/* was *0.42 — tightened to *0.48 so tiles pack closer together,
          leaving thin grout seams instead of open gaps at this density */}
      <boxGeometry args={[PATHWAY.tileTargetSize * 0.48, 0.1, PATHWAY.tileTargetSize * 0.48]} />
      <meshPhysicalMaterial roughness={0.45} clearcoat={0.6} clearcoatRoughness={0.25} envMapIntensity={1.1} />
    </instancedMesh>
  );
}
