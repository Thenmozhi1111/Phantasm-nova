/**
 * Central quality configuration. Every rendering system (Canvas, lights,
 * shadows, particles, atmosphere, post-processing) reads its settings
 * from here instead of hardcoding device checks inline.
 *
 * These are starting points (per the brief) — tuned from the measured
 * before/after numbers in PERFORMANCE_REPORT.md, not guessed blind.
 */
export const QUALITY = {
  low: {
    dpr: [0.75, 1],
    shadows: false,
    postProcessing: false,
    particles: 0.25,
    clouds: false,
    atmosphere: 'low',
    dynamicLights: 2, // entrance/exit pair OR the nearest event gate — never both
    animationMultiplier: 0.7,
    antialias: false,
    starCount: 220,
    emberCount: 18,
    powerPreference: 'low-power',
    lightCullRadius: 26, // event-gate lights beyond this (world Z) from camera are turned off
  },
  medium: {
    dpr: [1, 1.25],
    shadows: false,
    postProcessing: false,
    particles: 0.6,
    clouds: true,
    atmosphere: 'medium',
    dynamicLights: 3,
    animationMultiplier: 1,
    antialias: true,
    starCount: 550,
    emberCount: 45,
    powerPreference: 'default',
    lightCullRadius: 45,
  },
  high: {
    dpr: [1, 1.5],
    shadows: true,
    postProcessing: true,
    particles: 1,
    clouds: true,
    atmosphere: 'high',
    dynamicLights: 5,
    animationMultiplier: 1,
    antialias: true,
    starCount: 900,
    emberCount: 70,
    powerPreference: 'high-performance',
    lightCullRadius: 90,
  },
};

export function getQualityConfig(tier) {
  const key = String(tier || 'MEDIUM').toLowerCase();
  return QUALITY[key] || QUALITY.medium;
}

// Ordered list used by the adaptive system to step up/down one tier at a
// time rather than jumping straight to the extremes.
export const TIER_ORDER = ['LOW', 'MEDIUM', 'HIGH'];

export function stepDown(tier) {
  const i = TIER_ORDER.indexOf(tier);
  return i > 0 ? TIER_ORDER[i - 1] : tier;
}

export function stepUp(tier, ceiling) {
  const i = TIER_ORDER.indexOf(tier);
  const ceilingIdx = TIER_ORDER.indexOf(ceiling || 'HIGH');
  return i < ceilingIdx ? TIER_ORDER[i + 1] : tier;
}
