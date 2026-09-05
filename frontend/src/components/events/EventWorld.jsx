import { Suspense, useRef, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Atmosphere from './Atmosphere';
import AncientGate from './AncientGate';
import Railway from './Railway';
import Platform from './Platform';
import EventScenery from './EventScenery';
import Minecart from './Minecart';
import EventGates from './EventGates';
import EventSignposts from './EventSignposts';
import DivergingTracks from './DivergingTracks';
// StonePathway.jsx removed — its InstancedMesh of tiles is what was
// rendering as the wide grid of pale, washed-out slabs (MeshPhysicalMaterial
// clearcoat under this scene's bright ambient/hemisphere lights). Ground.jsx
// now paints both the paved walkway and the rough ground around it into one
// unified mesh instead — see Ground.jsx and the GROUND block in config.js.
//
// Cloud sprites (Clouds.jsx, then SkyClouds.jsx) are gone entirely now —
// see Galaxy.jsx for the procedural Milky Way band that replaced them in
// Atmosphere.jsx.
// AmbientTorches (glow sprites) removed per feedback — the floating orb
// look wasn't landing. Local illumination along the mid-track is now
// carried entirely by the global ambient/hemisphere/directional lights in
// Atmosphere.jsx plus the real lights at the entrance, event gates, and
// direction signs.
import FireLight from './FireLight';
import MagicLight from './MagicLight';
import JourneyCamera from './JourneyCamera';
import Loader from './Loader';
import { JOURNEY, PLATFORM } from './config';
import { getFinaleZ } from '../../utils/trackLayout';
import { useQuality } from '../../performance/PerformanceProvider';
import PerformanceMonitor from '../../performance/PerformanceMonitor';

/**
 * Wrapped in React.memo: Events.jsx re-renders occasionally for non-3D
 * reasons (the journey-tracker highlight advancing to the next stop) —
 * without memo, every one of those re-renders would re-diff this entire
 * component's JSX tree even though none of its actual props changed
 * (progressRef is a stable ref identity; onSelectEvent is stable via
 * useCallback in Events.jsx). memo skips that diff entirely.
 */
function EventWorld({ progressRef, onSelectEvent }) {
  // Single authoritative camera position, written by JourneyCamera each
  // frame and read by Minecart — see JourneyCamera.jsx for why this
  // (rather than each component computing its own position from
  // `progress`) is what keeps camera and cart in perfect lockstep.
  // `locked` additionally pauses that per-frame update while a gate-click
  // zoom (EventGate.jsx) is animating the camera directly.
  const cameraState = useRef({
    z: JOURNEY.cameraStartZ,
    y: JOURNEY.cameraStartY,
    speed: 1,
    locked: false,
  });

  const { quality } = useQuality();

  return (
    <Canvas
      // Section 9 — DPR/antialias/renderer settings all come from the
      // active quality tier instead of one fixed desktop-oriented config.
      // Mobile is capped at 0.75–1x device pixel ratio (task section 9):
      // rendering a modern phone at its full physical pixel density was
      // pure wasted GPU fill-rate for a scene this dark/atmospheric.
      shadows={quality.shadows}
      dpr={quality.dpr}
      gl={{
        antialias: quality.antialias,
        // 'high-performance' forces a discrete GPU on laptops that have
        // one, which is what we want on HIGH; on LOW we ask for
        // 'low-power' instead, since battery/thermal headroom matters
        // more than peak throughput on a phone.
        powerPreference: quality.powerPreference,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.35,
        // Never needed for this scene (nothing reads back the canvas
        // pixels) and keeping it off avoids an extra framebuffer copy
        // every frame — a real, if small, per-frame GPU cost.
        preserveDrawingBuffer: false,
      }}
    >
      <Suspense fallback={<Loader />}>
        <PerformanceMonitor />
        <JourneyCamera progressRef={progressRef} cameraState={cameraState} />
        <Atmosphere />

        <AncientGate position={[0, 0, 0]} />
        {/* Exit arch — same model/style as the entrance, standing just
            past the last event gate and before the end platform/cart
            stop, so the journey closes the way it opened. */}
        <AncientGate position={[0, 0, getFinaleZ()]} />
        <Railway />
        <Platform z={PLATFORM.startZ} />
        <Platform z={PLATFORM.endZ} />
        <DivergingTracks />
        <EventScenery />
        <EventGates onSelect={onSelectEvent} cameraState={cameraState} />
        <EventSignposts />
        {/* AmbientTorches removed — see note near the import. */}
        <Minecart cameraState={cameraState} />

        {/* Entrance/exit torch pairs — proximity-culled the same way as
            the event-gate lights (see MagicLight/FireLight's own
            cameraState + lightCullRadius handling) so only the pair the
            camera is actually near is ever active (task section 11). */}
        <FireLight position={[-4, 1.4, 3]} intensity={3.2} cameraState={cameraState} />
        <MagicLight position={[4, 1.4, 3]} intensity={3.2} cameraState={cameraState} />
        <FireLight position={[-4, 1.4, getFinaleZ() + 3]} intensity={3.2} cameraState={cameraState} />
        <MagicLight position={[4, 1.4, getFinaleZ() + 3]} intensity={3.2} cameraState={cameraState} />
      </Suspense>
    </Canvas>
  );
}

export default memo(EventWorld);
