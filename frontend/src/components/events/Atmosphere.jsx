import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { COLORS, FOG_DENSITY } from './config';
import Ground from './Ground';
import SkyBackdrop from './SkyBackdrop';
import Galaxy from './Galaxy';
import Moon from './Moon';

const EMBER_COUNT = 70;

export default function Atmosphere() {
  const emberRef = useRef();
  const skyRef = useRef();
  const { camera } = useThree();
  const emberData = useRef(
    Array.from({ length: EMBER_COUNT }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: Math.random() * 6,
      z: Math.random() * 10 - 4,
      speed: 0.15 + Math.random() * 0.25,
    }))
  );

  useFrame((_, delta) => {
    const points = emberRef.current;
    if (points) {
      const positions = points.geometry.attributes.position.array;
      emberData.current.forEach((e, i) => {
        e.y += e.speed * delta;
        if (e.y > 6) e.y = 0;
        positions[i * 3 + 1] = e.y;
      });
      points.geometry.attributes.position.needsUpdate = true;
    }

    // Moon + stars + clouds track the camera every frame — both X and Z,
    // not just Z (X-sync was missing before: the camera has a small idle
    // side-to-side sway, and without matching it here the sky would drift
    // opposite that sway relative to the view — a subtle but real "moving
    // sky" artifact). This is what "static sky" means in practice: locked
    // to the view, not literally motionless in world space, since the
    // camera itself moves ~230 units over the journey.
    if (skyRef.current) {
      skyRef.current.position.z = camera.position.z;
      skyRef.current.position.x = camera.position.x;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={[COLORS.fog, FOG_DENSITY]} />
      {/* Fallback flat colour behind/underneath the gradient sky dome —
          only visible for a frame before SkyBackdrop mounts, or if it's
          ever removed. The dome (inside skyRef below) is what actually
          paints the sky now. */}
      <color attach="background" args={[COLORS.fog]} />

      {/* Soft sky-to-ground fill so shaded faces aren't pure black —
          this was a big contributor to the "dull/flat" look before. */}
      <hemisphereLight args={['#3d5a8a', '#0d0f14', 1.15]} />

      <ambientLight color={COLORS.ambient} intensity={1.55} />
      <directionalLight color={COLORS.moon} intensity={1.3} position={[-6, 10, -4]} />

      <group ref={skyRef}>
        {/* Gradient dome first so everything else in this group renders
            in front of it. Gives the moon/stars/clouds an actual sky to
            sit against instead of a flat colour. */}
        <SkyBackdrop />

        {/* Was a flat-shaded procedural sphere; now the real optimized
            moon asset. Position (-6, 5.5, -20) is the same spot verified
            earlier to clear the camera's downward tilt with margin —
            Moon.jsx handles its own fit/centering internally. */}
        <Moon />

        {/* Slight saturation bump (was 0) so the star field itself picks
            up a hint of color variety consistent with the galaxy band,
            instead of being purely grayscale next to it. */}
        <Stars radius={40} depth={20} count={900} factor={2} saturation={0.2} fade speed={0.15} />
        {/* Replaces the old photographic cloud puffs (SkyClouds.jsx) —
            see Galaxy.jsx for why. */}
        <Galaxy />
      </group>

      {/* Ambient rising embers — static atmosphere fill, cheap (one
          Points object, no per-instance mesh cost). */}
      <points ref={emberRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={EMBER_COUNT}
            array={new Float32Array(emberData.current.flatMap((e) => [e.x, e.y, e.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color={COLORS.ember} size={0.05} transparent opacity={0.75} />
      </points>

      {/* Was a single flat plane, one flat color — replaced with a
          displaced/vertex-colored terrain in Ground.jsx so the ground
          reads as ground rather than a backdrop. */}
      <Ground />
    </>
  );
}