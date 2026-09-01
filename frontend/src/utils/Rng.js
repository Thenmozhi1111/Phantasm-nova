// Mulberry32 — tiny, deterministic PRNG. Used so procedural placement
// (ground clutter, ruins, debris) looks the same on every load instead of
// reshuffling on every refresh, while still not needing a hand-authored
// position for every single instance.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scatters `count` items in clusters along the track from `startZ` down to
 * `endZ` (both negative-going), on both sides of the rail, avoiding a
 * center exclusion zone (the railway/gates themselves).
 */
export function generateTrackScatter({
  seed,
  startZ,
  endZ,
  clusterSpacing = 12,
  itemsPerCluster = 5,
  xRange = [4, 9],
  scaleRange = [0.7, 1.2],
  // Z positions to keep clear of (e.g. the event gates) plus how close is
  // too close. Used so a scattered prop (ruins) never lands right on top
  // of a hand-placed landmark (an event gate) purely by chance — see
  // Ruins.jsx. Left empty, this behaves exactly as before.
  avoidZ = [],
  avoidRadius = 0,
}) {
  const rng = makeRng(seed);
  const items = [];
  const length = Math.abs(endZ - startZ);
  const clusterCount = Math.max(1, Math.floor(length / clusterSpacing));

  for (let c = 0; c < clusterCount; c++) {
    const clusterZ = startZ - c * clusterSpacing - rng() * clusterSpacing * 0.4;
    const side = c % 2 === 0 ? 1 : -1; // alternate which side is denser
    for (let i = 0; i < itemsPerCluster; i++) {
      const sideSign = rng() > 0.3 ? side : -side; // mostly one side, some scatter
      const x = sideSign * (xRange[0] + rng() * (xRange[1] - xRange[0]));
      const z = clusterZ - rng() * clusterSpacing * 0.5;
      // Still consume the same rng() calls above even when skipping, so
      // every later item's sequence stays identical regardless of which
      // earlier items got excluded — the layout doesn't reshuffle itself
      // when avoidRadius changes, it just thins out near the excluded Zs.
      if (avoidRadius > 0 && avoidZ.some((az) => Math.abs(z - az) < avoidRadius)) continue;
      items.push({
        pos: [x, 0, z],
        rot: rng() * Math.PI * 2,
        scale: scaleRange[0] + rng() * (scaleRange[1] - scaleRange[0]),
      });
    }
  }

  return items;
}