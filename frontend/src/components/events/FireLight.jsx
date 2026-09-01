import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLORS } from './config';

/**
 * A warm point light with a subtle flicker, meant to sit near torches
 * baked into the ruin/gate models. Position it manually next to a visible
 * torch mesh rather than lighting empty space.
 */
export default function FireLight({ position = [0, 1.2, 0], intensity = 2.5 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.intensity = intensity + Math.sin(t * 8 + position[0]) * 0.35;
  });

  return (
    <pointLight
      ref={ref}
      color={COLORS.ember}
      intensity={intensity}
      distance={10}
      decay={2}
      position={position}
    />
  );
}
