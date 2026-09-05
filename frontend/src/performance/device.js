/**
 * Central device/GPU capability detection.
 *
 * Everything else in the performance system (quality tiers, model
 * selection, canvas config) reads from getDeviceTier()/getDeviceInfo()
 * instead of re-implementing screen-width checks. This module is plain
 * JS (no React) so it can run synchronously at *module load* time — this
 * matters because several components call `useGLTF.preload(...)` at the
 * top of the file, before any component has rendered and before a React
 * context could exist. Detecting the tier this way guarantees the first
 * network request for a model is already the right one — mobile never
 * fetches the desktop GLB first and then swaps (see MODEL SELECTION,
 * task section 6).
 *
 * Detection is intentionally NOT screen-width-only: a small browser
 * window on a desktop GPU should still get HIGH quality, and a large
 * tablet on a weak SoC should not. We combine:
 *   - touch/UA signals (mobile vs. desktop input class)
 *   - CPU concurrency (navigator.hardwareConcurrency)
 *   - RAM (navigator.deviceMemory, Chromium-only, treated as a hint)
 *   - WebGL renderer string (discrete vs. integrated vs. mobile GPU)
 */

let cachedInfo = null;

function getGLRendererString() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return String(renderer || '').toLowerCase();
  } catch {
    return '';
  }
}

function detect() {
  // SSR / non-browser guard — default to the safest (lightest) tier.
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { category: 'mobile', tier: 'LOW', reason: 'ssr-fallback' };
  }

  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
  const isCoarsePointer =
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const noHover = typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches;
  const smallViewport = Math.min(window.innerWidth, window.innerHeight) <= 900;

  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4; // undefined on non-Chromium; assume mid

  const renderer = getGLRendererString();
  const isIntegratedGPU = /(intel|iris|uhd graphics|mali|adreno|powervr|apple gpu)/.test(renderer);
  const isDiscreteGPU = /(nvidia|geforce|rtx|gtx|radeon|amd\b)/.test(renderer);
  const isMobileGPU = /(mali|adreno|powervr|apple gpu)/.test(renderer);

  // 1) Touch-first devices (phones/tablets) → mobile bucket, regardless
  //    of raw core count, because thermals/battery dominate here, not
  //    just raw compute.
  if (isMobileUA || (isCoarsePointer && noHover && smallViewport) || isMobileGPU) {
    return { category: 'mobile', tier: 'LOW', reason: 'touch-or-mobile-gpu' };
  }

  // 2) Laptop-class: integrated GPU, or low core/RAM count, or a
  //    touch-capable "2-in-1" with a bigger screen.
  if (isIntegratedGPU || cores <= 4 || mem <= 4) {
    return { category: 'laptop', tier: 'MEDIUM', reason: 'integrated-gpu-or-low-resources' };
  }

  // 3) Everything else (discrete GPU, or unknown but high core/RAM) →
  //    desktop-class.
  if (isDiscreteGPU || (cores >= 8 && mem >= 8)) {
    return { category: 'desktop', tier: 'HIGH', reason: 'discrete-gpu-or-high-resources' };
  }

  // Unknown renderer string (blocked by browser, headless, etc.) with
  // mid-range CPU/RAM — safer to land on MEDIUM than assume HIGH.
  return { category: 'laptop', tier: 'MEDIUM', reason: 'unknown-gpu-fallback' };
}

/** Full detection result, computed once and cached for the page's lifetime. */
export function getDeviceInfo() {
  if (!cachedInfo) cachedInfo = detect();
  return cachedInfo;
}

/** 'LOW' | 'MEDIUM' | 'HIGH' */
export function getDeviceTier() {
  return getDeviceInfo().tier;
}

/** 'mobile' | 'laptop' | 'desktop' — used only for asset-folder selection. */
export function getDeviceCategory() {
  return getDeviceInfo().category;
}

/** Test-only escape hatch: force a tier (e.g. QA toggle, ?quality=low). */
export function overrideDeviceTier(tier) {
  cachedInfo = { ...(cachedInfo || detect()), tier, reason: 'manual-override' };
  return cachedInfo;
}

// Allow ?quality=low|medium|high in the URL for manual QA on real devices
// without needing devtools throttling to reproduce a report.
if (typeof window !== 'undefined') {
  try {
    const forced = new URLSearchParams(window.location.search).get('quality');
    if (forced && ['low', 'medium', 'high'].includes(forced.toLowerCase())) {
      getDeviceInfo(); // ensure category is detected first
      overrideDeviceTier(forced.toUpperCase());
    }
  } catch {
    // ignore — URL parsing is best-effort only
  }
}
