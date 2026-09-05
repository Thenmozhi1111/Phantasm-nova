import { getDeviceCategory } from './device';

/**
 * Central model resolver (task section 6). Maps a short logical key to
 * the actual GLB file name, then prefixes it with /models/mobile/ or
 * /models/desktop/ based on the tier decided by device.js — decided once,
 * synchronously, before any component mounts, so there is never a
 * "download desktop, then detect mobile, then download mobile" sequence.
 *
 * Individual components should never hardcode a models/... path — always
 * go through getModelPath(key).
 */
const MODEL_FILES = {
  gate: 'ancient-stone-gate.glb',
  minecart: 'minecart.glb',
  railway: 'railway.glb',
  moon: 'moon.glb',
  pathway: 'stone-pathway.glb',
  tree: 'ancient-tree.glb',
  towers: 'ruined-towers.glb',
  temple: 'old_ruined_temple.glb',
  debris: 'debris_mid.glb',
};

// Only two optimized asset sets exist (mobile/desktop per the brief).
// Laptop (MEDIUM) reuses the desktop set — it's the mid/high quality
// *settings* (dpr, shadows, particles) that scale it down, not a third
// copy of every model.
function folderForCategory(category) {
  return category === 'mobile' ? 'mobile' : 'desktop';
}

export function getModelPath(key) {
  const file = MODEL_FILES[key];
  if (!file) {
    throw new Error(`getModelPath: unknown model key "${key}"`);
  }
  const folder = folderForCategory(getDeviceCategory());
  return `/models/${folder}/${file}`;
}

export function getAllModelKeys() {
  return Object.keys(MODEL_FILES);
}
