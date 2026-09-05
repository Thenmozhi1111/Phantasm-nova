import { useEffect, useRef } from 'react';

/**
 * Tracks scroll position within a tall "track" element and exposes a
 * normalized 0-1 progress value AS A REF, not React state.
 *
 * PERFORMANCE REWRITE (task sections 16/19): the original hook called
 * setState on every scroll-driven rAF tick. Since that state was passed
 * straight down into <EventWorld progress={progress} /> → JourneyCamera,
 * every single scroll frame triggered a full React re-render of the
 * entire 3D component tree (Events.jsx → EventWorld → every child JSX
 * element gets diffed) on top of the actual Three.js work already
 * happening inside useFrame. That's the exact anti-pattern called out in
 * the brief:
 *
 *   scroll → React state → entire 3D component rerenders
 *
 * instead of the preferred:
 *
 *   scroll → ref/value → Three.js camera/object update
 *
 * JourneyCamera (and anything else that needs "where are we in the
 * journey") now reads `progressRef.current` directly inside its own
 * useFrame — always up to date, zero React re-renders caused by scrolling
 * itself. Consumers that DO need to re-render on progress changes (the
 * intro-text fade, the journey tracker highlight) read this same ref
 * from a rAF loop and update the DOM directly instead of via setState —
 * see Events.jsx.
 */
export function useJourneyProgress(trackRef) {
  const progressRef = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    function measure() {
      const el = trackRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const raw = total > 0 ? scrolled / total : 0;
      progressRef.current = Math.min(1, Math.max(0, raw));
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

  return progressRef;
}
