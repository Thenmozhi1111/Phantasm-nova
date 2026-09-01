export const COLORS = {
  ember: '#ff8a3d',
  magic: '#55c8ff',
  moon: '#eaf3ff',
  // Lightened from #0a0d13 — the old near-black fog color, combined with
  // exponential falloff, was crushing everything past ~20 units to flat
  // black regardless of how bright the lights were. This keeps the night
  // mood but gives fog a lighter navy floor instead of pure black.
  fog: '#131a28',
  ambient: '#3a4a70',
};

export const MODEL_PATHS = {
  gate: '/models/ancient-stone-gate.glb',
  minecart: '/models/minecart.glb',
  railway: '/models/railway.glb',
  moon: '/models/moon.glb',
  pathway: '/models/stone-pathway.glb',
  tree: '/models/ancient-tree.glb',
  towers: '/models/ruined-towers.glb',
  temple: '/models/old_ruined_temple.glb',
};

export const MODEL_FIT = {
  gate: { axis: 'y', target: 6.5 },
  // Event gates are the same asset, scaled down — secondary landmarks,
  // not the main entrance.
  eventGate: { axis: 'y', target: 4.2 },
  railway: { axis: 'x', target: 4 },
  minecart: { axis: 'max', target: 3.0 }, // was 2.6, still looked undersized on the rail
  tree: { axis: 'y', target: 5.5 }, // tall enough to read against the ruins/gates
  towers: { axis: 'y', target: 7 }, // a cluster of towers — biggest scenery piece
  temple: { axis: 'y', target: 6.5 }, // ancient temple ruin — sits between tree and towers in scale
};

export const RAILWAY_SEGMENT_LENGTH = MODEL_FIT.railway.target;

// Was 0.02, still too dense over a track this long — the far majority of
// the now much-longer journey was fading to flat fog color. Cut further.
export const FOG_DENSITY = 0.011;

// ---------------------------------------------------------------------
// TRACK LAYOUT — single source of truth for where everything sits along Z.
// Extending the journey (more events, more distance) means editing this
// block only; every component that places something along the track reads
// from here rather than hardcoding positions.
// ---------------------------------------------------------------------
export const TRACK = {
  entranceZ: 0, // main gate
  eventStartZ: -34, // first event gate, past the entrance
  // Was 24 — gates felt like they arrived back-to-back on scroll. This is
  // the single number that controls the gap between every event gate;
  // everything else (railway segment count, camera end Z, finale Z,
  // ground/scatter length) derives from it below, so it's safe to tune
  // further without touching anything else.
  eventSpacing: 34,
  eventCount: 8,
  eventSideOffset: 12, // distance from track centerline to each event gate — was 9;
  // widened alongside spurLeadIn below so the diverging spur reads as a
  // real detour off the main line, not a short nudge sideways.
  finaleSpacing: 32, // extra gap after the last event before the finale
  // Diverging spur geometry — shared by DivergingTracks.jsx (draws the
  // rail segments) and trackLayout.js (computes each gate's facing
  // rotation from the same numbers). Keeping these in one place is what
  // guarantees the track and the gate it leads into can't disagree.
  //
  // NOTE: DivergingTracks.jsx now builds the spur as an approach leg
  // (mainline -> gate) plus a through leg oriented to the gate's own
  // facingY, rather than one diagonal for the whole thing — see the
  // comment block there. spurOvershoot now controls the length of that
  // through leg specifically (how far it continues past the gate along
  // the gate's own facing direction), not an offset along the approach
  // diagonal.
  spurLeadIn: 14, // was 8 — spur now forks off further before the gate's Z,
  // so there's real distance between the main line and the arch instead of
  // a quick diagonal cut. Combined with the wider eventSideOffset above,
  // the approach leg (DivergingTracks.jsx leg 1) is roughly 2x as long as
  // before.
  spurOvershoot: 15,
};


// ---------------------------------------------------------------------
// JOURNEY — scroll-driven camera/minecart travel across the whole track.
// ---------------------------------------------------------------------
export const JOURNEY = {
  // Was 14 — with the entrance gate at TRACK.entranceZ = 0, that left
  // almost no distance to travel before reaching it, so the arch filled
  // the frame immediately on load instead of starting small/distant and
  // being approached. Pushed back so there's real distance to cover
  // first (see Events.jsx's introFadeEnd, which now derives from this
  // same distance rather than a fixed scroll fraction).
  cameraStartZ: 30,
  cameraStartY: 3.2,
  cameraEndY: 2.8,
  minecartLead: 12, // was 5 — trig showed the cart was ~12° outside the
  // camera's vertical FOV at that distance (see chat). 12 keeps it
  // comfortably inside frame at the current camera height/FOV; the two
  // are coupled, see the derivation note in JourneyCamera.jsx.
  // Base damping (0-1, higher = snappier). Actual per-frame damping is
  // this value multiplied by a slowdown factor when near an event gate —
  // see getFrameSpeed() in utils/journey.js.
  cameraDamping: 0.06,
  // How close (in world Z) to an event gate before the camera starts
  // slowing, and the minimum speed multiplier once right on top of it.
  // Scaled up along with eventSpacing above so the slow-zone is still the
  // same proportion of the gap between gates, not a shrinking fraction of
  // a now-longer stretch.
  slowdownRadius: 13,
  minSpeedMultiplier: 0.25,
};

// cameraEndZ derived from the track layout so it always reaches just past
// the finale regardless of how many events are configured above.
JOURNEY.cameraEndZ =
  -(Math.abs(TRACK.eventStartZ) + TRACK.eventSpacing * (TRACK.eventCount - 1) + TRACK.finaleSpacing + 10);

// Rail previously only tiled backward from TRACK.entranceZ (z=0, -4, -8...)
// — nothing covered the positive-Z stretch the camera actually starts in,
// so the very start of the journey (including the start platform) had no
// visible track. This adds enough segments forward of the gate to cover
// that whole stretch plus a small buffer.
export const RAILWAY_LEAD_SEGMENT_COUNT = Math.ceil(
  (JOURNEY.cameraStartZ - TRACK.entranceZ + 10) / RAILWAY_SEGMENT_LENGTH
);

// ---------------------------------------------------------------------
// PLATFORM — bare stone platforms flanking the rail, one at each end of
// the journey (Platform.jsx). No pillars/lanterns — just the raised slabs.
//
// startZ sits at cameraStartZ - minecartLead, i.e. exactly where the
// minecart already sits the instant the page loads — so the first frame
// reads as "cart waiting at the platform" rather than an arbitrary prop
// somewhere along the line.
//
// endZ sits at cameraEndZ - minecartLead — exactly where the minecart
// comes to rest once progress reaches 1 (scroll progress is clamped to
// [0,1], so the camera/cart target position never goes past cameraEndZ —
// see useJourneyProgress.js and journey.js). Placing the end platform
// there makes "the cart doesn't move beyond the last platform" true by
// construction rather than needing a separate clamp.
// ---------------------------------------------------------------------
export const PLATFORM = {
  startZ: JOURNEY.cameraStartZ - JOURNEY.minecartLead,
  endZ: JOURNEY.cameraEndZ - JOURNEY.minecartLead,
  length: 9, // extent along Z
  width: 2.6, // extent along X, per side
  height: 0.42, // slab height above ground — a real step-up platform
  trackClearance: 1.1, // gap from centerline (rail) to the platform's inner edge
};

// Rail segment count going backward (-Z) from the entrance. Previously
// derived independently from TRACK's raw numbers with a flat "+20" fudge
// factor — that fell about 4 units short of PLATFORM.endZ (the point the
// minecart/camera actually stop at), which is exactly why the track was
// missing right at the final platform. Deriving it directly from
// PLATFORM.endZ instead guarantees the rail always reaches (and passes
// a bit beyond) wherever the journey actually ends, however the track
// layout above is tuned.
export const RAILWAY_SEGMENT_COUNT = Math.ceil(
  (Math.abs(PLATFORM.endZ) + PLATFORM.length / 2 + 10) / RAILWAY_SEGMENT_LENGTH
);

// ---------------------------------------------------------------------
// SCENERY — hand-placed per event now (EventScenery.jsx), not a
// procedural scatter. See PLACEMENTS in that file for exactly which
// event gets a tree/tower and on which side.
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// GROUND — single unified terrain + path mesh (Ground.jsx). Replaces the
// old two-layer approach (a plain Ground plane underneath a separate
// InstancedMesh of boxes for the "path" in StonePathway.jsx) — that
// second layer is what was rendering as a grid of pale, faintly floating
// slabs; removed from the scene entirely (see EventWorld.jsx). Ground.jsx
// now paints both the paved walkway and the rough ground around it into
// one static mesh, so there's no seam between two separately-built
// pieces of geometry to misalign or clash in tone.
// ---------------------------------------------------------------------
export const GROUND = {
  // Half-width of the flat paved walkway, in world units from the
  // centerline. Tied to eventSideOffset (rather than a fixed number) so
  // the gates always sit just past the path's edge on rougher ground,
  // whatever eventSideOffset is tuned to.
  pathHalfWidth: Math.max(6, TRACK.eventSideOffset - 3),
  blendWidth: 2.5, // width of the soft transition into rough ground
  pathCellSize: 1.3, // flagstone scale on the paved walkway
  outerCellSize: 3.4, // larger, rougher chunks off the walkway
  width: 60, // total ground width (both sides combined)
};

// ---------------------------------------------------------------------
// SIGN — wooden directional signpost at each event's fork point
// (EventSignpost.jsx / EventSignposts.jsx).
// ---------------------------------------------------------------------
export const SIGN = {
  postHeight: 1.7,
  // How far before the gate's Z the sign stands — should be roughly in
  // step with where the spur actually forks off the main line
  // (TRACK.spurLeadIn) so the sign reads as marking that fork, not
  // floating somewhere unrelated to it.
  leadIn: TRACK.spurLeadIn,
  sideOffset: 1.9, // distance from centerline — clear of the rail, not out at the gate
};

// ---------------------------------------------------------------------
// SKY — gradient backdrop + Milky Way band (SkyBackdrop.jsx, Galaxy.jsx).
// Both ride with the camera (see Atmosphere.jsx's skyRef), so these are a
// few extra draw calls total regardless of how long the track is — not
// per-length cost.
// ---------------------------------------------------------------------
export const SKY = {
  // Vertical gradient, zenith (top) to horizon (bottom). The lighter
  // horizon stop is what the moon/clouds sit against and blend into —
  // without it there's nothing for their soft edges to fade toward.
  zenithColor: '#05070c',
  midColor: '#0d1220',
  glowColor: '#1c2740', // faint glow band behind the moon
  horizonColor: '#33405e',
  domeRadius: 200,
};

// TEXTURE_PATHS.cloud (the old photographic cloud puff asset) removed —
// no longer referenced now that Galaxy.jsx replaced the cloud sprites
// with a procedurally-drawn texture that needs no external file.
