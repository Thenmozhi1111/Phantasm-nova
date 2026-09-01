import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { events } from '../data/events';
import Navbar from '../components/layout/Navbar';
import EventHero from '../components/events/EventHero';
import { TeamIcon, ClockIcon, EVENT_ICONS } from '../components/events/icons';

export default function EventDetails({ eventId, onBack }) {
  const ev = events.find((e) => Number(e.id) === Number(eventId));

  useEffect(() => {
    if (ev) document.title = `${ev.title} — PHANTASM Events`;
    return () => {
      document.title = 'PHANTASM — CSE Symposium';
    };
  }, [ev]);

  if (!ev) return null;

  const half = Math.ceil(ev.rules.length / 2);
  const rulesLeft = ev.rules.slice(0, half);
  const rulesRight = ev.rules.slice(half);

  return (
    <div className="details-page">
      <Navbar active="EVENTS" />

      <div className="details-container">
        <div className="details-breadcrumb">
          <button type="button" className="crumb-link crumb-home" onClick={onBack} aria-label="Back to events">
            <HomeGlyph />
          </button>
          <span className="crumb-sep">/</span>
          <button type="button" className="crumb-link" onClick={onBack}>
            EVENTS
          </button>
          <span className="crumb-sep">/</span>
          <span className="crumb-current">{ev.title}</span>
        </div>

        <div className="details-top">
          <div className="details-copy">
            <div className="details-heading-row">
              <div className="details-glyph">
                <EventGlyph icon={ev.icon} />
              </div>
              <div>
                <div className="details-type">{ev.type}</div>
                <h1 className="details-title">{ev.title}</h1>
                <div className="details-tagline">
                  <span className="tagline-line" />
                  {ev.tagline}
                  <span className="tagline-line" />
                </div>
              </div>
            </div>

            <p className="details-desc">{ev.description}</p>

            <div className="details-stats">
              <div className="stat-pill">
                <div className="stat-icon-badge">
                  <TeamIcon className="stat-icon" />
                </div>
                <div>
                  <div className="stat-pill-label">Team Size</div>
                  <div className="stat-pill-value">{ev.team}</div>
                </div>
              </div>
              <div className="stat-pill">
                <div className="stat-icon-badge">
                  <ClockIcon className="stat-icon" />
                </div>
                <div>
                  <div className="stat-pill-label">Duration</div>
                  <div className="stat-pill-value">{ev.duration}</div>
                </div>
              </div>
            </div>
          </div>

          <EventHero icon={ev.icon} />
        </div>

        <div className="details-bottom">
          <div className="rules-panel">
            <h2 className="rules-heading">
              RULES
              <span className="rules-underline" />
            </h2>
            <div className="rules-columns">
              <ol className="rules-list" start={1}>
                {rulesLeft.map((rule, i) => (
                  <li key={i}>
                    <span className="rule-index">{i + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
              <ol className="rules-list" start={half + 1}>
                {rulesRight.map((rule, i) => (
                  <li key={i}>
                    <span className="rule-index">{half + i + 1}</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="cta-panel">
            <div className="cta-heading">{ev.cta}</div>
            <span className="cta-divider">◈</span>
            <Link to="/register" className="cta-register">
              REGISTER FOR THIS EVENT <span className="cta-chevrons">»</span>
            </Link>
            <button type="button" className="cta-back" onClick={onBack}>
              <span className="cta-back-flourish">«</span>
              GO BACK
              <span className="cta-back-flourish">»</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EventGlyph({ icon }) {
  const Icon = EVENT_ICONS[icon];
  return Icon ? <Icon className="details-glyph-svg" /> : null;
}
