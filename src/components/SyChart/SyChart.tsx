import React from 'react';
import Plotly from 'plotly.js-dist-min';
import { cx } from '../../lib/cx';

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
  /** Show the colorbar legend for `colorValues`. Defaults to true when `colorValues` is set. */
  showColorbar?: boolean;
  /** Colorbar title, shown above the scale (e.g. "% Change in CO₂ (1990→2024)") */
  colorbarTitle?: string;
  /** Dotted overlay line (as in Upgrade/Downgrade Ratio) */
  dashed?: boolean;
  /** 'choropleth' only: one location code per data point (see `locationmode`) */
  locations?: string[];
  /** 'choropleth' only: Plotly location mode. Defaults to 'ISO-3'. */
  locationmode?: string;
  /**
   * 'choropleth' only: log-transforms `colorValues` for the color scale. Plotly has no native
   * log-scale colorbar, so this pre-transforms `z` and renders the colorbar's ticks
   * back-transformed into real units rather than raw log values.
   */
  zLog?: boolean;
  /** 'treemap' only: one label per tile */
  labels?: string[];
  /** 'treemap' only: parent label per tile; '' for a flat (non-hierarchical) treemap */
  parents?: string[];
  /** 'treemap' only: tile size per entry */
  values?: number[];
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

function withAlpha(color: string, alpha: number): string {
  // hex → rgba; anything else falls back to the raw color
  const m = color.match(/^#([0-9a-f]{6})/i);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Round-number tick positions (in log10 space) spanning `values`, labeled with the real,
 * back-transformed unit — Plotly's colorbar only ever shows the raw z values otherwise. */
function logColorbarTicks(values: Array<number | null>): { tickvals: number[]; ticktext: string[] } {
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
  ariaLabel,
  className,
}: SyChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const palette = syPalette(el);
    const font = {
      family: cssVar(el, '--__s9cmpx-font-families-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
      size: 12,
      color: cssVar(el, '--__s9cmpx-static-text-weak', '#757575'),
    };
    const data = series.flatMap((s, i): unknown[] => {
      const color = s.color ?? palette[i % palette.length];
      if (s.kind === 'choropleth') {
        const z = s.zLog ? (s.colorValues ?? []).map((v) => (v != null && v > 0 ? Math.log10(v) : null)) : s.colorValues;
        const logTicks = s.zLog ? logColorbarTicks(s.colorValues ?? []) : undefined;
        return [
          {
            type: 'choropleth',
            name: s.name,
            locations: s.locations,
            locationmode: s.locationmode ?? 'ISO-3',
            z,
            colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
            showscale: s.showColorbar ?? true,
            marker: { line: { color: cssVar(el, '--__s9cmpx-static-divider-weak', 'rgba(31,31,31,0.08)'), width: 0.5 } },
            colorbar: {
              title: s.colorbarTitle ? { text: s.colorbarTitle, font } : undefined,
              thickness: 14,
              outlinewidth: 0,
              tickfont: font,
              ...(logTicks ? { tickvals: logTicks.tickvals, ticktext: logTicks.ticktext } : {}),
            },
          },
        ];
      }
      if (s.kind === 'treemap') {
        return [
          {
            type: 'treemap',
            name: s.name,
            labels: s.labels,
            parents: s.parents,
            values: s.values,
            textfont: font,
            marker: s.colorValues
              ? {
                  colors: s.colorValues,
                  colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
                  showscale: s.showColorbar ?? true,
                  colorbar: {
                    title: s.colorbarTitle ? { text: s.colorbarTitle, font } : undefined,
                    thickness: 14,
                    outlinewidth: 0,
                    tickfont: font,
                  },
                }
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
        return [
          {
            type: 'scatter',
            mode: 'lines+markers',
            name: s.name,
            x: s.x,
            y: s.y,
            line: { color, width: 1.5, dash: s.dashed ? 'dot' : 'solid' },
            marker: { color, size: 5 },
          },
        ];
      }
      const marker = s.colorValues
        ? {
            color: s.colorValues,
            colorscale: s.colorScale ?? DEFAULT_CONTINUOUS_SCALE,
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
    const hasChoropleth = series.some((s) => s.kind === 'choropleth');
    // Choropleth maps size themselves off their own container width rather than the fixed
    // `height` prop -- a hardcoded height either leaves large empty side margins on wide
    // desktop containers (Plotly is height-bound, so it centers a narrower map) or renders a
    // tiny map lost in a mostly-empty box on narrow/mobile containers (still width-bound, but
    // now against a height built for desktop). `height` is just the pre-measurement fallback
    // for the very first paint, corrected via the ResizeObserver-driven relayout below.
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
    const layout = {
      barmode,
      height,
      font,
      // Choropleths have no axis titles/ticks to reserve room for -- the default left
      // margin (sized for a y-axis title) would otherwise reduce usable map width and
      // shift it off-center.
      margin: hasChoropleth ? { l: 8, r: 8, t: 8, b: 8 } : { l: 48, r: 8, t: 8, b: 32 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: showLegend,
      legend: { orientation: 'h', y: 1.12, x: 0, font },
      xaxis: {
        title: xTitle ? { text: xTitle, font } : undefined,
        fixedrange: true,
        tickfont: font,
        automargin: true,
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
    Plotly.react(el, data, layout, { displayModeBar: false, responsive: true });

    // Corrects the initial fallback height once the container's real width is known, and
    // keeps it in sync across resizes -- an imperative Plotly.relayout rather than a React
    // state update feeding back into this same effect, since a rapid purge+react cycle
    // immediately following the first one (which a state-driven re-render would cause, as
    // ResizeObserver fires once immediately on observe()) raced Plotly's own internal async
    // update pipeline in jsdom and threw. relayout is Plotly's own supported mechanism for
    // exactly this kind of live resize and carries no such risk.
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
    }

    return () => {
      resizeObserver?.disconnect();
      Plotly.purge(el);
    };
  }, [series, barmode, orientation, height, xTitle, yTitle, showLegend, yTickFormat, referenceY, yRange, xRange, annotations]);

  const fallbackDescription =
    [yTitle, xTitle ? `by ${xTitle}` : null, series.length ? `— ${series.map((s) => s.name).join(', ')}` : null]
      .filter(Boolean)
      .join(' ') || 'Chart';

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel ?? fallbackDescription}
      className={cx('__s9cmpx-chart', '__s9cmpx-chart-plotly', className)}
      style={{ width: '100%' }}
    />
  );
}
