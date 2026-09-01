// MobileTimeline.jsx
// The constellation "unrolls" into a single vertical line on small screens.
// Standalone moments get one star; each 1-hour slot gets one star with a
// side-by-side pair-card showing the two parallel events.

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleTimeline } from "../data/scheduleData";

gsap.registerPlugin(ScrollTrigger);

function GlowDot() {
  const ref = useRef(null);
  useEffect(() => {
    const tween = gsap.to(ref.current, {
      opacity: 0.95,
      scale: 1.4,
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => tween.kill();
  }, []);
  return (
    <span className="absolute -left-[26px] top-1 w-3 h-3 flex items-center justify-center">
      <span ref={ref} className="absolute inset-0 rounded-full bg-blue-500/70" style={{ filter: "blur(5px)" }} />
      <span className="relative w-2 h-2 rounded-full bg-white" style={{ boxShadow: "0 0 8px 2px rgba(59,130,246,.7)" }} />
    </span>
  );
}

function EventPairCard({ events }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {events.map((ev) => (
        <div key={ev.id} className="bg-slate-950/70 border border-blue-500/50 rounded-lg px-3 py-2.5">
          <p className="text-[12px] font-semibold text-white leading-tight">{ev.title}</p>
          <p className="text-[10px] text-blue-500 mt-1">{ev.venue}</p>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{ev.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function MobileTimeline() {
  const wrapRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    const tween = gsap.fromTo(
      fillRef.current,
      { height: "0%" },
      {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      }
    );
    return () => tween.scrollTrigger?.kill();
  }, []);

  return (
    <div ref={wrapRef} className="relative pl-8">
      <div className="absolute left-[7px] top-2 bottom-6 w-[2px] bg-blue-500/30" />
      <div
        ref={fillRef}
        className="absolute left-[7px] top-2 w-[2px] bg-blue-500"
        style={{ boxShadow: "0 0 8px rgba(59,130,246,.7)" }}
      />

      {scheduleTimeline.map((item) => {
        if (item.type === "node") {
          return (
            <div key={item.id} className="relative pb-10">
              <GlowDot />
              <div className="time-scroll">
                <span className="text-[10px] tracking-widest text-blue-500 font-body">{item.time}</span>
              </div>
              <p className="text-[15px] font-semibold text-white mt-0.5">{item.title}</p>
              {item.venue && <p className="text-[11px] text-slate-400 mt-0.5">{item.venue}</p>}
              <p className="text-[11px] text-slate-500 mt-1 leading-snug max-w-[85%]">{item.desc}</p>
            </div>
          );
        }
        // cluster
        return (
          <div key={item.id} className="relative pb-6">
            <p className="text-[10px] tracking-[3px] text-blue-500/90 font-body mb-3 border border-blue-500/50 inline-block rounded-full px-3 py-1 bg-slate-950/60">
              {item.label}
            </p>
            {item.slots.map((slot) => (
              <div key={slot.id} className="relative pb-8">
                <GlowDot />
                <div className="time-scroll">
                  <span className="text-[10px] tracking-widest text-blue-500 font-body">{slot.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">2 events running in parallel</p>
                <EventPairCard events={slot.events} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
