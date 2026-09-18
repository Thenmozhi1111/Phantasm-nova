import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useQuality } from './PerformanceProvider';

/**
 * Mount ONE of these inside <Canvas>. It does two independent jobs:
 *
 *  1. Feeds every frame's delta into the adaptive quality system
 *     (PerformanceProvider.reportFrameTime) so sustained low/high FPS
 *     can step quality down/up (task section 25).
 *  2. Optionally (pass showHud) renders a small on-screen readout of FPS,
 *     frame time, draw calls, triangles, geometries, and textures
 *     (task section 23) by reading renderer.info directly — no React
 *     state involved, so the HUD itself never causes a re-render.
 *     Defaults to OFF (was previously on by default in dev builds, but
 *     that meant it showed up on the live events page during normal
 *     browsing/testing, which isn't where it's needed) — pass
 *     `showHud` explicitly when actively profiling.
 *
 * Both are gated so builds pay zero cost for the HUD DOM
 * node when it's off (it's simply not rendered), while adaptive reporting still runs
 * regardless since that's the actual runtime optimization.
 */
export default function PerformanceMonitor({ showHud = false }) {
  const { gl } = useThree();
  const { reportFrameTime } = useQuality();
  const hudRef = useRef(null);
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((_, delta) => {
    reportFrameTime(delta);

    if (!showHud) return;
    acc.current.frames += 1;
    acc.current.time += delta;

    // Update the DOM text every ~500ms, not every frame — the HUD is a
    // diagnostic aid, not something that itself needs to cost a
    // full text reflow 60 times a second.
    if (acc.current.time >= 0.5 && hudRef.current) {
      const fps = acc.current.frames / acc.current.time;
      const frameMs = (acc.current.time / acc.current.frames) * 1000;
      const info = gl.info;
      hudRef.current.textContent =
        `FPS: ${fps.toFixed(0)}\n` +
        `Frame: ${frameMs.toFixed(1)}ms\n` +
        `Draw Calls: ${info.render.calls}\n` +
        `Triangles: ${(info.render.triangles / 1000).toFixed(0)}K\n` +
        `Geometries: ${info.memory.geometries}\n` +
        `Textures: ${info.memory.textures}`;
      acc.current.frames = 0;
      acc.current.time = 0;
    }
  });

  useEffect(() => {
    // Reset three's internal counters on mount so an HMR reload doesn't
    // show stale accumulated numbers.
    return () => gl.info.reset();
  }, [gl]);

  if (!showHud) return null;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <pre
        ref={hudRef}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          margin: 0,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.6)',
          color: '#6ee7ff',
          font: '11px/1.4 monospace',
          borderRadius: 4,
          whiteSpace: 'pre',
        }}
      >
        …
      </pre>
    </Html>
  );
}
