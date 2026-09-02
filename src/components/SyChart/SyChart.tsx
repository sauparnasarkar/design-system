import React from 'react';
import Plotly from 'plotly.js-dist-min';
// Named type imports come from `plotly.js` directly rather than `Plotly.<Type>` dotted access on
// the `plotly.js-dist-min` default import -- see the identical comment in Gauge.tsx for why
// (confirmed against climate-emissions-analysis-project's own build: dotted namespace-style type
// access through `plotly.js-dist-min`'s `export =` re-export doesn't resolve reliably once this
// file is type-checked from a consuming project via a path-mapped alias).
import type { Color, Data, Layout, PlotData, PlotMarker } from 'plotly.js';
import { cx } from '../../lib/cx';
import { logColorbarTicks, noDataHovertemplate, withAlpha } from './chartMath';

// `PlotData.type: PlotType` already covers every trace kind this component emits (bar/scatter/
// choropleth/treemap), so a single `Partial<PlotData>` element type is enough -- no need for a
// sibling union type. `meta`/`cmid` are real, standard Plotly trace/marker fields this component
// sets (trace tagging for later lookup; colorscale zero-midpoint pinning) that this version of
// `@types/plotly.js` simply doesn't declare on `PlotData`/`PlotMarker` -- added here rather than
// cast away at each use. A handful of other fields (colors/locations restyle-wrapping, null
// entries) are still narrower in the upstream types than plotly.js-dist-min accepts at runtime;
// those are cast individually at their exact call sites below, each with a comment explaining the
// real gap.
type SyChartTrace = Partial<PlotData> & { meta?: string };
// `cmid` (colorscale zero-midpoint) is likewise a real, standard Plotly marker field not declared
// on `PlotMarker` in this version of `@types/plotly.js`.
type SyChartMarker = Partial<PlotMarker> & { cmid?: number };

export interface SyChartSeries {
  name: string;
  /** Unused for 'choropleth'/'treemap' — pass `[]` for those kinds. */
  x: Array<string | number>;
  /** Unused for 'choropleth'/'treemap' — pass `[]` for those kinds. */
  y: Array<number | null>;
  /** 'bar' (default), 'line', 'band' (shaded range, e.g. a confidence interval), 'choropleth', or 'treemap' */
  kind?: 'bar' | 'line' | 'band' | 'choropleth' | 'treemap';
  /** Lower bound for kind 'band'; `y` is the upper bound */
  yLower?: Array<number | null>;
  /** Fill opacity for kind 'band' (0–1). Defaults to 0.25. */
  fillOpacity?: number;
  /** Any CSS color; defaults to the categorical palette in order */
  color?: string;
  /**
   * Per-bar colors for 'bar' series (e.g. sign-based or gradient coloring).
   * Index i overrides `color`/palette for bar i; undefined entries fall back.
   */
  pointColors?: Array<string | undefined>;
  /**
   * Continuous color scale for 'bar'/'choropleth'/'treemap' series (e.g. a magnitude- or
   * % change-driven gradient). Numeric values mapped through Plotly's native colorscale,
   * rendering a real colorbar legend. Takes precedence over `pointColors`/`color`.
   */
  colorValues?: Array<number | null>;
  /** Plotly colorscale — array of [stop 0–1, CSS color] pairs. Defaults to green→lightgrey→crimson. */
  colorScale?: Array<[number, string]>;
  /**
   * Pins the color axis to a fixed range (same units as `colorValues`, i.e. pre-log values
   * when `zLog` is set — the log10 transform is applied to both bounds internally, same as
   * `colorValues` itself) instead of Plotly's default per-render auto-scaling. Without this,
   * a chart whose data changes over time (e.g. an animated choropleth stepping through years)
   * re-normalizes its color scale to each frame's own min/max, which hides real magnitude
   * change behind constant-looking colors. Applied as `zmin`/`zmax` + `zauto:false`
   * (choropleth) or `cmin`/`cmax` (treemap/bar). When `zLog` is set, the lower bound must be
   * a genuinely positive number — log10 of zero or a negative value is undefined, and while a
   * non-positive bound is defensively floored rather than left `null`, the resulting range is
   * degenerate (an extremely low, effectively meaningless floor), not a real fallback.
   */
  colorRange?: [number, number];
  /**
   * 'choropleth' only: fill color for locations whose `colorValues` entry is `null`. Without
   * this, Plotly simply doesn't draw a location with no data, leaving the map's background
   * showing through — which against a dark theme can read as ocean rather than "no data."
   * Rendered as a second, flat-colored trace beneath the data trace. Defaults to a muted
   * neutral clearly outside the data color scale.
   */
  noDataColor?: string;
  /**
   * 'choropleth' only: hover tooltip text for locations with a `null` colorValues entry. Defaults
   * to a generic "No data reported" so callers other than this app aren't required to supply one.
   * Previously `hoverinfo: 'skip'` on this trace, which produced a completely silent hover --
   * correct in that it avoided showing a false numeric value, but read as an unresponsive control
   * rather than the actual, informative fact ("no data has been reported for this location").
   */
  noDataHoverText?: string;
  /** Show the colorbar legend for `colorValues`. Defaults to true when `colorValues` is set. */
  showColorbar?: boolean;
  /** Colorbar title, shown above the scale (e.g. "% Change in CO₂ (1990→2024)") */
  colorbarTitle?: string;
  /** Dotted overlay line (as in Upgrade/Downgrade Ratio) */
  dashed?: boolean;
  /**
   * 'line' only: show a marker dot at every point. Defaults to `x.length < 10` — dense
   * multi-country/multi-year series render as pure strokes (matches a reference dark-theme
   * line chart's convention and avoids ~350 competing dots on a 35-point x 10-series chart),
   * while sparse series keep markers, which genuinely aid reading at low point counts.
   */
  showMarkers?: boolean;
  /** 'choropleth' only: one location code per data point (see `locationmode`) */
  locations?: string[];
  /** 'choropleth' only: Plotly location mode. Defaults to 'ISO-3'. */
  locationmode?: PlotData['locationmode'];
  /**
   * 'choropleth' only: log-transforms `colorValues` for the color scale. Plotly has no native
   * log-scale colorbar, so this pre-transforms `z` and renders the colorbar's ticks
   * back-transformed into real units rather than raw log values.
   */
  zLog?: boolean;
  /** 'choropleth'/'treemap' only: unit label appended to the hover tooltip's value(s) (e.g. 'MtCO₂') */
  hoverUnit?: string;
  /** 'treemap' only: one label per tile */
  labels?: string[];
  /** 'treemap' only: parent label per tile; '' for a flat (non-hierarchical) treemap */
  parents?: string[];
  /** 'treemap' only: tile size per entry */
  values?: number[];
  /**
   * 'treemap' only: label for the tile-size (`values`) metric in the hover tooltip (e.g.
   * "Cumulative BAU"). Plotly's default treemap hover otherwise only shows the tile's label
   * and its size, silently dropping the metric `colorValues` actually encodes even though
   * that's what the tile's color represents. `colorbarTitle` is reused as the delta metric's
   * own hover label, so both numbers driving the tile (size and color) are visible on hover.
   */
  valueLabel?: string;
  /**
   * 'treemap' only: called with (pointNumber, label) when a tile is tapped/clicked, in place
   * of Plotly's default click-to-zoom-in behavior (which this component always cancels for
   * treemaps — see SPEC.md §5.10: with `parents` always flat/empty there's nothing to
   * legitimately drill into, and the drilled state has no way back out on touch, since
   * `pathbar` isn't shown and a second tap doesn't return to root).
   */
  onTileClick?: (pointNumber: number, label: string) => void;
}

export interface SyChartAnnotation {
  x: string | number;
  y: number;
  text: string;
  /** Draws an arrow pointing at (x, y). Defaults to true (Plotly's own default). */
  showarrow?: boolean;
}

export interface SyChartProps {
  series: SyChartSeries[];
  /** How bar series combine */
  barmode?: 'group' | 'stack';
  /** Bar orientation — 'v' (default, categories on x) or 'h' (categories on y, values on x) */
  orientation?: 'v' | 'h';
  height?: number;
  xTitle?: string;
  yTitle?: string;
  showLegend?: boolean;
  /** e.g. '.0%' or ',d' (Plotly d3-format) */
  yTickFormat?: string;
  /** Dashed horizontal reference line (e.g. "1990 level"). Drawn on the y-axis — intended for vertical charts; in 'h' mode y is the category axis. */
  referenceY?: { value: number; label?: string };
  /** Fixes the y-axis range instead of Plotly's auto-range (e.g. to keep small-multiple charts visually comparable) */
  yRange?: [number, number];
  /** Fixes the x-axis range instead of Plotly's auto-range */
  xRange?: [number | string, number | string];
  /** Extra annotations, merged with (not replacing) the one derived from `referenceY.label` */
  annotations?: SyChartAnnotation[];
  /**
   * 'choropleth' only: new color-value data for the existing choropleth trace(s), applied via
   * a direct `Plotly.restyle` on every change rather than the full `Plotly.react` re-render
   * every other prop change triggers. Confirmed live: `Plotly.restyle` preserves a user's
   * current map zoom/pan exactly, while `Plotly.react` resets it — so a caller animating
   * through frames (e.g. a year slider) should hold every *other* prop (especially `series`)
   * fixed at its initial value and only change `animationFrame` per tick, or the animation
   * both loses the user's zoom and pays the cost of a full re-render (hover handlers rebound,
   * the choropleth's own resize `ResizeObserver` torn down/recreated) on every frame.
   */
  animationFrame?: { colorValues: Array<number | null> };
  /**
   * Accessible text alternative — Plotly's chart is otherwise entirely
   * invisible to screen readers (canvas/SVG with no semantic content). A
   * concise, specific description (e.g. "Line chart of CO2 emissions for
   * China, India, and the US, 1990 to 2024") is far more useful than the
   * auto-generated fallback below, which only knows the axis titles and
   * series names.
   */
  ariaLabel?: string;
  className?: string;
}

function cssVar(el: Element, name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  // resolve against the component's own element so [data-theme] wrappers apply
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

const FALLBACK_PALETTE = ['#7accf5', '#e66066', '#d19e27', '#87ca65', '#fed26a', '#be8cd7', '#3950c4', '#a333a1', '#46b7b7'];

const DEFAULT_CONTINUOUS_SCALE: Array<[number, string]> = [
  [0, 'green'],
  [0.5, 'lightgrey'],
  [1, 'crimson'],
];

function syPalette(el: Element): string[] {
  return FALLBACK_PALETTE.map((fb, i) => cssVar(el, `--__s9cmpx-chart-categorical-default-0${i + 1}`, fb));
}

/**
 * Plotly chart in the `__s9cmpx-chart` / `__s9cmpx-chart-plotly` wrapper — the charting
 * stack used across data products. Shapes: single-series column,
 * stacked column (+ line overlay), grouped column, multi-series line, and
 * shaded bands (forecast confidence intervals) with optional reference line.
 */
export function SyChart({
  series,
  barmode = 'group',
  orientation = 'v',
  height = 280,
  xTitle,
  yTitle,
  showLegend = true,
  yTickFormat,
  referenceY,
  yRange,
  xRange,
  annotations,
  animationFrame,
  ariaLabel,
  className,
}: SyChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const hideTooltipTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetViewRef = React.useRef<(() => void) | null>(null);
  // Set once the main effect below has drawn a plot; gates the animationFrame effect so it
  // never fires against a not-yet-drawn (or already-purged) Plotly div.
  const plotDrawnRef = React.useRef(false);
  // Trace indices within the `data` array Plotly.react was last called with, so the
  // animationFrame effect's Plotly.restyle calls target the right traces without re-deriving
  // the whole array. Undefined when the corresponding trace doesn't exist this render (e.g. no
  // no-data trace when nothing is null).
  const traceIndexRef = React.useRef<{ data?: number; noData?: number }>({});
  // The choropleth series' own locations/zLog, captured so the animationFrame effect can
  // recompute the no-data trace's membership and apply the same log transform without needing
  // the full `series` prop (which must stay referentially stable across animation frames).
  const choroplethMetaRef = React.useRef<{ locations: string[]; zLog?: boolean }>({ locations: [] });
  const hasChoropleth = series.some((s) => s.kind === 'choropleth');
  const hasTreemap = series.some((s) => s.kind === 'treemap');
  // hovermode: 'x unified' below renders one label box per hovered x, positioned by Plotly
  // near the topmost active trace's own y-pixel at that x -- which moves as that value moves,
  // and can flip from one side of the cursor to the other near the plot's edges (confirmed
  // live: 10-series charts on Scenario Comparison). A custom tooltip pinned to a fixed
  // position sidesteps that; only meaningful for cartesian (line/bar/band) charts, since
  // choropleth/treemap hover is per-point/per-tile, not this unified box.
  const useFixedTooltip = !hasChoropleth && !hasTreemap;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const palette = syPalette(el);
    const font = {
      family: cssVar(el, '--__s9cmpx-font-families-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
      size: 12,
      color: cssVar(el, '--__s9cmpx-static-text-weak', '#757575'),
    };
    const data = series.flatMap((s, i): SyChartTrace[] => {
      const color = s.color ?? palette[i % palette.length];
      if (s.kind === 'choropleth') {
        const colorValues = s.colorValues ?? [];
        const logTransform = (v: number) => (v > 0 ? Math.log10(v) : null);
        const z = s.zLog ? colorValues.map((v) => (v != null ? logTransform(v) : null)) : s.colorValues;
        const logTicks = s.zLog ? logColorbarTicks(colorValues) : undefined;
        // Unlike logTransform above (where a non-positive data point legitimately has no
        // color, i.e. null), a colorRange bound must always resolve to a real number --
        // Plotly's behavior with zmin/zmax: null alongside zauto: false is undefined, and
        // could silently fall back to auto-scaling, defeating the point of pinning the range
        // at all (Copilot review, PR #28). Callers should pass a genuinely positive lower
        // bound when zLog is set (see colorRange's own doc comment); this floor is a
        // defensive fallback for one that doesn't, not the intended path.
        const logTransformBound = (v: number) => (v > 0 ? Math.log10(v) : Math.log10(Number.MIN_VALUE));
        const [zmin, zmax] = s.colorRange
          ? s.zLog
            ? [logTransformBound(s.colorRange[0]), logTransformBound(s.colorRange[1])]
            : s.colorRange
          : [undefined, undefined];
        const traces: SyChartTrace[] = [];
        // A location with a `null` colorValues entry is simply not drawn by Plotly, leaving
        // the map background showing through -- against this app's dark theme that reads as
        // ocean, not "no data." A second, flat-colored trace underneath the data trace makes
        // the gap visible and unambiguous. Recomputed from whichever colorValues are current,
        // since the animationFrame effect below re-derives this same set per frame (the no-data
        // set is not static: it shrinks as an animated choropleth steps through years).
        //
        // Always constructed -- even with zero locations -- rather than only when this
        // render's colorValues happens to contain a null. traceIndexRef below is captured
        // once, at this construction, and animationFrame's own effect never re-runs this
        // construction; if the trace were only created when the *initial* frame had nulls, a
        // caller whose first frame happened to be fully populated would permanently lose
        // no-data highlighting for every later frame that does introduce one (Copilot review,
        // PR #28) -- an empty-locations trace costs nothing and renders nothing, so there's no
        // reason to make its existence conditional at all.
        const noDataLocations = (s.locations ?? []).filter((_, idx) => colorValues[idx] == null);
        traces.push({
          type: 'choropleth',
          meta: 'sychart-choropleth-nodata',
          name: `${s.name} (no data)`,
          locations: noDataLocations,
          locationmode: s.locationmode ?? 'ISO-3',
          z: noDataLocations.map(() => 0),
          colorscale: [
            [0, s.noDataColor ?? '#4a4a4a'],
            [1, s.noDataColor ?? '#4a4a4a'],
          ],
          showscale: false,
          hovertemplate: noDataHovertemplate(s.noDataHoverText),
          marker: { line: { color: cssVar(el, '--__s9cmpx-static-divider-weak', 'rgba(31,31,31,0.08)'), width: 0.5 } },
        });
        traces.push({
          type: 'choropleth',
          meta: 'sychart-choropleth-data',
          name: s.name,
          locations: s.locations,
          locationmode: s.locationmode ?? 'ISO-3',
          z,
          ...(s.colorRange ? { zmin, zmax, zauto: false } : {}),
          // The real (untransformed) value, even when zLog log10-transformed z for coloring --
          // hovertemplate reads from here instead of the implicit %{z} fallback, which would
          // otherwise show the raw log10 number rather than the actual MtCO2 figure.
          customdata: s.colorValues,
          hovertemplate: s.hoverUnit
            ? `%{location}<br>%{customdata:,.0f} ${s.hoverUnit}<extra></extra>`
            : '%{location}<br>%{customdata:,.0f}<extra></extra>',
          colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
          showscale: s.showColorbar ?? true,
          marker: { line: { color: cssVar(el, '--__s9cmpx-static-divider-weak', 'rgba(31,31,31,0.08)'), width: 0.5 } },
          // Horizontal, positioned below the map -- a vertical colorbar spans the full geo
          // domain box, but the natural-earth projection is aspect-fit *within* that box and
          // is often letterboxed shorter than it (worse at narrower widths), so a vertical
          // colorbar reads visibly taller than the map itself. Horizontal sidesteps the
          // mismatch entirely instead of tuning a `len` heuristic to compensate for it.
          colorbar: {
            title: s.colorbarTitle ? { text: s.colorbarTitle, font } : undefined,
            orientation: 'h',
            thickness: 14,
            len: 0.8,
            y: -0.05,
            yanchor: 'top',
            outlinewidth: 0,
            tickfont: font,
            ...(logTicks ? { tickvals: logTicks.tickvals, ticktext: logTicks.ticktext } : {}),
          },
        });
        return traces;
      }
      if (s.kind === 'treemap') {
        // Plotly's default treemap hover only shows the tile's label and its size (`values`)
        // -- it silently drops the metric `colorValues` encodes even though that's what the
        // tile's color represents, which is exactly the number a viewer wants after reading
        // the color legend. customdata carries the real (unclamped) color values through so
        // both the size and color metrics show on hover; valueLabel/colorbarTitle label each.
        const unit = s.hoverUnit ? ` ${s.hoverUnit}` : '';
        // Pre-formatted (not raw numbers) so the sign prefix is guaranteed -- Plotly's
        // hovertemplate number formatting doesn't reliably support the "+" sign flag
        // (`%{customdata:+,.0f}` silently fell back to an unformatted raw float when tested).
        const formattedDeltas = s.colorValues?.map((v) =>
          v == null ? null : `${v >= 0 ? '+' : ''}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        );
        const hovertemplate = s.colorValues
          ? `%{label}<br>${s.valueLabel ?? 'Value'}: %{value:,.0f}${unit}<br>${s.colorbarTitle ?? 'Color'}: %{customdata}${unit}<extra></extra>`
          : undefined;
        return [
          {
            type: 'treemap',
            name: s.name,
            labels: s.labels,
            parents: s.parents,
            values: s.values,
            customdata: formattedDeltas,
            hovertemplate,
            // No explicit `color` here (unlike `font` used elsewhere against the fixed page
            // background) -- tile fills vary from crimson through lightgrey to green, and a
            // single static text color is illegible against a chunk of that range. Omitting
            // `color` lets Plotly fall back to its own per-tile black/white contrast choice.
            textfont: { family: font.family, size: font.size },
            marker: s.colorValues
              ? {
                  // `Color[]`'s element type doesn't include a bare `null`, but Plotly's real
                  // runtime treats a `null` entry in `marker.colors` as "no color for this tile" --
                  // the same convention already relied on for `z`/`customdata` elsewhere in this
                  // file, just not modeled for this specific field in `@types/plotly.js`.
                  colors: s.colorValues as unknown as Color[],
                  colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
                  // Plotly auto-scales a continuous colorscale to the actual min/max of the
                  // provided values, not to a fixed zero-centered range -- with no colorScale
                  // override (i.e. the default green/lightgrey/crimson "below/above a
                  // reference point" convention), that silently breaks the convention itself
                  // whenever the data is skewed: e.g. one huge outlier riser drags the
                  // "crimson" end far to the right, so every merely-modest riser lands near
                  // the "green" end of the auto-range and reads as green despite being an
                  // increase. Pinning the midpoint to true 0 keeps lightgrey at "no change"
                  // and red/green symmetric around it regardless of skew. Only applied to the
                  // default scale -- a custom colorScale (e.g. a one-sided magnitude scale)
                  // may not have a meaningful zero crossing at all.
                  cmid: s.colorScale ? undefined : 0,
                  ...(s.colorRange ? { cmin: s.colorRange[0], cmax: s.colorRange[1] } : {}),
                  showscale: s.showColorbar ?? true,
                  colorbar: {
                    title: s.colorbarTitle ? { text: s.colorbarTitle, font } : undefined,
                    thickness: 14,
                    outlinewidth: 0,
                    tickfont: font,
                  },
                } as SyChartMarker
              : undefined,
          },
        ];
      }
      if (s.kind === 'band') {
        return [
          {
            type: 'scatter',
            mode: 'lines',
            name: s.name,
            x: s.x,
            y: s.yLower ?? s.y,
            line: { width: 0 },
            hoverinfo: 'skip',
            showlegend: false,
          },
          {
            type: 'scatter',
            mode: 'lines',
            name: s.name,
            x: s.x,
            y: s.y,
            line: { width: 0 },
            fill: 'tonexty',
            fillcolor: withAlpha(color, s.fillOpacity ?? 0.25),
          },
        ];
      }
      if (s.kind === 'line') {
        const showMarkers = s.showMarkers ?? s.x.length < 10;
        return [
          {
            type: 'scatter',
            mode: showMarkers ? 'lines+markers' : 'lines',
            name: s.name,
            x: s.x,
            y: s.y,
            line: { color, width: 2.75, dash: s.dashed ? 'dot' : 'solid' },
            ...(showMarkers ? { marker: { color, size: 5 } } : {}),
          },
        ];
      }
      const marker = s.colorValues
        ? {
            color: s.colorValues,
            colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
            // See the treemap branch's identical cmid comment above -- same auto-range skew
            // risk applies to bar's marker.color continuous scaling.
            cmid: s.colorScale ? undefined : 0,
            ...(s.colorRange ? { cmin: s.colorRange[0], cmax: s.colorRange[1] } : {}),
            showscale: s.showColorbar ?? true,
            colorbar: {
              title: s.colorbarTitle ? { text: s.colorbarTitle, font } : undefined,
              thickness: 14,
              outlinewidth: 0,
              tickfont: font,
            },
          }
        : { color: s.pointColors ? s.pointColors.map((c) => c ?? color) : color };
      return [
        {
          type: 'bar',
          name: s.name,
          x: orientation === 'h' ? s.y : s.x,
          y: orientation === 'h' ? s.x : s.y,
          orientation,
          marker,
        },
      ];
    });
    const referenceAnnotation = referenceY?.label
      ? [
          {
            xref: 'paper',
            x: 1,
            y: referenceY.value,
            xanchor: 'right',
            yanchor: 'bottom',
            text: referenceY.label,
            showarrow: false,
            font: { ...font, size: 11 },
          },
        ]
      : [];
    const customAnnotations = (annotations ?? []).map((a) => ({
      x: a.x,
      y: a.y,
      text: a.text,
      showarrow: a.showarrow ?? true,
      font: { ...font, size: 11 },
    }));
    const allAnnotations = [...referenceAnnotation, ...customAnnotations];
    const layout: Partial<Layout> = {
      barmode,
      height,
      font,
      // Choropleths have no axis titles/ticks to reserve room for -- the default left
      // margin (sized for a y-axis title) would otherwise reduce usable map width and
      // shift it off-center. Bottom margin is sized for the horizontal colorbar (title +
      // scale + tick labels) that now sits below the map rather than beside it.
      margin: hasChoropleth ? { l: 8, r: 8, t: 8, b: 64 } : { l: 48, r: 8, t: 8, b: 32 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: showLegend,
      legend: { orientation: 'h', y: 1.12, x: 0, font },
      xaxis: {
        title: xTitle ? { text: xTitle, font } : undefined,
        fixedrange: true,
        tickfont: font,
        automargin: true,
        // Gridlines stay on the value axis and drop from the category/index axis -- vertical
        // gridlines on a time series add noise without aiding value comparison, but for a
        // horizontal bar chart (orientation="h": categories on y, values on x, e.g. Forecasts'
        // feature-importance chart) x IS the value axis, so this flips accordingly.
        showgrid: orientation === 'h' ? undefined : false,
        // yTickFormat formats the value axis; in horizontal mode values live on x
        tickformat: orientation === 'h' ? yTickFormat : undefined,
        range: xRange,
        gridcolor: cssVar(el, '--__s9cmpx-color-brand-100', '#ebebeb'),
        zerolinecolor: cssVar(el, '--__s9cmpx-color-brand-200', '#e0e0e0'),
      },
      yaxis: {
        title: yTitle ? { text: yTitle, font } : undefined,
        fixedrange: true,
        tickfont: font,
        automargin: true,
        showgrid: orientation === 'h' ? false : undefined,
        tickformat: orientation === 'h' ? undefined : yTickFormat,
        range: yRange,
        gridcolor: cssVar(el, '--__s9cmpx-color-brand-100', '#ebebeb'),
        zerolinecolor: cssVar(el, '--__s9cmpx-color-brand-200', '#e0e0e0'),
      },
      geo: hasChoropleth
        ? {
            showframe: false,
            showcoastlines: false,
            projection: { type: 'natural earth' },
            bgcolor: 'rgba(0,0,0,0)',
            lakecolor: cssVar(el, '--__s9cmpx-static-layer-standard', '#1f1f1f'),
            landcolor: cssVar(el, '--__s9cmpx-static-divider-weak', 'rgba(31,31,31,0.08)'),
            // Country-level choropleths never need Antarctica/high-Arctic ocean, which
            // Plotly otherwise reserves visible latitude range for -- cropping it lets the
            // map scale up to fill more of the available width for the same chart height,
            // instead of centering a smaller map with large empty margins on both sides.
            lataxis: { range: [-60, 85] },
          }
        : undefined,
      hovermode: 'x unified',
      shapes: referenceY
        ? [
            {
              type: 'line',
              xref: 'paper',
              x0: 0,
              x1: 1,
              y0: referenceY.value,
              y1: referenceY.value,
              line: { color: cssVar(el, '--__s9cmpx-static-text-weak', '#757575'), width: 1, dash: 'dot' },
            },
          ]
        : undefined,
      annotations: allAnnotations.length > 0 ? allAnnotations : undefined,
    };
    const config = { displayModeBar: false, responsive: true };
    Plotly.react(el, data as unknown as Data[], layout, config);
    plotDrawnRef.current = true;
    const dataTraceIndex = data.findIndex((d) => (d as { meta?: string }).meta === 'sychart-choropleth-data');
    const noDataTraceIndex = data.findIndex((d) => (d as { meta?: string }).meta === 'sychart-choropleth-nodata');
    traceIndexRef.current = {
      data: dataTraceIndex >= 0 ? dataTraceIndex : undefined,
      noData: noDataTraceIndex >= 0 ? noDataTraceIndex : undefined,
    };
    // Assumes a single choropleth series -- same precedent as the treemap onTileClick handler
    // below. animationFrame is a single (not per-series) prop for exactly this reason.
    const choroplethSeries = series.find((s) => s.kind === 'choropleth');
    choroplethMetaRef.current = { locations: choroplethSeries?.locations ?? [], zLog: choroplethSeries?.zLog };

    // "Reset view" control (rendered below, choropleth only). Verified live (Storybook +
    // direct Plotly state inspection) that re-supplying the original layout via Plotly.react
    // does NOT reset an interactively-changed geo view -- react's diffing treats a
    // geo.center/geo.projection.scale absent from the new spec as "leave whatever's already
    // there," not "reset to default," once a separate relayout call (pinch/scroll-zoom) has
    // set them. Explicitly relayout-ing scale back to 1 and center to null (letting Plotly
    // recompute its own auto-fit center for the cropped lataxis range) is what actually
    // resets it -- confirmed the recomputed center matches the lataxis midpoint exactly.
    resetViewRef.current = hasChoropleth
      ? // Plotly's relayout accepts flattened dotted-path keys ('geo.projection.scale') for partial
        // nested updates at runtime; `@types/plotly.js`'s `Layout` only models the nested shape, not
        // this flattened convention, so there's no type this object literal can structurally satisfy.
        () => Plotly.relayout(el, { 'geo.projection.scale': 1, 'geo.center': null } as unknown as Partial<Layout>)
      : null;

    // Treemap tiles are flat (parents always '' -- see SPEC.md §5.10), so Plotly's default
    // click-to-zoom-in has nothing legitimate to drill into and no way back out on touch
    // (no pathbar, a second tap doesn't return to root). Cancel the zoom (return false) and
    // surface the tap via onTileClick instead, if the caller wants it.
    if (series.some((s) => s.kind === 'treemap')) {
      type TreemapClickEvent = { points?: Array<{ pointNumber: number; label: string }> };
      type PlotlyGraphDiv = HTMLDivElement & {
        on: (event: 'plotly_treemapclick', handler: (e: TreemapClickEvent) => boolean) => void;
      };
      (el as PlotlyGraphDiv).on('plotly_treemapclick', (event) => {
        const point = event?.points?.[0];
        // Assumes a single treemap series -- if a future chart ever needs two treemap
        // traces at once, only the first one's onTileClick would fire on a tap.
        const treemapSeries = series.find((s) => s.kind === 'treemap');
        if (point && treemapSeries?.onTileClick) {
          treemapSeries.onTileClick(point.pointNumber, point.label);
        }
        return false;
      });
    }

    // Custom fixed-position tooltip (see useFixedTooltip above). Plotly's own hover event
    // firing/hit-testing is left fully intact -- only its own label box's rendering is
    // suppressed (via the `--custom-tooltip` CSS class below, targeting `.hoverlayer >
    // .legend` specifically), so the spike guideline it also draws stays visible.
    if (useFixedTooltip) {
      // Translucent rather than the theme's flat layer-standard fill, so the chart lines
      // underneath stay visible while the tooltip is up -- resolved once here (not per-hover
      // event, since it doesn't depend on hover data) via the same cssVar/withAlpha pattern
      // already used for band-chart fill opacity above.
      if (tooltipRef.current) {
        tooltipRef.current.style.background = withAlpha(cssVar(el, '--__s9cmpx-static-layer-standard', '#324c7c'), 0.65);
      }
      type HoverPoint = {
        x: number | string;
        y: number | string;
        data: { name: string };
        fullData?: { line?: { color?: string }; marker?: { color?: string } };
      };
      type HoverEvent = { points: HoverPoint[]; event: MouseEvent };
      type PlotlyHoverDiv = HTMLDivElement & {
        on: (event: 'plotly_hover' | 'plotly_unhover', handler: (e?: HoverEvent) => void) => void;
      };
      (el as PlotlyHoverDiv).on('plotly_hover', (event) => {
        const tooltip = tooltipRef.current;
        if (!tooltip || !event?.points.length) return;
        // Cancel any pending hide from a just-prior plotly_unhover -- see that handler below
        // for why one can fire on the way to hovering the tooltip itself.
        if (hideTooltipTimeoutRef.current) {
          clearTimeout(hideTooltipTimeoutRef.current);
          hideTooltipTimeoutRef.current = null;
        }
        const rect = el.getBoundingClientRect();
        const mouseX = event.event.clientX - rect.left;
        // Built via safe DOM APIs (createElement/textContent), not innerHTML -- series names
        // and axis categories both ultimately come from caller-supplied data, which this
        // general-purpose component has no way to guarantee is trusted/pre-sanitized HTML.
        tooltip.replaceChildren();
        const header = document.createElement('div');
        header.style.cssText = 'font-weight:600;margin-bottom:4px;';
        header.textContent = String(event.points[0].x);
        tooltip.appendChild(header);
        for (const p of event.points) {
          const color = p.fullData?.line?.color ?? p.fullData?.marker?.color ?? cssVar(el, '--__s9cmpx-static-text-weak', '#757575');
          const val = typeof p.y === 'number' ? p.y.toLocaleString(undefined, { maximumFractionDigits: 3 }) : String(p.y);
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:6px;white-space:nowrap;';
          const swatch = document.createElement('span');
          swatch.style.cssText = `width:10px;height:10px;border-radius:2px;background:${color};flex-shrink:0;`;
          const label = document.createElement('span');
          label.textContent = `${p.data.name}: ${val}`;
          row.append(swatch, label);
          tooltip.appendChild(row);
        }
        tooltip.style.display = 'block';
        // Horizontal position follows the cursor (still useful as an at-a-glance "which
        // year" cue, and Plotly's spike line already does the same) -- clamped so the box
        // never overflows the chart's own left/right edges.
        const tooltipWidth = tooltip.offsetWidth || 160;
        const left = Math.min(Math.max(mouseX + 12, 4), rect.width - tooltipWidth - 4);
        tooltip.style.left = `${left}px`;
      });
      (el as PlotlyHoverDiv).on('plotly_unhover', () => {
        // Plotly fires this the moment the pointer leaves ITS OWN hit-testing area -- which
        // includes the moment the cursor moves onto the tooltip itself, since that's a sibling
        // element painted on top (see pointerEvents/onMouseEnter+Leave on the tooltip below,
        // which is why it needs pointer-events enabled at all: a series list taller than the
        // chart needs to be scrollable, and pointer-events:none would make that impossible).
        // A short delay (rather than hiding immediately) gives the browser time to deliver the
        // tooltip's own onMouseEnter first when the cursor is actually headed there -- an
        // immediate hide loses the race and the tooltip vanishes before a reaching cursor
        // arrives (confirmed live: synchronous hide-on-unhover made the tooltip disappear the
        // moment the pointer crossed into it). onMouseEnter below cancels this timeout.
        if (hideTooltipTimeoutRef.current) clearTimeout(hideTooltipTimeoutRef.current);
        hideTooltipTimeoutRef.current = setTimeout(() => {
          if (tooltipRef.current) tooltipRef.current.style.display = 'none';
          hideTooltipTimeoutRef.current = null;
        }, 150);
      });
    }

    // Choropleth maps size themselves off their own container width rather than the fixed
    // `height` prop -- a hardcoded height either leaves large empty side margins on wide
    // desktop containers (Plotly is height-bound, so it centers a narrower map) or renders a
    // tiny map lost in a mostly-empty box on narrow/mobile containers (still width-bound, but
    // now against a height built for desktop). `height` above is just the pre-measurement
    // fallback for the very first paint. Plotly.relayout is used rather than a React state
    // update because a state-driven re-render would trigger a rapid purge+react cycle
    // immediately following the first one (ResizeObserver fires once on observe()), which
    // raced Plotly's internal async update pipeline in jsdom and threw. relayout is Plotly's
    // own supported mechanism for exactly this kind of live resize and carries no such risk.
    let resizeObserver: ResizeObserver | undefined;
    if (hasChoropleth) {
      // Matches the natural-earth projection's own visible aspect ratio once cropped via
      // the geo.lataxis range above (measured empirically); the floor guards against a
      // vanishingly small map on an extremely narrow container.
      const CHOROPLETH_ASPECT_RATIO = 2;
      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (!width) return;
        Plotly.relayout(el, { height: Math.max(220, width / CHOROPLETH_ASPECT_RATIO) });
      });
      resizeObserver.observe(el);
    } else if (showLegend && series.length > 3) {
      // A horizontal legend above the plot (see layout.legend below) wraps to more rows once
      // its entries don't fit one container's width -- Plotly gives the legend a fixed share
      // of the chart's own `height` regardless of row count, so once it wraps to more rows
      // than that share can show, it silently becomes an internally-scrollable box instead of
      // growing, and the scrollbar thumb renders as a bare gray bar over the plot with no
      // visible legend container around it (confirmed via direct DOM inspection: with 10
      // countries at a ~290px mobile container width, wrapped rows overflowed the legend's
      // ~40%-of-height allocation, `rect.scrollbar` rendered with a non-zero height instead of
      // the 0 it has when the content fits). Estimating rows from container width and growing
      // `height` accordingly keeps every row visible without scrolling; wide/desktop
      // containers that already fit the legend in one row compute rows=1 and get no change.
      const LEGEND_ITEM_WIDTH = 150; // swatch + gap + a country name as long as "United Kingdom"
      const LEGEND_ROW_HEIGHT = 22; // measured: each wrapped row is ~19-20px tall, plus a small buffer
      resizeObserver = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (!width) return;
        const itemsPerRow = Math.max(1, Math.floor(width / LEGEND_ITEM_WIDTH));
        const rows = Math.ceil(series.length / itemsPerRow);
        Plotly.relayout(el, { height: rows > 1 ? height + (rows - 1) * LEGEND_ROW_HEIGHT : height });
      });
      resizeObserver.observe(el);
    }

    return () => {
      plotDrawnRef.current = false;
      resizeObserver?.disconnect();
      if (hideTooltipTimeoutRef.current) clearTimeout(hideTooltipTimeoutRef.current);
      Plotly.purge(el);
    };
  }, [series, barmode, orientation, height, xTitle, yTitle, showLegend, yTickFormat, referenceY, yRange, xRange, annotations, hasChoropleth, useFixedTooltip]);

  // Deliberately separate from the main effect above -- animationFrame is meant to update at
  // high frequency (e.g. once per ~600ms animation tick) via a direct Plotly.restyle, which
  // preserves the user's current map zoom/pan exactly (confirmed live). Joining it to the main
  // effect's dependency array would instead trigger a full Plotly.react on every tick, which
  // resets the zoom and pays for rebinding hover handlers / tearing down and recreating the
  // choropleth's own resize ResizeObserver -- for no benefit, since only the color data changed.
  React.useEffect(() => {
    const el = ref.current;
    if (!animationFrame || !el || !plotDrawnRef.current) return;
    const { locations, zLog } = choroplethMetaRef.current;
    const colorValues = animationFrame.colorValues;
    const z = zLog ? colorValues.map((v) => (v != null && v > 0 ? Math.log10(v) : null)) : colorValues;
    if (traceIndexRef.current.data != null) {
      Plotly.restyle(el, { z: [z], customdata: [colorValues] }, [traceIndexRef.current.data]);
    }
    if (traceIndexRef.current.noData != null) {
      const noDataLocations = locations.filter((_, idx) => colorValues[idx] == null);
      // restyle wraps each targeted trace's new value in an outer array (confirmed working via
      // the identical convention on `z`/`customdata` above, which `PlotData` types as
      // `Datum[] | Datum[][] | ...` for exactly this reason) -- but `PlotData.locations` is only
      // typed `Datum[]`, missing the `Datum[][]` variant `z`/`customdata` already have.
      Plotly.restyle(el, { locations: [noDataLocations] } as unknown as Partial<Data>, [
        traceIndexRef.current.noData,
      ]);
    }
  }, [animationFrame]);

  const fallbackDescription =
    [yTitle, xTitle ? `by ${xTitle}` : null, series.length ? `— ${series.map((s) => s.name).join(', ')}` : null]
      .filter(Boolean)
      .join(' ') || 'Chart';

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div
        ref={ref}
        role="img"
        aria-label={ariaLabel ?? fallbackDescription}
        className={cx('__s9cmpx-chart', '__s9cmpx-chart-plotly', useFixedTooltip && '__s9cmpx-chart-plotly--custom-tooltip', className)}
        // Plotly's `layout.height` only sizes the plot AFTER it draws -- with no CSS height of
        // its own, this div was 0px tall at the moment the mount effect calls Plotly.react,
        // since no content or CSS rule had given it any height yet. Setting it explicitly makes
        // the container's real size match what layout.height requests from the first frame,
        // instead of relying on Plotly's own post-draw resize.
        style={{ width: '100%', height }}
      />
      {useFixedTooltip && (
        <div
          ref={tooltipRef}
          // Pointer events are on (not 'none') specifically so a series list taller than the
          // chart can be scrolled -- see the grace-period comment on the plotly_unhover handler
          // above for how that's kept from fighting Plotly's own hover detection (which
          // otherwise loses the pointer the moment it reaches this box).
          onMouseEnter={() => {
            if (hideTooltipTimeoutRef.current) {
              clearTimeout(hideTooltipTimeoutRef.current);
              hideTooltipTimeoutRef.current = null;
            }
          }}
          onMouseLeave={() => {
            if (tooltipRef.current) tooltipRef.current.style.display = 'none';
          }}
          style={{
            display: 'none',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            maxHeight: 'calc(100% - 16px)',
            overflowY: 'auto',
            padding: '8px 10px',
            fontSize: 12,
            fontFamily: 'var(--__s9cmpx-font-families-primary)',
            color: 'var(--__s9cmpx-static-text-standard)',
            border: '1px solid var(--__s9cmpx-static-divider-weak)',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        />
      )}
      {hasChoropleth && (
        <button
          type="button"
          onClick={() => resetViewRef.current?.()}
          className="__s9cmpx-sychart-reset-view"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            padding: '4px 10px',
            fontSize: 12,
            fontFamily: 'var(--__s9cmpx-font-families-primary)',
            color: 'var(--__s9cmpx-static-text-weak)',
            background: 'var(--__s9cmpx-static-layer-standard)',
            border: '1px solid var(--__s9cmpx-static-divider-weak)',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Reset view
        </button>
      )}
    </div>
  );
}
