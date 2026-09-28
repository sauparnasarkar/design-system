// Pure color/tick math used by SyChart, split out from SyChart.tsx so it can be unit-tested
// (src/**/*.test.ts runs in a plain Node environment) without pulling in
// plotly.js-dist-min — that module has a module-scope reference to `self` that only exists
// in a browser, so importing anything from SyChart.tsx itself crashes under Node.

import { format as d3Format } from 'd3-format';

/**
 * Formats a raw hover value using the same d3-format spec passed to `yTickFormat` (e.g.
 * '$,.2s', '.0%') -- Plotly's own axis tick rendering already uses d3-format under the hood,
 * so reusing the identical library/spec here is what keeps a tooltip's per-bar value in the
 * same units as its axis, rather than a plain locale-formatted raw number (e.g. "3072973124.24"
 * next to an axis reading "$3.0G"). Falls back to the previous plain-number formatting when no
 * spec is given, or when the spec itself is malformed -- a bad format string should never crash
 * a tooltip.
 */
export function formatChartValue(value: number, spec?: string): string {
  if (!spec) return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  try {
    return d3Format(spec)(value);
  } catch {
    return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }
}

/**
 * Discrete (non-colorValues) treemap tile fills: the caller's own explicit `tileColors`
 * wins when given (its job is capping/naming the palette deliberately, e.g. top-8 + a neutral
 * "Other"/"Not classified" bucket); otherwise cycle the theme's categorical `palette`, one
 * color per label, wrapping with no cap -- the exact behavior this replaces inline in
 * SyChart.tsx, extracted here so the "wins/falls back" choice itself is unit-testable without
 * pulling in plotly.js-dist-min.
 */
export function resolveTileColors(labels: string[], tileColors: string[] | undefined, palette: string[]): string[] {
  if (tileColors) return tileColors;
  return labels.map((_, idx) => palette[idx % palette.length]);
}

/** hex → rgba; anything else falls back to the raw color unchanged. */
export function withAlpha(color: string, alpha: number): string {
  const m = color.match(/^#([0-9a-f]{6})/i);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Round-number tick positions (in log10 space) spanning `values`, labeled with the real,
 * back-transformed unit — Plotly's colorbar only ever shows the raw z values otherwise. */
export function logColorbarTicks(values: Array<number | null>): { tickvals: number[]; ticktext: string[] } {
  const nums = values.filter((v): v is number => v != null && v > 0);
  if (nums.length === 0) return { tickvals: [], ticktext: [] };
  const minExp = Math.floor(Math.log10(Math.min(...nums)));
  const maxExp = Math.ceil(Math.log10(Math.max(...nums)));
  const tickvals: number[] = [];
  const ticktext: string[] = [];
  for (let exp = minExp; exp <= maxExp; exp++) {
    const real = 10 ** exp;
    tickvals.push(exp);
    ticktext.push(real >= 1000 ? `${(real / 1000).toLocaleString()}k` : `${real}`);
  }
  return { tickvals, ticktext };
}

/** Hover text for a choropleth's no-data trace -- 'No data reported' by default, or a
 * caller-supplied override (SyChartSeries.noDataHoverText). `useText` swaps the leading label
 * from `%{location}` (the raw ISO code) to `%{text}` (SyChartSeries.locationNames, e.g. the full
 * country name) when the caller supplied one -- see the identical swap in
 * `choroplethHovertemplate` below, which builds the sibling data trace's hovertemplate by the
 * same rule. Kept a plain function (not inlined at the trace-construction site) so it's
 * unit-testable without pulling in plotly.js-dist-min. */
export function noDataHovertemplate(noDataHoverText?: string, useText?: boolean): string {
  return `${useText ? '%{text}' : '%{location}'}<br>${noDataHoverText ?? 'No data reported'}<extra></extra>`;
}

/** Hover text for a choropleth's main data trace -- the location label (`%{location}`, the raw
 * ISO code, or `%{text}`/SyChartSeries.locationNames when `useText` is set -- same swap as
 * `noDataHovertemplate` above, so a choropleth's two traces are always built by the same rule
 * and can never show mismatched labels for the same country) followed by the real
 * (untransformed) value from `customdata` and an optional `hoverUnit` suffix. Extracted here,
 * not inlined at the trace-construction site, so the four label/unit combinations are
 * unit-testable without pulling in plotly.js-dist-min (Copilot review, PR #78). */
export function choroplethHovertemplate(hoverUnit?: string, useText?: boolean): string {
  const label = useText ? '%{text}' : '%{location}';
  const unit = hoverUnit ? ` ${hoverUnit}` : '';
  return `${label}<br>%{customdata:,.0f}${unit}<extra></extra>`;
}

/** Filters `items` (a choropleth's `locations` or its parallel `locationNames`) down to just the
 * entries whose same-index `colorValues` slot is `null` -- i.e. the no-data trace's membership.
 * Shared by the initial trace construction and the `animationFrame` restyle path in SyChart.tsx
 * so both stay index-aligned by construction (one filter, reused) rather than by two
 * independently-maintained copies of the same predicate risking drift between locations and
 * locationNames as a caller's data changes (Copilot review, PR #78). Returns `undefined` when
 * `items` itself is `undefined` -- `locationNames` is optional; `locations` is always a real
 * array at both call sites (defaulted to `[]`), so that branch never observes `undefined` here. */
export function filterNoData<T>(items: T[] | undefined, colorValues: Array<number | null>): T[] | undefined {
  return items?.filter((_, idx) => colorValues[idx] == null);
}

/** Reads a CSS custom property off `el` (so `[data-theme]` ancestor overrides apply), falling
 * back to `fallback` under SSR (`window` undefined) or when the property resolves empty. Moved
 * here (not left as a SyChart.tsx-local helper) so `SquarifiedTreemap.tsx` can resolve the same
 * theme tokens without importing SyChart.tsx itself, which would drag in `plotly.js-dist-min` --
 * a module with a module-scope `self` reference that crashes this file's own plain-Node vitest
 * environment (see this file's top-of-file comment). */
export function cssVar(el: Element, name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

// JS-level fallback for the theme's 10-slot categorical palette when no [data-theme] CSS var
// resolves at all (e.g. SSR) -- tracks the vendor base theme's own default (-01..-10), not any
// one analytics theme's red/green-avoiding constraint (that lives in each theme's own CSS).
export const FALLBACK_PALETTE = ['#7accf5', '#e66066', '#d19e27', '#87ca65', '#fed26a', '#be8cd7', '#3950c4', '#a333a1', '#46b7b7', '#c42338'];

/** Resolves the theme's 10-slot categorical palette against `el`'s own computed style. */
export function syPalette(el: Element): string[] {
  return FALLBACK_PALETTE.map((fb, i) => cssVar(el, `--__s9cmpx-chart-categorical-default-${String(i + 1).padStart(2, '0')}`, fb));
}

/** WCAG relative-luminance-based ink choice for a tile's own fill: `darkInk` when the fill is
 * light enough to read clearly against it, `lightInk` otherwise (sRGB -> linear -> relative
 * luminance, 0.3 threshold -- same formula the reference squarified-treemap design's own `ink()`
 * helper uses). Falls back to `darkInk` for a fill this can't parse as a 6-digit hex color. */
export function pickTileInk(hex: string, darkInk = '#16150F', lightInk = '#FFFFFF'): string {
  const m = hex.match(/^#([0-9a-f]{6})/i);
  if (!m) return darkInk;
  const n = parseInt(m[1], 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.3 ? darkInk : lightInk;
}

/** The custom squarified renderer only supports flat treemaps (`parents` omitted or all-empty).
 * Any non-empty parent path needs Plotly's native hierarchical treemap trace instead. */
export function hasOnlyFlatTreemapParents(parents?: string[]): boolean {
  return !parents?.some((parent) => parent.trim() !== '');
}

/** Plotly treemap clicks should only be cancelled when a flat treemap would otherwise try to
 * drill into nowhere, or when the caller is deliberately overriding the click with onTileClick. */
export function shouldCancelTreemapClick(parents?: string[], onTileClick?: unknown): boolean {
  return !!onTileClick || hasOnlyFlatTreemapParents(parents);
}

/** The custom squarified treemap renderer is only valid for a chart that consists of exactly one
 * flat treemap series and uses discrete tile colors rather than Plotly's continuous color axis. */
export function shouldUseSquarifiedTreemap(seriesCount: number, parents?: string[], colorValues?: Array<number | null>): boolean {
  return seriesCount === 1 && hasOnlyFlatTreemapParents(parents) && colorValues == null;
}

/** One squarified-treemap tile input: `idx` is the caller's own original array position (so a
 * caller can map a returned rect back to its own parallel `labels`/`tileColors`/etc. arrays
 * regardless of the sort/filter this function's caller applies before calling), `value` its
 * tile-size weight. */
export interface SquarifyItem {
  idx: number;
  value: number;
}

/** A `SquarifyItem` laid out into a concrete pixel rect. */
export interface SquarifyRect extends SquarifyItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Squarified treemap layout (Bruls/Huizing/van Wijk): lays `items` out into a `W`x`H` pixel
 * area, greedily building each row/column to keep tile aspect ratios as close to square as the
 * remaining space allows, rather than a single strip that produces increasingly sliver-thin
 * tiles for small values. `items` should already be sorted descending by `value` (this function
 * does not sort) -- squarify's own quality depends on processing the largest remaining item
 * first at each step, exactly as the classic algorithm and the reference mock's own
 * implementation do. Ported verbatim from that mock (same recurrence, same worst-ratio row-break
 * heuristic), typed and made index-aware for reuse as a general-purpose layout, not tied to any
 * one caller's row shape.
 */
export function squarify(items: SquarifyItem[], W: number, H: number): SquarifyRect[] {
  const sum = (arr: { a: number }[]) => arr.reduce((t, x) => t + x.a, 0);
  const total = items.reduce((t, i) => t + i.value, 0);
  if (!total || !W || !H) return [];
  const nodes = items.map((i) => ({ ...i, a: (i.value * W * H) / total }));
  type Node = (typeof nodes)[number];
  const out: SquarifyRect[] = [];
  let row: Node[] = [];
  let rx = 0;
  let ry = 0;
  let rw = W;
  let rh = H;
  let i = 0;
  const worst = (rowNodes: Node[], side: number): number => {
    const s = sum(rowNodes);
    const mx = Math.max(...rowNodes.map((n) => n.a));
    const mn = Math.min(...rowNodes.map((n) => n.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  const place = () => {
    const s = sum(row);
    if (rw >= rh) {
      const cw = s / rh;
      let cy = ry;
      row.forEach((n) => {
        const ch = n.a / cw;
        out.push({ idx: n.idx, value: n.value, x: rx, y: cy, w: cw, h: ch });
        cy += ch;
      });
      rx += cw;
      rw -= cw;
    } else {
      const ch = s / rw;
      let cx = rx;
      row.forEach((n) => {
        const cw = n.a / ch;
        out.push({ idx: n.idx, value: n.value, x: cx, y: ry, w: cw, h: ch });
        cx += cw;
      });
      ry += ch;
      rh -= ch;
    }
    row = [];
  };
  while (i < nodes.length) {
    const side = Math.min(rw, rh);
    const n = nodes[i];
    if (!row.length || worst([...row, n], side) <= worst(row, side)) {
      row.push(n);
      i++;
    } else {
      place();
    }
  }
  if (row.length) place();
  return out;
}
