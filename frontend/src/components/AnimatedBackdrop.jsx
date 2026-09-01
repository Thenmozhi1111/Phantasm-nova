import { memo, useMemo } from "react";

/**
 * Lightweight live backdrop.
 * - Fewer DOM nodes
 * - Smaller blur radii (cheaper compositing)
 * - CSS animations only, no JS timers
 * - Respects prefers-reduced-motion via CSS
 */
function AnimatedBackdrop() {
  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const seed = (i + 1) * 9301 + 49297;
        const r1 = (Math.sin(seed) + 1) / 2;
        const r2 = (Math.sin(seed * 1.3) + 1) / 2;
        const r3 = (Math.sin(seed * 2.7) + 1) / 2;
        const r4 = (Math.sin(seed * 3.9) + 1) / 2;
        return {
          top: `${(r1 * 100).toFixed(1)}%`,
          left: `${(r2 * 100).toFixed(1)}%`,
          delay: `${(r3 * 4).toFixed(2)}s`,
          size: r4 > 0.8 ? 2 : 1,
          duration: `${(3.5 + r4 * 3).toFixed(2)}s`,
        };
      }),
    [],
  );

  const embers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const seed = (i + 1) * 3571 + 12841;
        const r1 = (Math.sin(seed) + 1) / 2;
        const r2 = (Math.sin(seed * 1.9) + 1) / 2;
        const r3 = (Math.sin(seed * 2.3) + 1) / 2;
        const r4 = (Math.sin(seed * 3.1) + 1) / 2;
        return {
          left: `${(r1 * 100).toFixed(1)}%`,
          delay: `${(r2 * 10).toFixed(2)}s`,
          duration: `${(12 + r3 * 8).toFixed(2)}s`,
          dx: `${(r4 * 70 - 35).toFixed(0)}px`,
          size: 2 + Math.floor(r3 * 3),
          hue: r4 > 0.5 ? "cyan" : "sky",
        };
      }),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden contain-strict"
    >
      <div className="absolute inset-0 bg-[#02040a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.14),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(10,15,30,0.9),transparent_55%)]" />

      {/* Fewer / smaller aura blobs */}
      <div className="absolute -left-24 top-1/4 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[80px] will-change-transform motion-safe:animate-drift-slow" />
      <div className="absolute right-[-8%] top-[18%] h-[300px] w-[300px] rounded-full bg-cyan-400/10 blur-[80px] will-change-transform motion-safe:animate-drift-fast" />

      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={`st-${i}`}
            className="absolute rounded-full bg-sky-200/90 motion-safe:animate-twinkle"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {embers.map((e, i) => (
          <span
            key={`em-${i}`}
            className={`absolute bottom-[-12px] rounded-full will-change-transform motion-safe:animate-ember ${
              e.hue === "cyan" ? "bg-cyan-300/80" : "bg-sky-300/80"
            }`}
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              animationDelay: e.delay,
              animationDuration: e.duration,
              "--dx": e.dx,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#02040a] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#02040a] to-transparent" />
    </div>
  );
}

export default memo(AnimatedBackdrop);
