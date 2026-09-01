// Lightweight stroke-style icons, hand-drawn to match the existing
// arcane/ember theme. Kept as plain inline SVG (no icon-library
// dependency) so this drops into the project with zero install step.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function TeamIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 14.2c2.4.3 4 2 4 4.8" />
    </svg>
  );
}

export function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12.5" r="8.2" />
      <path d="M12 7.8v5l3.3 2" />
      <path d="M9.5 2.6h5" />
    </svg>
  );
}

function ChestIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M3.5 10.5h17V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-8.5Z" />
      <path d="M3.5 10.5c0-3.6 2.8-6 8.5-6s8.5 2.4 8.5 6" />
      <path d="M3.5 10.5V19M20.5 10.5V19" />
      <circle cx="12" cy="13.8" r="1.7" />
      <path d="M8.5 4.8v3.4M15.5 4.8v3.4" />
    </svg>
  );
}

function BugIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="8" y="9" width="8" height="9.5" rx="4" />
      <path d="M10 9a2 2 0 0 1 4 0" />
      <path d="M12 6.3V9" />
      <path d="M9.3 5.6 10.6 7M14.7 5.6 13.4 7" />
      <path d="M8 12.2H5M8 15.3H5.3M16 12.2h3M16 15.3h2.7" />
      <path d="M9.3 18.7 7.8 21M14.7 18.7 16.2 21" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 4.5 13.4 9l4.6 1.4-4.6 1.4L12 16.3l-1.4-4.5L6 10.4 10.6 9Z" />
      <path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
      <path d="M5 15.8l.6 1.5 1.5.6-1.5.6-.6 1.5-.6-1.5-1.5-.6 1.5-.6Z" />
    </svg>
  );
}

function ChartIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 20V9M9.5 20V4M15 20v-7M20 20V11" />
      <path d="M3.5 20.5h17" />
    </svg>
  );
}

function TargetIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 1.5v3.2M12 19.3v3.2M1.5 12h3.2M19.3 12h3.2" />
    </svg>
  );
}

function GavelIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M14 4.5 19.5 10M11 7.5l6 6" />
      <rect x="9.3" y="6.2" width="3.6" height="8.5" rx="1" transform="rotate(-45 11 10.4)" />
      <path d="M4 20h10" />
      <path d="M3.5 15 8.9 20.4" />
    </svg>
  );
}

function MegaphoneIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M4 10.5v3a1.3 1.3 0 0 0 1.3 1.3H7l1.4 4.3a1.4 1.4 0 0 0 2.6-.9l-.9-3.4" />
      <path d="M7 10.5 17 6v13l-10-4.5v-4Z" />
      <path d="M19 9.3a3.2 3.2 0 0 1 0 5.4" />
    </svg>
  );
}

function BulbIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8.3 14.2a5.5 5.5 0 1 1 7.4 0c-.8.8-1.3 1.5-1.3 2.6v.7H9.6v-.7c0-1.1-.5-1.8-1.3-2.6Z" />
      <path d="M9.6 20h4.8M10.3 22h3.4" />
      <path d="M12 3.2v1.3" />
    </svg>
  );
}

export const EVENT_ICONS = {
  chest: ChestIcon,
  bug: BugIcon,
  sparkles: SparklesIcon,
  chart: ChartIcon,
  target: TargetIcon,
  gavel: GavelIcon,
  megaphone: MegaphoneIcon,
  bulb: BulbIcon,
};
