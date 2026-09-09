// StarNode.jsx
// One glowing star on the map: a slow GSAP pulse on the halo, plus a
// hover/tap detail card. Works for both the desktop absolute-positioned
// map and (in a simplified wrapper) the mobile vertical list.

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";

export default function StarNode({
  time,
  title,
  venue,
  desc,
  cardSide = "bottom", // "bottom" | "top" — flips the popover so it never clips off-screen
  size = "md",
}) {
  const glowRef = useRef(null);
  const starRef = useRef(null);
  const cardRef = useRef(null);
  const [open, setOpen] = useState(false);

  // Ambient pulse — one continuous GSAP tween, not CSS, per the animation stack.
  useEffect(() => {
    const tween = gsap.to(glowRef.current, {
      opacity: 0.95,
      scale: 1.45,
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    const starTween = gsap.to(starRef.current, {
      scale: 1.35,
      rotate: 20,
      opacity: 0.55,
      duration: gsap.utils.random(0.9, 1.5),
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: gsap.utils.random(0, 0.6),
    });
    return () =>{
     tween.kill();
     starTween.kill();
    };
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      opacity: open ? 1 : 0,
      y: open ? 0 : cardSide === "bottom" ? 6 : -6,
      duration: open ? 0.28 : 0.18,
      ease: open ? "power2.out" : "power2.in",
      pointerEvents: open ? "auto" : "none",
    });
  }, [open, cardSide]);

const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-[18px] h-[18px]";

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer select-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <span className="relative flex items-center justify-center w-6 h-6">
        <span
          ref={glowRef}
          className="absolute inset-0 rounded-full bg-blue-500/70"
          style={{ filter: "blur(7px)" }}
        />
        <svg
          ref={starRef}
          viewBox="0 0 24 24"
          className={`relative ${starSize}`}
          style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.85))" }}
        >
          <path
            d="M12 0 C12 6 13 10 13 10 C13 10 17 11 24 12 C17 13 13 14 13 14 C13 14 12 18 12 24 C12 18 11 14 11 14 C11 14 7 13 0 12 C7 11 11 10 11 10 C11 10 12 6 12 0 Z"
            fill="#ffffff"
          />
        </svg>
      </span>

      <span className="mt-2 text-[10px] tracking-widest text-blue-500 font-body whitespace-nowrap">
        {time}
      </span>
      <span className="text-[13px] font-semibold text-white font-body whitespace-nowrap">
        {title}
      </span>

      <div
        ref={cardRef}
        className={`absolute left-1/2 -translate-x-1/2 w-52 opacity-0 bg-slate-950/85 border border-blue-500/60
                    rounded-lg px-4 py-3 backdrop-blur-sm text-left z-30 pointer-events-none
                    ${cardSide === "bottom" ? "top-[125%]" : "bottom-[125%]"}`}
      >
        <p className="text-xs font-bold text-blue-500 mb-1">{title}</p>
        <p className="text-[11px] text-slate-300 leading-snug mb-2">{desc}</p>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Venue</span>
          <span className="text-white">{venue}</span>
        </div>
      </div>
    </div>
  );
}
