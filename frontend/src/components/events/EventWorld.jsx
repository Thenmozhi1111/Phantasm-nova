import { Suspense, useRef } from 'react';
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

export default function EventWorld({ progress = 0, onSelectEvent }) {
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

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.35,
      }}
    >
      <Suspense fallback={<Loader />}>
        <JourneyCamera progress={progress} cameraState={cameraState} />
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

        <FireLight position={[-4, 1.4, 3]} intensity={3.2} />
        <MagicLight position={[4, 1.4, 3]} intensity={3.2} />
        <FireLight position={[-4, 1.4, getFinaleZ() + 3]} intensity={3.2} />
        <MagicLight position={[4, 1.4, getFinaleZ() + 3]} intensity={3.2} />
      </Suspense>
    </Canvas>
  );
}
