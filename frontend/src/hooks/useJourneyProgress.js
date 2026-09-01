import { useEffect, useRef, useState } from 'react';

/**
 * Tracks scroll position within a tall "track" element and exposes a
 * normalized 0-1 progress value, plus a raw (unsmoothed) velocity-ish
 * delta useful for deciding how fast the intro text should fade.
 *
 * Stage 1: only used to fade the intro copy.
 * Stage 3: the same `progress` value will drive camera + minecart position
 * along the railway spline — no change needed here, consumers just read it.
 */
export function useJourneyProgress(trackRef) {
  const [progress, setProgress] = useState(0);
  const rafId = useRef(null);

  useEffect(() => {
    function measure() {
      const el = trackRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      const clamped = Math.min(1, Math.max(0, raw));
      setProgress(clamped);
    }

    function onScroll() {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        measure();
        rafId.current = null;
      });
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [trackRef]);

  return progress;
}
