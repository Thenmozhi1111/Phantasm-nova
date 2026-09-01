import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLORS } from './config';

export default function MagicLight({ position = [0, 1.2, 0], intensity = 2.5 }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.intensity = intensity + Math.cos(t * 5 + position[2]) * 0.3;
  });

  return (
    <pointLight
      ref={ref}
      color={COLORS.magic}
      intensity={intensity}
      distance={10}
      decay={2}
      position={position}
    />
  );
}
