import { useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { TEXTURE_PATHS, JOURNEY, CLOUDS } from './config';

/**
 * Thin wispy cloud layer drifting past the moon, matching the reference
 * art. Deliberately the cheapest possible way to do this:
 *
 *   - ONE texture (TEXTURE_PATHS.cloud — defined in config.js already,
 *     just never wired up to anything before)
 *   - CLOUDS.count plain <sprite> meshes, which three.js billboards to
 *     face the camera automatically (no per-frame lookAt math needed)
 *   - no geometry beyond a single quad per sprite, no physics/particles
 *
 * This is atmosphere the player glances past, not something worth a
 * volumetric/shader cloud system — a handful of soft alpha cards reads
 * correctly at the distance/speed they're seen here for a fraction of
 * the cost.
 */
export default function Clouds() {
  const texture = useTexture(TEXTURE_PATHS.cloud);
  const group = useRef();

  const layout = useMemo(() => {
    const trackLength = Math.abs(JOURNEY.cameraEndZ - JOURNEY.cameraStartZ);
    return Array.from({ length: CLOUDS.count }, () => ({
      x: (Math.random() - 0.5) * CLOUDS.spreadX,
      y: CLOUDS.height + Math.random() * CLOUDS.heightJitter,
      z: JOURNEY.cameraStartZ - Math.random() * trackLength,
      scale: CLOUDS.minScale + Math.random() * (CLOUDS.maxScale - CLOUDS.minScale),
      speed: CLOUDS.minSpeed + Math.random() * (CLOUDS.maxSpeed - CLOUDS.minSpeed),
      opacity: CLOUDS.minOpacity + Math.random() * (CLOUDS.maxOpacity - CLOUDS.minOpacity),
    }));
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.children.forEach((sprite, i) => {
      sprite.position.x += layout[i].speed * delta;
      // Wrap around instead of drifting off into the distance forever —
      // keeps the sprite count fixed rather than needing to spawn more.
      const half = CLOUDS.spreadX / 2;
      if (sprite.position.x > half) sprite.position.x = -half;
    });
  });

  return (
    <group ref={group}>
      {layout.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.scale, c.scale * 0.55, 1]}>
          <spriteMaterial map={texture} transparent opacity={c.opacity} depthWrite={false} fog />
        </sprite>
      ))}
    </group>
  );
}

useTexture.preload(TEXTURE_PATHS.cloud);
