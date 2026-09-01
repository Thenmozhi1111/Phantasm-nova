import { useEffect, useRef } from "react";

/**
 * Canvas-based cursor trail — zero React re-renders while moving.
 * Uses a single requestAnimationFrame loop and a fixed particle pool.
 */
export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersReduced || isCoarse) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    let lastEmit = 0;

    const POOL = 90;
    const particles = Array.from({ length: POOL }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 2,
      r: 56,
      g: 189,
      b: 248,
      active: false,
    }));
    let cursor = 0;

    const colors = [
      [56, 189, 248],
      [103, 232, 249],
      [147, 197, 253],
      [255, 255, 255],
    ];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(x, y) {
      const c = colors[(Math.random() * colors.length) | 0];
      const p = particles[cursor];
      cursor = (cursor + 1) % POOL;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.4;
      p.x = x + (Math.random() * 10 - 5);
      p.y = y + (Math.random() * 10 - 5);
      p.vx = Math.cos(angle) * speed * 0.6;
      p.vy = Math.sin(angle) * speed * 0.6 + 0.08;
      p.life = 0;
      p.maxLife = 45 + ((Math.random() * 35) | 0);
      p.size = 2.2 + Math.random() * 3.2;
      p.r = c[0];
      p.g = c[1];
      p.b = c[2];
      p.active = true;
    }

    function onMove(e) {
      const now = performance.now();
      if (now - lastEmit < 24) return;
      lastEmit = now;
      spawn(e.clientX, e.clientY);
      if (Math.random() > 0.35) spawn(e.clientX, e.clientY);
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < POOL; i++) {
        const p = particles[i];
        if (!p.active) continue;
        p.life += 1;
        if (p.life >= p.maxLife) {
          p.active = false;
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        const t = p.life / p.maxLife;
        const alpha = (1 - t) * 0.85;
        const size = p.size * (1 - t * 0.35);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${alpha})`;
        ctx.shadowColor = `rgba(${p.r},${p.g},${p.b},${alpha * 0.7})`;
        ctx.shadowBlur = size * 2.2;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
