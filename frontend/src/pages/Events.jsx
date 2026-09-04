import { useRef } from 'react';
import EventWorld from '../components/events/EventWorld';
import Navbar from '../components/Navbar';
import { JOURNEY, TRACK } from '../components/events/config';
import { events, journeyStops } from '../data/events';
import { useJourneyProgress } from '../hooks/useJourneyProgress';

// vh of scroll per world-unit of travel. Higher = more scrolling required
// to cross the same distance = more time to look around near each event.
// Tune this one number to change overall journey pacing.
const VH_PER_UNIT = 5;

export default function Events({ onSelectEvent }) {
  const trackRef = useRef(null);
  const progress = useJourneyProgress(trackRef);

  // Was a fixed 0.15 (fade over the first 15% of the *entire* journey's
  // scroll, gate included) — on a track this long that meant the hero
  // text outlived reaching the entrance by a wide margin. Deriving it
  // from the actual distance to the gate keeps it correct automatically
  // if cameraStartZ or the track layout changes later: the text is
  // fully gone right as the camera reaches TRACK.entranceZ, whatever
  // that distance happens to be.
  const totalDistance = JOURNEY.cameraStartZ - JOURNEY.cameraEndZ;
  const distanceToGate = JOURNEY.cameraStartZ - TRACK.entranceZ;
  const introFadeEnd = distanceToGate / totalDistance;
  const introOpacity = Math.max(0, 1 - progress / introFadeEnd);

  // Track height now scales with the actual journey distance (config.js),
  // so adding/removing events changes this automatically.
  const trackVh = Math.round((JOURNEY.cameraStartZ - JOURNEY.cameraEndZ) * VH_PER_UNIT);

  // Approximate which stop we're nearest to, for the tracker highlight.
  // Deliberately simple (linear across progress) rather than matching
  // exact event Z positions — good enough for a UI indicator, not
  // something else depends on this being precise.
  const activeStopIndex = Math.min(journeyStops.length - 1, Math.floor(progress * journeyStops.length));

  return (
    <>
     <Navbar />
      <div ref={trackRef} className="journey-track" style={{ height: `${trackVh}vh` }}>
        <div className="journey-sticky">
          <EventWorld progress={progress} onSelectEvent={onSelectEvent} />

          <div className="hero-veil" />

         

          <div
            className="intro-overlay"
            style={{
              top: '50%',
              left: '50%',
              opacity: introOpacity,
              filter: `blur(${(1 - introOpacity) * 8}px)`,
              transform: `translate(-50%, calc(-50% + ${(1 - introOpacity) * -24}px))`,
            }}
          >
            <div className="eyebrow">CSE Symposium</div>
            <h1 className="hero-title">EVENTS</h1>
            <p className="hero-sub">Hop aboard. Explore the events.</p>
          </div>

          <div className="scroll-hint" style={{ opacity: introOpacity }}>
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
    </>
  );
}
