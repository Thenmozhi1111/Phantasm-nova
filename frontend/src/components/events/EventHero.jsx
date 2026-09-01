import { EVENT_ICONS } from './icons';

// Flat, dependency-free SVG "hero" art standing in for a per-event photo.
// Reuses the same ruined-arch / moon / torch motif as the 3D journey world
// so every event page shares one consistent look, with only the large
// center glyph changing per event.
export default function EventHero({ icon, accent = 'arcane' }) {
  const Icon = EVENT_ICONS[icon];
  const glow = accent === 'ember' ? 'var(--ember)' : 'var(--arcane)';

  return (
    <div className="event-hero" style={{ '--hero-glow': glow }}>
      <svg viewBox="0 0 640 480" className="event-hero-svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="heroSky" cx="50%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#1c2536" />
            <stop offset="60%" stopColor="#0f131b" />
            <stop offset="100%" stopColor="#0a0d13" />
          </radialGradient>
          <radialGradient id="heroMoon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eaf6ff" />
            <stop offset="70%" stopColor="#bfe3ff" />
            <stop offset="100%" stopColor="#7fbfe8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroIconGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
            <stop offset="100%" stopColor={glow} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="heroFade" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#0a0d13" />
            <stop offset="35%" stopColor="#0a0d13" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="640" height="480" fill="url(#heroSky)" />

        {/* stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} fill="#cfe6ff" opacity={s[3]} />
        ))}

        <circle cx="460" cy="100" r="120" fill="url(#heroMoon)" opacity="0.5" />
        <circle cx="460" cy="100" r="46" fill="#dff1ff" opacity="0.9" />

        {/* ruined arch */}
        <path
          d="M40 480 L40 200 Q40 90 170 90 Q300 90 300 200 L300 480"
          fill="none"
          stroke="#2a3140"
          strokeWidth="26"
        />
        <path
          d="M40 480 L40 200 Q40 90 170 90 Q300 90 300 200 L300 480"
          fill="none"
          stroke="#3a4356"
          strokeWidth="4"
        />
        <path
          d="M340 480 L340 260 Q340 170 430 170 Q520 170 520 260 L520 480"
          fill="none"
          stroke="#232a36"
          strokeWidth="20"
          opacity="0.85"
        />

        {/* ground */}
        <rect x="0" y="430" width="640" height="50" fill="#11151d" />
        <rect x="0" y="428" width="640" height="4" fill="#1b212c" />

        {/* torches */}
        {[95, 265, 555].map((x, i) => (
          <g key={i}>
            <rect x={x - 4} y="330" width="8" height="100" fill="#1c2029" />
            <ellipse cx={x} cy="322" rx="16" ry="26" fill="var(--ember)" opacity="0.85" />
            <ellipse cx={x} cy="318" rx="8" ry="16" fill="#ffd9a8" opacity="0.9" />
          </g>
        ))}

        {/* center icon glow */}
        <circle cx="320" cy="300" r="150" fill="url(#heroIconGlow)" />

        <rect width="640" height="480" fill="url(#heroFade)" opacity="0.5" />
      </svg>

      {Icon && (
        <div className="event-hero-icon">
          <Icon className="event-hero-icon-svg" />
        </div>
      )}
    </div>
  );
}

// Fixed pseudo-random star field (x, y, radius, opacity) — static so it
// doesn't recompute or flicker on re-render.
const STARS = [
  [30, 40, 1.2, 0.8], [90, 25, 1, 0.6], [150, 55, 1.4, 0.7], [210, 20, 1, 0.5],
  [260, 60, 1.1, 0.9], [340, 35, 1, 0.6], [400, 22, 1.3, 0.7], [560, 45, 1, 0.5],
  [600, 70, 1.2, 0.8], [520, 30, 1, 0.6], [180, 90, 0.9, 0.5], [610, 130, 1, 0.6],
  [70, 110, 1, 0.5], [370, 15, 0.9, 0.6],
];
