import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useFittedGLTF } from '../../utils/fitModel';
import { MODEL_PATHS, MODEL_FIT, JOURNEY } from './config';

/**
 * Reads the camera's already-damped position from `cameraState` (a shared
 * ref written by JourneyCamera each frame) and simply offsets by
 * JOURNEY.minecartLead. This guarantees the cart is always exactly
 * `minecartLead` units ahead of wherever the camera actually is rendered —
 * not wherever scroll progress "says" it should be — so the two can never
 * visibly drift apart regardless of scroll speed or the slowdown-near-events
 * behavior.
 */
export default function Minecart({ cameraState }) {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.minecart, MODEL_FIT.minecart);
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g || !cameraState) return;

    g.position.x = 0; // stays dead-center on the rail, always
    g.position.z = cameraState.current.z - JOURNEY.minecartLead;

    // Subtle vibration/bounce so it reads as physically on the rail
    // rather than floating — deliberately small per the brief.
    const t = clock.getElapsedTime();
    g.position.y = Math.sin(t * 9) * 0.012;
    g.rotation.z = Math.sin(t * 5.5) * 0.006;
    g.rotation.x = Math.cos(t * 4.2) * 0.004;
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI, 0]}>
      <group scale={fit.scale}>
        <primitive object={scene} position={fit.offset} />
      </group>
      <pointLight color="#ffb87a" intensity={1.4} distance={5} decay={2} position={[0, 1, 0]} />
    </group>
  );
}

useGLTF.preload(MODEL_PATHS.minecart);