import { PLATFORM } from './config';

const STONE_LIGHT = '#232a38';
const STONE_DARK = '#161b26';
const TRIM = '#2f3b52';

/**
 * A simple ancient-stone platform, built entirely from primitives so it
 * needs no extra .glb asset and always matches the scene's palette (see
 * STONE_LIGHT/DARK/TRIM above, pulled from the same family of tones as
 * Ground.jsx and the ruins).
 *
 * Just the platform — two raised slabs flanking the track (never on it,
 * see PLATFORM.trackClearance in config.js, which keeps a clear gap
 * either side of the rail centerline for the cart), each with a low back
 * wall and edge trim. No pillars or lights, per feedback — kept minimal.
 *
 * `z` defaults to the start platform's position (PLATFORM.startZ) but can
 * be overridden — EventWorld renders this twice, once for each end of the
 * journey.
 */
export default function Platform({ z = PLATFORM.startZ }) {
  const { length, width, trackClearance, height } = PLATFORM;
  const half = length / 2;
  const sideX = [trackClearance + width / 2, -(trackClearance + width / 2)];

  return (
    <group position={[0, 0, z]}>
      {sideX.map((x, side) => (
        <group key={side} position={[x, 0, 0]}>
          {/* raised slab */}
          <mesh position={[0, height / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[width, height, length]} />
            <meshStandardMaterial color={STONE_LIGHT} roughness={0.85} metalness={0.05} />
          </mesh>
          {/* track-facing edge trim */}
          <mesh position={[side === 0 ? -(width / 2 - 0.04) : width / 2 - 0.04, height + 0.03, 0]} castShadow>
            <boxGeometry args={[0.08, 0.1, length]} />
            <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.15} />
          </mesh>
          {/* low back wall, opposite the track */}
          <mesh
            position={[side === 0 ? width / 2 - 0.15 : -(width / 2 - 0.15), height + 0.55, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.3, 1.1, length]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
          </mesh>
          {/* front step lip so the slab doesn't float over the ground */}
          <mesh position={[0, 0.03, half + 0.18]} receiveShadow>
            <boxGeometry args={[width, 0.06, 0.36]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.03, -half - 0.18]} receiveShadow>
            <boxGeometry args={[width, 0.06, 0.36]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
