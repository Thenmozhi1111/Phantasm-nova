import { useMemo } from 'react';
import * as THREE from 'three';
import { JOURNEY, GROUND } from './config';

// Simple deterministic hash — same trick used elsewhere in this scene —
// keyed by grid cell so neighbouring slabs get stable-but-uncorrelated
// height/tone instead of a smooth wave rolling across the whole ground.
function hash(ix, iz) {
  const s = Math.sin(ix * 12.9898 + iz * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function buildStrip({ xMin, xMax, zMin, zMax, cellSize, colorA, colorB, groove, heightScale }) {
  const width = xMax - xMin;
  const length = zMax - zMin;
  const segsPerCell = 2.2;
  const segsX = Math.max(2, Math.round((width / cellSize) * segsPerCell));
  const segsZ = Math.max(2, Math.round((length / cellSize) * segsPerCell));

  const geo = new THREE.PlaneGeometry(width, length, segsX, segsZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(xMin + width / 2, 0, zMin + length / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cA = new THREE.Color(colorA);
  const cB = new THREE.Color(colorB);
  const cG = new THREE.Color(groove);
  const grooveWidth = 0.16;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    const cellX = Math.floor(x / cellSize);
    const cellZ = Math.floor(z / cellSize);
    const fx = x / cellSize - cellX;
    const fz = z / cellSize - cellZ;

    const edgeDist = Math.min(fx, 1 - fx, fz, 1 - fz) / grooveWidth;
    const inGroove = edgeDist < 1;

    const slabHeight = (hash(cellX, cellZ) - 0.5) * heightScale;
    const grooveDepth = inGroove ? (1 - edgeDist) * heightScale * 0.6 : 0;
    pos.setY(i, slabHeight - grooveDepth);

    const tone = cA.clone().lerp(cB, hash(cellX + 11, cellZ + 7));
    const c = inGroove ? tone.clone().lerp(cG, 1 - edgeDist) : tone;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * The flagstone pathway now covers the full ground width instead of just
 * a narrow centre strip flanked by a separate coarse "rough ground"
 * region — that outer region is what was reading as flat, pale, and
 * textureless in-scene (its wider cell size and lower contrast washed
 * out under this scene's bright ambient/hemisphere lighting). One
 * consistent flagstone treatment edge-to-edge avoids that mismatch
 * entirely. Colors are pulled a bit darker than before for the same
 * reason — more headroom before that lighting brightens them out.
 *
 * Still one static geometry, built once via useMemo — no per-frame cost.
 */
export default function Ground() {
  const geometry = useMemo(() => {
    const zMin = JOURNEY.cameraEndZ - 40;
    const zMax = JOURNEY.cameraStartZ + 40;
    const half = GROUND.width / 2;

    return buildStrip({
      xMin: -half,
      xMax: half,
      zMin,
      zMax,
      cellSize: GROUND.pathCellSize,
      colorA: '#12151d',
      colorB: '#1d2430',
      groove: '#05070c',
      heightScale: 0.09,
    });
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.68} metalness={0.04} />
    </mesh>
  );
}
