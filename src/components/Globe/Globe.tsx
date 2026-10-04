import React from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoContains, geoDistance, geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { cx } from '../../lib/cx';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../Button/Button';
import { Table } from '../Table/Table';
import { cssVar } from '../SyChart/chartMath';
import worldCountriesUrl from '../../assets/geo/world-countries-110m.topo.json?url';
import {
  MAX_TILT, MAX_ZOOM, MIN_TILT, MIN_ZOOM,
  blendValues, clamp, colorForValue, decadeTicks, easeInOut, formatGlobeValue, keyToAction,
  lerpColor, pickLabelCandidates, relativeLuminance, rotationStep,
  type ColorStop, type LabelCandidate,
} from './globeMath';

export interface GlobeProps {
  /** One ISO-3 code per location, matching the geometry's feature `id`s (the bundled geometry is
   * Natural Earth 110m, the same country set SyChart's flat choropleth draws). Locations with no
   * polygon in the geometry (microstates, dependencies) simply aren't drawn -- same as the flat map. */
  isoCodes: string[];
  /** Display name per location, parallel to `isoCodes`. Falls back to the ISO code. */
  locationNames?: string[];
  /** One entry per animation frame (e.g. calendar years). */
  years: number[];
  /** `values[frame][location]`; `null` = no data. */
  values: Array<Array<number | null>>;
  /** Frame currently shown (controlled). Change it to step the globe; the globe owns no year
   * playback of its own -- drive it from the same clock as the rest of the page. */
  yearIndex: number;
  /** Fixed color range across every frame (min, max), so colours are comparable year to year. */
  colorRange: [number, number];
  /** Plotly-style `[stop 0–1, color]` scale, with colors as resolved hex/rgb (a canvas can't
   * resolve `var(...)`). The same scale passed to SyChart's choropleth gives identical fills. */
  colorScale: ColorStop[];
  /** Log10-transform values before mapping to the scale (as SyChart's `zLog`). Default true. */
  zLog?: boolean;
  /** Fill for locations with no data. Defaults to the theme's muted chart text tone. */
  noDataColor?: string;
  /** Unit text appended to tooltip/table values (e.g. 'MtCO₂'). Never hardcoded here. */
  hoverUnit?: string;
  /** Legend caption (e.g. 'CO₂ (MtCO₂)'). */
  legendTitle?: string;
  /** Legend/table wording for locations with no data. Default 'No data'. */
  noDataLabel?: string;
  /** Accessible name; the current frame's year is appended automatically. */
  ariaLabel: string;
  /** Overlay at the top-left of the globe (e.g. the current year and a total). */
  title?: React.ReactNode;
  /** Slowly spin the globe. Default true; off under prefers-reduced-motion unless `allowSpinWithReducedMotion`. */
  autoRotate?: boolean;
  /** Let `autoRotate` spin the globe even under prefers-reduced-motion. Default false: reduced motion
   * suppresses the spin, as it should for a spin nobody asked for. Set true only when `autoRotate` is itself
   * the result of a deliberate user action -- e.g. it is on only while the user's own Play button is
   * running -- since then the movement is requested, not imposed. Colour blending stays off either way. */
  allowSpinWithReducedMotion?: boolean;
  /** Milliseconds per full turn. Set it to the consumer's step interval to keep one rotation per year-step. Default 12000. */
  rotationPeriodMs?: number;
  /** Milliseconds to blend colours between consecutive frames. Default 600; 0 disables (and is forced under reduced motion). */
  blendMs?: number;
  /** Longitude to centre on at first paint, degrees. Default 80. */
  initialLongitude?: number;
  /** Custom geometry (features keyed by ISO-3 `id`). Overrides the bundled file. */
  geometry?: FeatureCollection;
  /** URL of a custom TopoJSON whose `countries` object is keyed by ISO-3 `id`. Ignored if `geometry` is set. */
  geometryUrl?: string;
  /** Names and values drawn beside the largest visible countries. Default true. Turn off for an
   * ambient/autoplaying globe that should show only the colour and the year, and back on when paused. */
  showLabels?: boolean;
  showLegend?: boolean;
  /** Zoom/reset/table buttons and the keyboard hint. Default true. */
  showControls?: boolean;
  /** Upper bound on the rendered diameter (px). Default 640. */
  maxSize?: number;
  /** No panel background: the globe sits directly on the page, and the text around it (legend, controls hint,
   * overlay title) uses the page's text colour instead of the chart panel's. The ocean disc is still drawn in the
   * chart-surface colour, so on a dark page it reads as part of the page and on a light page as a dark globe.
   * Text uses `static-text-standard` (not `-weak`): the weak tone is fine on the dark chart panel but too faint
   * (~3.8:1 in the light theme) for small legend text sitting on a light page. */
  transparent?: boolean;
  className?: string;
}

// Inner padding of the panel; the canvas is sized from the *content* box (width minus this on both
// sides) so the padded panel never exceeds its parent.
const PANEL_PAD = 12;

const geometryCache = new Map<string, Promise<FeatureCollection>>();

function loadGeometry(url: string): Promise<FeatureCollection> {
  let p = geometryCache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Globe geometry ${r.status}`);
        return r.json() as Promise<Topology>;
      })
      .then((topo) => feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection);
    // A failed fetch (offline) must not wedge every later mount on the same rejected promise.
    p.catch(() => geometryCache.delete(url));
    geometryCache.set(url, p);
  }
  return p;
}

interface ThemeColors {
  surface: string;
  ink: string;
  accent: string;
  noData: string;
  border: string;
  hover: string;
}

function resolveTheme(el: Element): ThemeColors {
  const surface = cssVar(el, '--__s9cmpx-chart-surface', '#0e1a2e');
  const ink = cssVar(el, '--__s9cmpx-chart-surface-text-weak', cssVar(el, '--__s9cmpx-static-text-weak', '#a2aec1'));
  const dark = relativeLuminance(surface) < 0.4;
  return {
    surface,
    ink,
    accent: cssVar(el, '--__s9cmpx-static-divider-accent', ink),
    // Muted midpoint between panel and text tone: clearly outside any sequential ramp, but not a
    // glaring near-white patch on a dark panel.
    noData: lerpColor(surface, ink, 0.45),
    border: dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
    hover: dark ? '#ffffff' : '#000000',
  };
}

type Loc = { name: string; value: number | null };

/** Interactive orthographic globe of a per-country value over a series of frames (e.g. yearly
 * emissions), drawn on a canvas. Countries are matched by ISO-3 code, colours follow the same
 * `colorScale`/`colorRange`/`zLog` contract as SyChart's choropleth, and every colour it paints
 * from the theme is resolved from `--__s9cmpx-*` tokens at draw time (re-resolved when
 * `data-theme`/class changes, since a canvas can't read CSS variables itself). Keyboard:
 * arrows rotate/tilt, +/- zoom, 0 resets; "Table view" gives every value as a real table. */
export function Globe({
  isoCodes, locationNames, years, values, yearIndex, colorRange, colorScale, zLog = true, noDataColor,
  hoverUnit, legendTitle, noDataLabel = 'No data', ariaLabel, title,
  autoRotate = true, allowSpinWithReducedMotion = false, rotationPeriodMs = 12000, blendMs = 600, initialLongitude = 80,
  geometry, geometryUrl, showLabels = true, showLegend = true, showControls = true, maxSize = 640, transparent = false, className,
}: GlobeProps) {
  const reducedMotion = useReducedMotion();
  const uid = React.useId();
  const hintId = `${uid}-hint`;

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [geo, setGeo] = React.useState<FeatureCollection | null>(geometry ?? null);
  const [size, setSize] = React.useState(0);
  const [tableOpen, setTableOpen] = React.useState(false);
  const [noDataSwatch, setNoDataSwatch] = React.useState<string | undefined>(undefined);
  const [tooltip, setTooltip] = React.useState<{ name: string; text: string; x: number; y: number } | null>(null);

  // Latest props for the draw loop, so effects don't re-create it on every prop change.
  const propsRef = React.useRef({ isoCodes, locationNames, values, colorRange, colorScale, zLog, noDataColor, hoverUnit, noDataLabel, autoRotate, allowSpinWithReducedMotion, rotationPeriodMs, blendMs, reducedMotion, tableOpen, showLabels });
  propsRef.current = { isoCodes, locationNames, values, colorRange, colorScale, zLog, noDataColor, hoverUnit, noDataLabel, autoRotate, allowSpinWithReducedMotion, rotationPeriodMs, blendMs, reducedMotion, tableOpen, showLabels };

  const view = React.useRef({ rot: -initialLongitude, tilt: 15, zoom: 1 });
  const frame = React.useRef({ from: yearIndex, to: yearIndex, mix: 1 });
  const hoverRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{ x: number; y: number; rot: number; tilt: number } | null>(null);
  const pointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const theme = React.useRef<ThemeColors | null>(null);
  const visible = React.useRef(true);
  const raf = React.useRef(0);
  const lastT = React.useRef(0);
  const pickRef = React.useRef<((x: number, y: number) => number | null) | null>(null);
  const drawRef = React.useRef<() => void>(() => {});

  // --- geometry ---
  React.useEffect(() => {
    if (geometry) { setGeo(geometry); return; }
    let cancelled = false;
    loadGeometry(geometryUrl ?? worldCountriesUrl).then((g) => { if (!cancelled) setGeo(g); }).catch(() => {});
    return () => { cancelled = true; };
  }, [geometry, geometryUrl]);

  const features = React.useMemo(() => (geo?.features ?? []) as Array<Feature<Geometry>>, [geo]);
  const centroids = React.useMemo(() => features.map((f) => geoCentroid(f)), [features]);
  const locByIso = React.useMemo(() => {
    const m = new Map<string, number>();
    isoCodes.forEach((c, i) => m.set(c, i));
    return m;
  }, [isoCodes]);
  // feature index -> location index (-1 = feature has no data row at all)
  const featureLoc = React.useMemo(() => features.map((f) => locByIso.get(String(f.id)) ?? -1), [features, locByIso]);

  const valueAt = React.useCallback((loc: number): number | null => {
    if (loc < 0) return null;
    const { values: vs } = propsRef.current;
    const f = frame.current;
    const a = vs[f.from]?.[loc];
    const b = vs[f.to]?.[loc];
    return blendValues(a, b, easeInOut(f.mix));
  }, []);

  const nameOf = React.useCallback((loc: number, fallback: string) => propsRef.current.locationNames?.[loc] ?? propsRef.current.isoCodes[loc] ?? fallback, []);

  // --- scheduling ---
  // tick lives in a ref (reassigned each render) so `schedule` stays stable without a
  // use-before-define cycle between the two.
  const tickRef = React.useRef<(t: number) => void>(() => {});
  const frameLoop = React.useCallback((t: number) => tickRef.current(t), []);
  const schedule = React.useCallback(() => {
    if (raf.current || !visible.current) return;
    raf.current = requestAnimationFrame(frameLoop);
  }, [frameLoop]);

  tickRef.current = (t: number) => {
    raf.current = 0;
    const dt = lastT.current ? Math.min(80, t - lastT.current) : 16;
    lastT.current = t;
    const p = propsRef.current;
    const f = frame.current;
    let animating = false;
    // Colour blend between consecutive frames
    if (f.mix < 1) {
      f.mix = p.blendMs <= 0 || p.reducedMotion ? 1 : Math.min(1, f.mix + dt / p.blendMs);
      if (f.mix < 1) animating = true;
      else f.from = f.to;
    }
    // Spin
    const spinning = p.autoRotate && (!p.reducedMotion || p.allowSpinWithReducedMotion) && !p.tableOpen && !dragRef.current && hoverRef.current == null;
    if (spinning) { view.current.rot += rotationStep(dt, p.rotationPeriodMs); animating = true; }
    drawRef.current();
    if (animating && visible.current) raf.current = requestAnimationFrame(frameLoop);
    else lastT.current = 0;
  };

  // --- size ---
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setSize(Math.max(0, Math.min(maxSize, Math.round(el.clientWidth - 2 * PANEL_PAD))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [maxSize]);

  // --- theme tokens (canvas can't read CSS vars) ---
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const refresh = () => { theme.current = resolveTheme(el); setNoDataSwatch(theme.current.noData); schedule(); };
    refresh();
    const mo = new MutationObserver(refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'], subtree: true });
    return () => mo.disconnect();
  }, [schedule]);

  // --- visibility: pause offscreen / hidden tab ---
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const set = (v: boolean) => {
      visible.current = v && document.visibilityState !== 'hidden';
      if (visible.current) schedule();
      else if (raf.current) { cancelAnimationFrame(raf.current); raf.current = 0; lastT.current = 0; }
    };
    // No IntersectionObserver (old browsers, jsdom): treat as always visible; the hidden-tab pause below still applies.
    const io = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver((entries) => set(entries[entries.length - 1].isIntersecting), { threshold: 0 });
    io?.observe(el);
    const onVis = () => set(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', onVis); if (raf.current) cancelAnimationFrame(raf.current); raf.current = 0; };
  }, [schedule]);

  // --- frame changes: start a blend (or snap) ---
  React.useEffect(() => {
    const f = frame.current;
    const target = clamp(yearIndex, 0, Math.max(0, years.length - 1));
    if (target === f.to) return;
    // Retarget mid-blend from wherever the displayed frame currently is (the nearer end).
    f.from = f.mix >= 0.5 ? f.to : f.from;
    f.to = target;
    f.mix = blendMs <= 0 || reducedMotion ? 1 : 0;
    if (f.mix === 1) f.from = f.to;
    schedule();
  }, [yearIndex, years.length, blendMs, reducedMotion, schedule]);

  // --- redraw on any data/style/size change ---
  React.useEffect(() => { schedule(); }, [features, featureLoc, values, colorRange, colorScale, zLog, noDataColor, size, tableOpen, showLabels, autoRotate, allowSpinWithReducedMotion, reducedMotion, schedule]);

  // --- draw ---
  drawRef.current = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || size <= 0 || features.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const th = theme.current ?? (theme.current = resolveTheme(wrap));
    const p = propsRef.current;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size * dpr)) { canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx0 = size / 2;
    const R = size / 2 - Math.max(10, size * 0.04);
    const v = view.current;
    const proj = geoOrthographic().rotate([v.rot, -v.tilt]).translate([cx0, cx0]).clipAngle(90).precision(0.8).scale(R * v.zoom);
    const path = geoPath(proj, ctx);
    const centre: [number, number] = [-v.rot, v.tilt];

    // glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx0, cx0, R * v.zoom + 4, 0, Math.PI * 2);
    ctx.strokeStyle = th.accent;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = Math.max(3, size * 0.012);
    ctx.stroke();
    ctx.restore();

    // ocean: the chart surface, deepened toward the limb
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = th.surface;
    ctx.fill();
    const shade = ctx.createRadialGradient(cx0 * 0.8, cx0 * 0.75, R * 0.2, cx0, cx0, R * v.zoom);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = shade;
    ctx.fill();
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = th.accent;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // graticule
    ctx.beginPath();
    path(geoGraticule10());
    ctx.strokeStyle = th.ink;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // countries
    const noData = p.noDataColor ?? th.noData;
    const labelCandidates: LabelCandidate[] = [];
    ctx.lineWidth = 0.6;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = th.border;
    features.forEach((f, i) => {
      const loc = featureLoc[i];
      const val = valueAt(loc);
      ctx.beginPath();
      path(f);
      ctx.fillStyle = colorForValue(val, p.colorRange, p.colorScale, p.zLog) ?? noData;
      ctx.fill();
      ctx.stroke();
      if (val != null && val > 0) {
        const dist = geoDistance(centroids[i], centre);
        if (dist < 1.2) labelCandidates.push({ index: i, value: val, dist });
      }
    });

    // hover outline
    const h = hoverRef.current;
    if (h != null && features[h]) {
      ctx.beginPath();
      path(features[h]);
      ctx.strokeStyle = th.hover;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // labels for the largest few visible countries
    ctx.font = `600 12px ${getComputedStyle(canvas).fontFamily || 'sans-serif'}`;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    // Fewer labels on a small globe (phones): five names on a ~240px disc overprint each other.
    (p.showLabels ? pickLabelCandidates(labelCandidates, size < 420 ? 3 : 5) : []).forEach((c) => {
      const pt = proj(centroids[c.index]);
      if (!pt) return;
      const text = `${nameOf(featureLoc[c.index], String(features[c.index].id))} ${formatGlobeValue(c.value)}`;
      ctx.fillStyle = th.hover;
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], 3, 0, Math.PI * 2);
      ctx.fill();
      // Normally to the right of the dot; flipped to its left if it would run off the canvas (a country near the
      // right edge of a small phone globe otherwise gets its name cut off).
      const flip = pt[0] + 8 + ctx.measureText(text).width > size - 2;
      const tx = flip ? pt[0] - 8 : pt[0] + 8;
      ctx.textAlign = flip ? 'right' : 'left';
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = th.surface;
      ctx.strokeText(text, tx, pt[1]);
      ctx.fillStyle = th.hover;
      ctx.fillText(text, tx, pt[1]);
      ctx.textAlign = 'left';
    });

    pickRef.current = (x, y) => {
      const ll = proj.invert?.([x, y]);
      if (!ll || geoDistance(ll, centre) > Math.PI / 2) return null;
      const idx = features.findIndex((f) => geoContains(f, ll));
      return idx < 0 ? null : idx;
    };
  };

  // --- interaction ---
  const localPoint = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = size / (r.width || 1);
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  };

  const updateHover = React.useCallback(() => {
    const pt = pointerRef.current;
    if (!pt || !pickRef.current || dragRef.current) return;
    const idx = pickRef.current(pt.x, pt.y);
    if (idx !== hoverRef.current) {
      hoverRef.current = idx;
      schedule();
    }
    if (idx == null) { setTooltip(null); return; }
    const loc = featureLoc[idx];
    const val = valueAt(loc);
    setTooltip({
      name: nameOf(loc, String(features[idx].id)),
      text: val == null ? propsRef.current.noDataLabel : formatGlobeValue(val, propsRef.current.hoverUnit),
      x: Math.min(size - 170, pt.x + 14),
      y: pt.y + 14,
    });
  }, [features, featureLoc, nameOf, schedule, size, valueAt]);

  const hoverRaf = React.useRef(0);
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = localPoint(e);
    dragRef.current = { x: pt.x, y: pt.y, rot: view.current.rot, tilt: view.current.tilt };
    hoverRef.current = null;
    setTooltip(null);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = localPoint(e);
    const d = dragRef.current;
    if (d) {
      view.current.rot = d.rot + (pt.x - d.x) * 0.4;
      view.current.tilt = clamp(d.tilt - (pt.y - d.y) * 0.3, MIN_TILT, MAX_TILT);
      schedule();
      return;
    }
    pointerRef.current = pt;
    if (!hoverRaf.current) {
      hoverRaf.current = requestAnimationFrame(() => { hoverRaf.current = 0; updateHover(); });
    }
  };
  const onPointerUp = () => { dragRef.current = null; schedule(); };
  const onPointerLeave = () => {
    dragRef.current = null;
    pointerRef.current = null;
    if (hoverRef.current != null) { hoverRef.current = null; }
    setTooltip(null);
    schedule();
  };
  React.useEffect(() => () => { if (hoverRaf.current) cancelAnimationFrame(hoverRaf.current); }, []);

  const applyAction = (a: NonNullable<ReturnType<typeof keyToAction>>) => {
    const v = view.current;
    if (a.reset) { v.rot = -initialLongitude; v.tilt = 15; v.zoom = 1; }
    else {
      v.rot += a.dLon;
      v.tilt = clamp(v.tilt + a.dLat, MIN_TILT, MAX_TILT);
      v.zoom = clamp(v.zoom + a.dZoom, MIN_ZOOM, MAX_ZOOM);
    }
    schedule();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const a = keyToAction(e.key);
    if (!a) return;
    e.preventDefault();
    applyAction(a);
  };

  // --- table view rows ---
  const yi = clamp(yearIndex, 0, Math.max(0, years.length - 1));
  const year = years[yi];
  const tableRows = React.useMemo(() => {
    if (!tableOpen) return [];
    const rows: Array<Loc & { key: string }> = isoCodes.map((code, i) => ({ key: code, name: locationNames?.[i] ?? code, value: values[yi]?.[i] ?? null }));
    rows.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
    return rows.map((r) => ({ country: r.name, value: r.value == null ? noDataLabel : formatGlobeValue(r.value, hoverUnit) }));
  }, [tableOpen, isoCodes, locationNames, values, yi, noDataLabel, hoverUnit]);

  const ticks = React.useMemo(() => decadeTicks(colorRange, zLog), [colorRange, zLog]);
  const gradient = React.useMemo(
    () => `linear-gradient(90deg, ${colorScale.map(([s, c]) => `${c} ${(s * 100).toFixed(1)}%`).join(', ')})`,
    [colorScale],
  );

  const label = `${ariaLabel}${year != null ? `, ${year}` : ''}`;

  return (
    <div
      ref={wrapRef}
      className={cx(className)}
      style={{ position: 'relative', width: '100%', maxWidth: maxSize + 2 * PANEL_PAD, background: transparent ? 'transparent' : 'var(--__s9cmpx-chart-surface)', color: transparent ? 'var(--__s9cmpx-static-text-standard)' : 'var(--__s9cmpx-chart-surface-text-weak)', borderRadius: 8, padding: PANEL_PAD, boxSizing: 'border-box' }}
    >
      <div style={{ position: 'relative', display: tableOpen ? 'none' : 'block', width: size, height: size, margin: '0 auto' }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          aria-describedby={showControls ? hintId : undefined}
          aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          style={{ display: 'block', width: size, height: size, touchAction: 'none', cursor: 'grab' }}
        />
        {title != null && <div style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>{title}</div>}
        {tooltip && (
          <div
            aria-hidden="true"
            style={{ position: 'absolute', left: tooltip.x, top: tooltip.y, pointerEvents: 'none', padding: '8px 10px', borderRadius: 8, background: 'var(--__s9cmpx-static-background-standard)', color: 'var(--__s9cmpx-static-text-standard, inherit)', border: '1px solid var(--__s9cmpx-static-divider-weak)', boxShadow: '0 6px 20px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 2, whiteSpace: 'nowrap' }}
          >
            <span style={{ fontWeight: 600, fontSize: 13 }}>{tooltip.name}</span>
            <span style={{ fontSize: 12 }}>{tooltip.text}</span>
          </div>
        )}
      </div>

      {tableOpen && (
        <div style={{ maxHeight: 360, overflow: 'auto' }} tabIndex={0} role="region" aria-label={`${ariaLabel}, table view`}>
          <Table
            size="small"
            caption={year != null ? String(year) : undefined}
            columns={[
              { key: 'country', header: 'Country', sortable: true },
              { key: 'value', header: hoverUnit ? `Value (${hoverUnit})` : 'Value', align: 'right' },
            ]}
            rows={tableRows}
          />
        </div>
      )}

      {showLegend && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '6px 12px', fontSize: 12 }}>
          {legendTitle && <span style={{ paddingTop: 1, whiteSpace: 'nowrap' }}>{legendTitle}</span>}
          {/* flex-basis/min-width: on a phone the colour bar gets its own row instead of being squeezed until its tick labels collide. */}
          <div style={{ flex: '1 1 220px', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div aria-hidden="true" style={{ height: 10, borderRadius: 2, background: gradient }} />
            <div aria-hidden="true" style={{ position: 'relative', height: 14 }}>
              {ticks.map((t) => (
                <span key={t.value} style={{ position: 'absolute', left: `${t.pos}%`, transform: 'translateX(-50%)' }}>{t.label}</span>
              ))}
            </div>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', paddingTop: 1 }}>
            <span aria-hidden="true" style={{ width: 12, height: 10, borderRadius: 2, background: noDataColor ?? noDataSwatch ?? 'var(--__s9cmpx-chart-surface-text-weak)' }} />
            {noDataLabel}
          </span>
        </div>
      )}

      {showControls && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Button variant="secondary" size="xs" aria-label="Zoom in" disabled={tableOpen} onClick={() => applyAction({ dLon: 0, dLat: 0, dZoom: 0.5, reset: false })}>+</Button>
          <Button variant="secondary" size="xs" aria-label="Zoom out" disabled={tableOpen} onClick={() => applyAction({ dLon: 0, dLat: 0, dZoom: -0.5, reset: false })}>−</Button>
          <Button variant="secondary" size="xs" disabled={tableOpen} onClick={() => applyAction({ dLon: 0, dLat: 0, dZoom: 0, reset: true })}>Reset view</Button>
          <Button variant="secondary" size="xs" aria-pressed={tableOpen} onClick={() => setTableOpen((o) => !o)}>{tableOpen ? 'Globe view' : 'Table view'}</Button>
          <span id={hintId} style={{ marginLeft: 'auto', fontSize: 12 }}>Drag to spin · arrow keys rotate · + / − zoom · 0 resets</span>
        </div>
      )}
    </div>
  );
}
