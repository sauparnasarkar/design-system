// Pure (DOM-free, d3-free) math for Globe -- kept out of Globe.tsx so it can be unit-tested in
// the plain-Node `unit` vitest project, same split as SyChart/chartMath.ts.

export type ColorStop = [number, string];

/** Parses `#rgb` / `#rrggbb` (also `rgb()`/`rgba()`) into [r, g, b]; null if unparseable. The
 * canvas renderer can't resolve `var(...)`, so a consumer passes already-resolved colors. */
export function parseColor(color: string): [number, number, number] | null {
  const c = color.trim();
  let m = c.match(/^#([0-9a-f]{3})$/i);
  if (m) {
    const [r, g, b] = m[1].split('').map((ch) => parseInt(ch + ch, 16));
    return [r, g, b];
  }
  m = c.match(/^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  m = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return null;
}

/** WCAG relative luminance (0 = black, 1 = white); 0 for an unparseable color. */
export function relativeLuminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function toHex(rgb: [number, number, number]): string {
  return '#' + rgb.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}

/** Linear sRGB-channel interpolation between two colors (Plotly's own colorscale behaviour). */
export function lerpColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  return toHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}

/** Color at position `t` (0-1) along a Plotly-style `[stop, color]` scale. */
export function colorAt(scale: ColorStop[], t: number): string {
  if (scale.length === 0) return '#000000';
  const x = clamp(t, 0, 1);
  if (x <= scale[0][0]) return scale[0][1];
  for (let i = 1; i < scale.length; i++) {
    const [s1, c1] = scale[i];
    if (x <= s1) {
      const [s0, c0] = scale[i - 1];
      return s1 === s0 ? c1 : lerpColor(c0, c1, (x - s0) / (s1 - s0));
    }
  }
  return scale[scale.length - 1][1];
}

/** Maps a value to 0-1 within `range`, optionally on a log10 axis (matching SyChart's `zLog`).
 * A non-positive value on a log axis has no position -- returns null. */
export function normalizeValue(v: number, range: [number, number], zLog: boolean): number | null {
  const [lo, hi] = range;
  if (zLog) {
    if (v <= 0 || lo <= 0 || hi <= lo) return null;
    return clamp((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)), 0, 1);
  }
  if (hi <= lo) return null;
  return clamp((v - lo) / (hi - lo), 0, 1);
}

/** Fill color for a value, or null when the location has no (usable) data. */
export function colorForValue(
  v: number | null | undefined,
  range: [number, number],
  scale: ColorStop[],
  zLog: boolean,
): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  const t = normalizeValue(v, range, zLog);
  return t == null ? null : colorAt(scale, t);
}

/** Value between two consecutive frames at eased position `mix` (0-1). A location that has data
 * in only one of the two frames snaps at the midpoint rather than fading through a made-up
 * number. */
export function blendValues(a: number | null | undefined, b: number | null | undefined, mix: number): number | null {
  const av = a == null || !Number.isFinite(a) ? null : a;
  const bv = b == null || !Number.isFinite(b) ? null : b;
  if (av == null && bv == null) return null;
  if (av == null) return mix > 0.5 ? bv : null;
  if (bv == null) return mix > 0.5 ? null : av;
  return av + (bv - av) * mix;
}

/** Smoothstep easing for the year-to-year colour blend. */
export function easeInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Default number formatting for tooltips/labels/table: 2 decimals under 10, else thousands-
 * separated integers. Unit text is the consumer's (`hoverUnit`), never hardcoded here. */
export function formatGlobeValue(v: number, unit?: string): string {
  const n = v < 10 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US');
  return unit ? `${n} ${unit}` : n;
}

/** Degrees of longitude to advance for `dtMs` at one full turn per `periodMs`. */
export function rotationStep(dtMs: number, periodMs: number): number {
  if (periodMs <= 0) return 0;
  return (360 * dtMs) / periodMs;
}

export interface GlobeKeyAction {
  dLon: number;
  dLat: number;
  dZoom: number;
  reset: boolean;
}

export const MIN_TILT = -60;
export const MAX_TILT = 60;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

/** Keyboard model: arrows rotate/tilt, +/- zoom, 0 resets the view. Null for any other key. */
export function keyToAction(key: string): GlobeKeyAction | null {
  switch (key) {
    case 'ArrowLeft': return { dLon: -15, dLat: 0, dZoom: 0, reset: false };
    case 'ArrowRight': return { dLon: 15, dLat: 0, dZoom: 0, reset: false };
    case 'ArrowUp': return { dLon: 0, dLat: 10, dZoom: 0, reset: false };
    case 'ArrowDown': return { dLon: 0, dLat: -10, dZoom: 0, reset: false };
    case '+': case '=': return { dLon: 0, dLat: 0, dZoom: 0.5, reset: false };
    case '-': case '_': return { dLon: 0, dLat: 0, dZoom: -0.5, reset: false };
    case '0': return { dLon: 0, dLat: 0, dZoom: 0, reset: true };
    default: return null;
  }
}

export interface LabelCandidate {
  index: number;
  value: number;
  /** Great-circle distance (radians) from the view centre to the country's centroid. */
  dist: number;
}

/** The `n` largest-valued countries whose centroid sits comfortably on the visible hemisphere
 * (`dist < maxDist`); labelling only a handful keeps the sphere readable. */
export function pickLabelCandidates(candidates: LabelCandidate[], n = 5, maxDist = 1.2): LabelCandidate[] {
  return candidates
    .filter((c) => c.value > 0 && c.dist < maxDist)
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

export interface LegendTick {
  value: number;
  /** Position along the colour bar, 0-100 (percent). */
  pos: number;
  label: string;
}

/** Decade ticks (…0.1, 1, 10, 100, 1k, 10k…) that fall inside `range`, positioned the same way
 * `colorForValue` positions values, so the legend can never disagree with the fills. */
export function decadeTicks(range: [number, number], zLog: boolean): LegendTick[] {
  const [lo, hi] = range;
  if (hi <= lo) return [];
  const label = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));
  if (!zLog) {
    return [lo, (lo + hi) / 2, hi].map((v) => ({ value: v, pos: normalizeValue(v, range, false)! * 100, label: formatGlobeValue(v) }));
  }
  if (lo <= 0) return [];
  const out: LegendTick[] = [];
  for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) {
    const value = Math.pow(10, e);
    const pos = normalizeValue(value, range, true);
    if (pos != null) out.push({ value, pos: pos * 100, label: label(Number(value.toPrecision(12))) });
  }
  return out;
}
