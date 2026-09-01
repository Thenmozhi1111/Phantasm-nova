import { useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useFittedGLTF } from '../../utils/fitModel';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { MODEL_PATHS, MODEL_FIT, TRACK, COLORS } from './config';
import MagicLight from './MagicLight';
import GateVoid from './GateVoid';
import GatePortal from './GatePortal';

const ZOOM_DURATION = 0.7; // seconds — matches the ~500-800ms spec range

/**
 * Clicking the gate pushes the camera in through the arch, then hands off
 * to the static event page once the push completes. `cameraState.locked`
 * is set so JourneyCamera's own per-frame scroll-driven update backs off
 * and doesn't fight this tween — see JourneyCamera.jsx.
 */
export default function EventGate({ z, side, code, id, facingY = 0, onSelect, cameraState }) {
  const { scene, fit } = useFittedGLTF(MODEL_PATHS.gate, MODEL_FIT.eventGate);
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  // Same fix as AncientGate — this loads the same gate URL as the
  // entrance and 7 other event gates; each instance needs its own clone.
  const instance = useMemo(() => cloneGltfScene(scene), [scene]);

  const x = side === 'right' ? TRACK.eventSideOffset : -TRACK.eventSideOffset;

  // Unit vector the gate's opening faces, derived from the same facingY
  // computed in trackLayout.js (facingY rotates local +Z, so this is just
  // that rotation applied to (0,0,1)). Used to place the zoom camera
  // "standing in front of the opening" and look through it, rather than
  // assuming the gate faces +Z like the unrotated entrance does.
  const fx = Math.sin(facingY);
  const fz = Math.cos(facingY);

  function handleClick(e) {
    e.stopPropagation();
    if (cameraState) cameraState.current.locked = true;

    gsap.to(camera.position, {
      x: x + fx * 3,
      y: 1.9,
      z: z + fz * 3,
      duration: ZOOM_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => camera.lookAt(x - fx * 3, 2, z - fz * 3),
      onComplete: () => onSelect?.(id),
    });
  }

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, facingY, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group scale={fit.scale}>
        <primitive object={instance} position={fit.offset} />
      </group>
      {/* A dark "void" behind the opening — without this, looking into
          the arch just shows more of the same lit scene continuing
          through it, which reads as an open frame rather than a real
          entrance. Sized narrower/shorter than the stone opening itself
          (was 5 x 5.5, matching or exceeding the actual archway, which
          is what made its edges visible past the stonework as a dark
          box). Still inside the local +Z-facing group, so it turns with
          the gate. */}
      <GateVoid width={1.9} height={2.5} depth={3.5} centerY={1.9} frontZ={-1.1} />
      {/* Every event gate uses the same blue/violet magic portal now —
          previously alternated blue/orange (magic/fire) by even/odd
          event number; per feedback, all 8 event gates should read as
          the blue portal (like the reference image), full stop. */}
      <GatePortal colorA={COLORS.magic} colorB="#8b6bff" z={-0.85} />
      <MagicLight position={[0, 1.3, 1.5]} intensity={hovered ? 5 : 3.6} />

    </group>
  );
}

useGLTF.preload(MODEL_PATHS.gate);