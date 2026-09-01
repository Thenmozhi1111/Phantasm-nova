import { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK, SIGN } from './config';

// Built once and shared by every sign instance — an arrow-shaped board:
// a rectangular body with a triangular point on one end, extruded to a
// thin board.
function buildArrowGeometry() {
  const bodyLen = 1.5;
  const tipLen = 0.55;
  const halfH = 0.28;

  const shape = new THREE.Shape();
  shape.moveTo(0, -halfH);
  shape.lineTo(bodyLen, -halfH);
  shape.lineTo(bodyLen + tipLen, 0);
  shape.lineTo(bodyLen, halfH);
  shape.lineTo(0, halfH);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false });
}

let cachedArrowGeometry = null;
function getArrowGeometry() {
  if (!cachedArrowGeometry) cachedArrowGeometry = buildArrowGeometry();
  return cachedArrowGeometry;
}

/**
 * Wooden trail-marker at the point an event's spur forks off the main
 * line — a plain arrow board aimed at that event's gate. No label, no
 * dedicated lamp: it's lit by whatever ambient/moon light already
 * reaches it, same as the ground and ruins around it.
 */
export default function EventSignpost({ z, side }) {
  const arrowGeometry = useMemo(() => getArrowGeometry(), []);

  const gateX = side === 'right' ? TRACK.eventSideOffset : -TRACK.eventSideOffset;
  const dirX = gateX;
  const dirZ = -TRACK.spurLeadIn;
  const len = Math.hypot(dirX, dirZ);
  const boardRotationY = Math.atan2(-dirZ / len, dirX / len);

  const signX = (side === 'right' ? 1 : -1) * SIGN.sideOffset;
  const signZ = z + SIGN.leadIn;

  return (
    <group position={[signX, 0, signZ]}>
      <mesh position={[0, SIGN.postHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, SIGN.postHeight, 0.12]} />
        <meshStandardMaterial color="#3a2717" roughness={0.92} />
      </mesh>

      <group position={[0, SIGN.postHeight - 0.1, 0]} rotation={[0, boardRotationY, 0]}>
        <mesh geometry={arrowGeometry} position={[-0.1, 0, -0.035]} castShadow receiveShadow>
          <meshStandardMaterial color="#6b4326" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}
