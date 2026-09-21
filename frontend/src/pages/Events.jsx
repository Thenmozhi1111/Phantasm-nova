import { useCallback, useEffect, useRef, useState } from 'react';
import EventWorld from '../components/events/EventWorld';
import Navbar from '../components/Navbar';
import { JOURNEY, TRACK } from '../components/events/config';
import { events, journeyStops } from '../data/events';
import { useJourneyProgress } from '../hooks/useJourneyProgress';
import { PerformanceProvider } from '../performance/PerformanceProvider';

// vh of scroll per world-unit of travel. Higher = more scrolling required
// to cross the same distance = more time to look around near each event.
// Tune this one number to change overall journey pacing.
const VH_PER_UNIT = 5;

const totalDistance = JOURNEY.cameraStartZ - JOURNEY.cameraEndZ;
const distanceToGate = JOURNEY.cameraStartZ - TRACK.entranceZ;
const introFadeEnd = distanceToGate / totalDistance;
const trackVh = Math.round((JOURNEY.cameraStartZ - JOURNEY.cameraEndZ) * VH_PER_UNIT);

export default function Events({ onSelectEvent }) {
  const trackRef = useRef(null);
  const progressRef = useJourneyProgress(trackRef);

  // DOM nodes updated directly from the rAF loop below — bypassing React
  // state for anything that changes every scroll frame (task sections 16
  // & 19: "scroll → ref/value → ... update", not "scroll → React state →
  // component rerenders"). Only `activeStopIndex`, which changes at most
  // 8 times across the whole journey, goes through setState.
  const introRef = useRef(null);
  const scrollHintRef = useRef(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const activeStopIndexRef = useRef(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      const progress = progressRef.current;
      const introOpacity = Math.max(0, 1 - progress / introFadeEnd);

      if (introRef.current) {
        introRef.current.style.opacity = introOpacity;
        introRef.current.style.filter = `blur(${(1 - introOpacity) * 8}px)`;
        introRef.current.style.transform = `translate(-50%, calc(-50% + ${(1 - introOpacity) * -24}px))`;
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = introOpacity;
      }

      // Approximate which stop we're nearest to, for the tracker
      // highlight. Only calls setState when the index actually changes,
      // so this re-renders a handful of times total across the whole
      // journey rather than every scroll frame.
      const nextIndex = Math.min(journeyStops.length - 1, Math.floor(progress * journeyStops.length));
      if (nextIndex !== activeStopIndexRef.current) {
        activeStopIndexRef.current = nextIndex;
        setActiveStopIndex(nextIndex);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  // Stable identity across re-renders so EventWorld's React.memo actually
  // skips re-rendering when only `activeStopIndex` above changes.
  const handleSelectEvent = useCallback((id) => onSelectEvent(id), [onSelectEvent]);

  return (
    <PerformanceProvider>
      <Navbar />
      <div ref={trackRef} className="journey-track" style={{ height: `${trackVh}vh` }}>
        <div className="journey-sticky">
          <EventWorld progressRef={progressRef} onSelectEvent={handleSelectEvent} />

          <div className="hero-veil" />

          <div
            ref={introRef}
            className="intro-overlay"
            style={{ top: '50%', left: '50%' }}
          >
            <div className="eyebrow">CSE Symposium</div>
            <h1 className="hero-title">EVENTS</h1>
            <p className="hero-sub">Hop aboard. Explore the events.</p>
          </div>

          <div ref={scrollHintRef} className="scroll-hint">
            <span>Scroll to explore</span>
          </div>

          <div className="journey-tracker">
            {journeyStops.map((stop, i) => (
              <div key={stop} className="tracker-stop" data-active={i === activeStopIndex}>
                <span className="tracker-dot" />
                <span className="tracker-label">{stop}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accessible fallback per the brief: essential interaction must not
          depend only on 3D raycasting. In-world gates are visual landmarks
          today; clicking to open an event still goes through this grid
          until raycasting is wired up in a later pass. */}
      <section className="events-fallback" id="events-list">
        <div className="section-head">
          <div className="section-eyebrow">The Events</div>
          <h2 className="section-title">Eight Trials Await</h2>
        </div>

        <div className="card-grid">
          {events.map((ev) => (
            <button
              key={ev.id}
              className="event-card"
              onClick={() => onSelectEvent(ev.id)}
              aria-label={`Explore ${ev.title}`}
            >
              <div className="card-index">{ev.code} / {String(events.length).padStart(2, '0')}</div>
              <div className="card-type">{ev.type}</div>
              <div className="card-title">{ev.title}</div>
              <p className="card-line">{ev.description}</p>
              <div className="card-foot">Explore Event →</div>
            </button>
          ))}
        </div>
      </section>
    </PerformanceProvider>
  );
}
