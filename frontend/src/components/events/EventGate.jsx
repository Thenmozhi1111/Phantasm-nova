<<<<<<< HEAD
import { useMemo, useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useFittedGLTF } from '../../utils/fitModel';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { MODEL_PATHS, MODEL_FIT, TRACK, COLORS } from './config';
import MagicLight from './MagicLight';
import GateVoid from './GateVoid';
import GatePortal from './GatePortal';

const ZOOM_DURATION = 0.7; // seconds — matches the ~500-800ms spec range

// World-Z distance (same units as MagicLight's proximity cull) at which
// the "Click here to explore" prompt mounts. Roughly 60% of the gap
// between gates (TRACK.eventSpacing = 34), so it appears once the gate
// is clearly the thing in front of you on the approach, not the instant
// it spawns far down the track.
const CTA_REVEAL_RADIUS = 36;

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
  // Mounted only once the camera is actually near this gate — see
  // CTA_REVEAL_RADIUS above and the useFrame check below. Starts false so
  // the prompt isn't sitting (even invisibly) on every one of the 8 gates
  // from the very start of the journey.
  const [ctaNear, setCtaNear] = useState(false);
  const ctaNearRef = useRef(false);
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

  // Same distance-from-camera pattern as MagicLight's light culling
  // (cameraState.current.z vs. this gate's world z), but driving whether
  // the CTA is mounted at all rather than a light's on/off switch. Only
  // calls setState on the rare frame the near/far state actually flips,
  // same as Events.jsx's activeStopIndex — not every frame.
  useFrame(() => {
    if (!cameraState) return;
    const isNear = Math.abs(cameraState.current.z - z) <= CTA_REVEAL_RADIUS;
    if (isNear !== ctaNearRef.current) {
      ctaNearRef.current = isNear;
      setCtaNear(isNear);
    }
  });

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
      {/* cameraState + world-space z (not the local z above, which is
          relative to this gate's own group) lets MagicLight cull itself
          once the camera has moved on — see MagicLight.jsx. */}
      <MagicLight position={[0, 1.3, 1.5]} intensity={hovered ? 5 : 3.6} cameraState={cameraState} worldZ={z} />

      {/* "Click here to explore" prompt, floating above the gate. Plain
          screen-space HTML (not a 3D sprite) so it's always crisp and
          readable regardless of camera distance/angle — occlude={false}
          keeps it visible even if scenery briefly passes in front, since
          its whole purpose is to be a clear, unmissable call-to-action
          rather than a strictly-physical scene element. Click here as
          well as on the gate itself opens the event, and it's marked
          aria-hidden since the gate group already carries the real
          click/keyboard target.

          Only rendered once the camera is within CTA_REVEAL_RADIUS of
          this gate (see ctaNear/useFrame above) — it loads in as the gate
          comes into view on the approach rather than existing the whole
          journey through. */}
      {ctaNear && (
        <Html position={[0, 5, 1.5]} center distanceFactor={10} occlude={false} zIndexRange={[10, 0]}>
          <div className="gate-cta" onClick={handleClick} aria-hidden="true">
            <span className="gate-cta-arrow">↓</span>
            <span className="gate-cta-text">Click here to explore</span>
          </div>
        </Html>
      )}
    </group>
  );
}

=======
import { useMemo, useRef, useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useFittedGLTF } from '../../utils/fitModel';
import { cloneGltfScene } from '../../utils/cloneGltf';
import { MODEL_PATHS, MODEL_FIT, TRACK, COLORS } from './config';
import MagicLight from './MagicLight';
import GateVoid from './GateVoid';
import GatePortal from './GatePortal';

const ZOOM_DURATION = 0.7; // seconds — matches the ~500-800ms spec range

// World-Z distance (same units as MagicLight's proximity cull) at which
// the "Click here to explore" prompt mounts. Roughly 60% of the gap
// between gates (TRACK.eventSpacing = 34), so it appears once the gate
// is clearly the thing in front of you on the approach, not the instant
// it spawns far down the track.
const CTA_REVEAL_RADIUS = 36;

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
  // Mounted only once the camera is actually near this gate — see
  // CTA_REVEAL_RADIUS above and the useFrame check below. Starts false so
  // the prompt isn't sitting (even invisibly) on every one of the 8 gates
  // from the very start of the journey.
  const [ctaNear, setCtaNear] = useState(false);
  const ctaNearRef = useRef(false);
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

  // Same distance-from-camera pattern as MagicLight's light culling
  // (cameraState.current.z vs. this gate's world z), but driving whether
  // the CTA is mounted at all rather than a light's on/off switch. Only
  // calls setState on the rare frame the near/far state actually flips,
  // same as Events.jsx's activeStopIndex — not every frame.
  useFrame(() => {
    if (!cameraState) return;
    const isNear = Math.abs(cameraState.current.z - z) <= CTA_REVEAL_RADIUS;
    if (isNear !== ctaNearRef.current) {
      ctaNearRef.current = isNear;
      setCtaNear(isNear);
    }
  });

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
      {/* cameraState + world-space z (not the local z above, which is
          relative to this gate's own group) lets MagicLight cull itself
          once the camera has moved on — see MagicLight.jsx. */}
      <MagicLight position={[0, 1.3, 1.5]} intensity={hovered ? 5 : 3.6} cameraState={cameraState} worldZ={z} />

      {/* "Click here to explore" prompt, floating above the gate. Plain
          screen-space HTML (not a 3D sprite) so it's always crisp and
          readable regardless of camera distance/angle — occlude={false}
          keeps it visible even if scenery briefly passes in front, since
          its whole purpose is to be a clear, unmissable call-to-action
          rather than a strictly-physical scene element. Click here as
          well as on the gate itself opens the event, and it's marked
          aria-hidden since the gate group already carries the real
          click/keyboard target.

          Only rendered once the camera is within CTA_REVEAL_RADIUS of
          this gate (see ctaNear/useFrame above) — it loads in as the gate
          comes into view on the approach rather than existing the whole
          journey through. */}
      {ctaNear && (
        <Html position={[0, 5, 1.5]} center distanceFactor={10} occlude={false} zIndexRange={[10, 0]}>
          <div className="gate-cta" onClick={handleClick} aria-hidden="true">
            <span className="gate-cta-arrow">↓</span>
            <span className="gate-cta-text">Click here to explore</span>
          </div>
        </Html>
      )}
    </group>
  );
}

>>>>>>> 16840363 (Payment Updated)
useGLTF.preload(MODEL_PATHS.gate);