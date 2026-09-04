// ConstellationPath.jsx
// A single SVG line that draws itself once, when it scrolls into view.
// Used for both the main spine and the small branch lines to each event.

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ConstellationPath({ d, delay = 0, thin = false }) {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      duration: thin ? 0.9 : 1.6,
      delay,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: path,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [d, delay, thin]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke="url(#constellationGradient)"
      strokeWidth={thin ? 1 : 1.4}
      strokeOpacity={thin ? 0.6 : 0.9}
      style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.45))" }}
    />
  );
}
