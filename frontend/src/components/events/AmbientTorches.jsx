import { useMemo } from 'react';
import { makeRng } from '../../utils/rng';
import { JOURNEY, COLORS } from './config';
import TorchGlow from './TorchGlow';

const SPACING = 18; // world units between torch pairs

/**
 * Regularly-spaced glow markers down both sides of the whole track. These
 * were real dynamic PointLights (FireLight/MagicLight) — with ~26 of them
 * along the full journey, that meant ~26 real lights the renderer had to
 * evaluate for every lit fragment anywhere in view, which is a genuine
 * performance cost at this scale, not just a lot of objects. TorchGlow is
 * a plain additive sprite, no Light involved — visually similar glow,
 * none of that cost. Real lights are kept only at the entrance and the
 * event gates, where they're actually illuminating something nearby.
 */
export default function AmbientTorches() {
  const torches = useMemo(() => {
    const rng = makeRng(99);
    const items = [];
    const start = 10;
    const end = JOURNEY.cameraEndZ - 10;
    const count = Math.floor(Math.abs(end - start) / SPACING);

    for (let i = 0; i < count; i++) {
      const z = start - i * SPACING - rng() * 4;
      const x = 5.5 + rng() * 2;
      items.push({ key: i, x, z, warm: i % 2 === 0 });
    }
    return items;
  }, []);

  return (
    <group>
      {torches.map((t) => (
        <TorchGlow
          key={`l-${t.key}`}
          position={[-t.x, 1.1, t.z]}
          color={t.warm ? COLORS.ember : COLORS.magic}
        />
      ))}
      {torches.map((t) => (
        <TorchGlow
          key={`r-${t.key}`}
          position={[t.x, 1.1, t.z - SPACING / 2]}
          color={t.warm ? COLORS.magic : COLORS.ember}
        />
      ))}
    </group>
  );
}