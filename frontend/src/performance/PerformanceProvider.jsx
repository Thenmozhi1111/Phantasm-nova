import { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { getDeviceInfo } from './device';
import { getQualityConfig, stepDown, stepUp } from './quality';

const PerformanceContext = createContext(null);

/**
 * Wrap the app (or just the events journey) in this once. Everything
 * downstream reads quality via useQuality() instead of re-detecting the
 * device itself — this is the "centralized device/quality system" from
 * task section 4.
 *
 * Also exposes reportFrameTime(), used by the adaptive system inside the
 * Canvas (see AdaptiveQualityMonitor, mounted from EventWorld) to step
 * quality down under sustained low FPS and back up under sustained high
 * FPS — never above the tier the device originally qualified for, and
 * never oscillating frame-to-frame (thresholds + cooldown below).
 */
export function PerformanceProvider({ children, adaptive = true }) {
  const initial = useMemo(() => getDeviceInfo(), []);
  const [tier, setTier] = useState(initial.tier);
  const ceilingTier = initial.tier; // adaptive mode never exceeds the device's own detected tier

  const fpsWindow = useRef([]);
  const lastChangeAt = useRef(0);
  const badStreakStart = useRef(null);
  const goodStreakStart = useRef(null);

  const reportFrameTime = useCallback(
    (deltaSeconds) => {
      if (!adaptive) return;
      const fps = deltaSeconds > 0 ? 1 / deltaSeconds : 60;
      const now = performance.now();

      const win = fpsWindow.current;
      win.push(fps);
      if (win.length > 60) win.shift(); // ~1s at 60fps, more at lower fps (fine — rolling average)
      if (win.length < 20) return; // not enough samples yet

      const avg = win.reduce((a, b) => a + b, 0) / win.length;
      const COOLDOWN_MS = 8000;
      const sinceLastChange = now - lastChangeAt.current;

      if (avg < 35) {
        if (badStreakStart.current == null) badStreakStart.current = now;
        goodStreakStart.current = null;
        const sustained = now - badStreakStart.current > 3000; // FPS < 35 for several seconds
        if (sustained && sinceLastChange > COOLDOWN_MS) {
          setTier((t) => {
            const next = stepDown(t);
            if (next !== t) {
              lastChangeAt.current = now;
              badStreakStart.current = null;
            }
            return next;
          });
        }
      } else if (avg > 55) {
        if (goodStreakStart.current == null) goodStreakStart.current = now;
        badStreakStart.current = null;
        const sustained = now - goodStreakStart.current > 6000; // FPS > 55 consistently
        if (sustained && sinceLastChange > COOLDOWN_MS) {
          setTier((t) => {
            const next = stepUp(t, ceilingTier);
            if (next !== t) {
              lastChangeAt.current = now;
              goodStreakStart.current = null;
            }
            return next;
          });
        }
      } else {
        badStreakStart.current = null;
        goodStreakStart.current = null;
      }
    },
    [adaptive, ceilingTier]
  );

  const quality = useMemo(() => getQualityConfig(tier), [tier]);

  const value = useMemo(
    () => ({
      tier,
      quality,
      deviceCategory: initial.category,
      reportFrameTime,
    }),
    [tier, quality, initial.category, reportFrameTime]
  );

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>;
}

export function useQuality() {
  const ctx = useContext(PerformanceContext);
  if (!ctx) {
    // Sensible default so a component used outside the provider (tests,
    // Storybook, a stray page) still renders instead of crashing.
    const info = getDeviceInfo();
    return { tier: info.tier, quality: getQualityConfig(info.tier), deviceCategory: info.category, reportFrameTime: () => {} };
  }
  return ctx;
}
