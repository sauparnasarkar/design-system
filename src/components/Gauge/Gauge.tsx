import React from 'react';
import Plotly from 'plotly.js-dist-min';
// Named type imports come from `plotly.js` directly rather than `Plotly.<Type>` dotted access on
// the `plotly.js-dist-min` default import -- `@types/plotly.js-dist-min` is a bare `export =`
// re-export of `plotly.js`'s own namespace, and dotted namespace-style type access through that
// re-export doesn't resolve reliably once this file is type-checked from a consuming project via
// a path-mapped alias (confirmed against climate-emissions-analysis-project's own build, which
// hits `TS2694: Namespace has no exported member` for `Plotly.Data` even in a from-scratch file
// with zero design-system involvement -- a pre-existing gap in that project's tsconfig, not
// something fixable here, but avoidable entirely by importing named types from `plotly.js`).
import type { Data } from 'plotly.js';
import { cx } from '../../lib/cx';

/**
 * `@types/plotly.js`'s `Data` union does not model the `indicator` trace type at all -- confirmed
 * by reading the installed package's own `index.d.ts` -- even though plotly.js-dist-min supports
 * it at runtime. This covers only the fields this component actually sets.
 */
interface IndicatorTrace {
  type: 'indicator';
  mode: string;
  value: number;
  number?: { suffix?: string; font?: { size?: number; family?: string; color?: string } };
  gauge?: {
    axis?: { range?: [number, number]; tickfont?: { size?: number; family?: string; color?: string } };
    bar?: { color?: string; thickness?: number };
    bgcolor?: string;
    borderwidth?: number;
  };
}

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  /** Value suffix in the readout, e.g. "°F" or "%" */
  suffix?: string;
  /** Fill color; defaults to the theme's chart blue */
  color?: string;
  height?: number;
  className?: string;
}

function cssVar(el: Element, name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  // resolve against the component's own element so [data-theme] wrappers apply
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/** Semi-donut gauge (Plotly indicator), as used for "Current Temperature" on BI dashboards. */
export function Gauge({ value, min = 0, max = 100, suffix = '', color, height = 220, className }: GaugeProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Falls back to the categorical palette's slot 01 for any theme that doesn't publish its
    // own --__s9cmpx-gauge-fill-color, matching every theme's behavior before this token
    // existed. That fallback is also the reason a categorical palette re-space can silently
    // change every default-colored Gauge's fill along with it (Copilot review, PR #75, on
    // Tidewater's C2 re-space turning gauges lime along with slot 01) -- a theme that wants
    // its re-spaced slot 01 NOT to double as the gauge default should set this token
    // explicitly, the same opt-out shape as --__s9cmpx-gauge-track-color below.
    const fill = color ?? (cssVar(el, '--__s9cmpx-gauge-fill-color', '') || cssVar(el, '--__s9cmpx-chart-categorical-default-01', '#7accf5'));
    const font = {
      family: cssVar(el, '--__s9cmpx-font-families-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
      // The gauge's own indicator track (bgcolor below) reads --__s9cmpx-color-brand-100,
      // which every theme with a dark chart panel hijacks to an on-dark value (see
      // SyChart.tsx's identical hijack/comment) -- so this number/tick text sits on that
      // dark track, not on the surrounding card's normal surface. --static-text-standard
      // (this theme's general light-surface body ink) was previously used here regardless,
      // which happened to still read correctly under `analytics` (its whole canvas, gauge
      // track included, is already dark, so static-text-standard is already a pale ink) but
      // produced near-invisible dark-on-dark text under `analytics-bright-broadsheet`
      // (confirmed live: 1.5:1 contrast) -- that theme's gauge track is dark while its
      // general body ink is meant for the surrounding light card instead. Falls back to the
      // same literal default as before for every theme that has no dark gauge track at all
      // (default/green/blue), where brand-100 stays a normal light tint.
      color: cssVar(el, '--__s9cmpx-chart-surface-text-weak', '#494949'),
    };
    // The unfilled track defaults to --__s9cmpx-color-brand-100, but that token is also
    // hijacked as SyChart's gridline color on every theme with a dark chart panel (see
    // SyChart.tsx's identical hijack/comment) -- retuning brand-100 to fix a gauge would move
    // every gridline in the theme too. --__s9cmpx-gauge-track-color exists so a theme can give
    // the track its own answer without touching brand-100 at all; it's deliberately NOT given
    // a CSS-level default (cssVar's fallback is a plain string, not a var() reference), so a
    // theme that doesn't set it costs nothing and this chain resolves straight through to
    // today's brand-100 behavior. Only `analytics` currently needs it (its gloss gradient over
    // .js-plotly-plot -- see analytics.css -- makes brand-100's mid-navy blend into the
    // lightened top of the arc at low gauge values, reading as a hole punched in the card; the
    // three bright themes paint a flat, non-gradient panel and don't have this problem).
    const track = cssVar(el, '--__s9cmpx-gauge-track-color', '') || cssVar(el, '--__s9cmpx-color-brand-100', '#ebebeb');
    const data: IndicatorTrace[] = [
      {
        type: 'indicator',
        mode: 'gauge+number',
        value,
        number: { suffix, font: { ...font, size: 30 } },
        gauge: {
          axis: { range: [min, max], tickfont: { ...font, size: 11 } },
          bar: { color: fill, thickness: 0.75 },
          bgcolor: track,
          borderwidth: 0,
        },
      },
    ];
    const layout = {
      height,
      margin: { l: 24, r: 24, t: 8, b: 8 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      font,
    };
    Plotly.react(el, data as unknown as Data[], layout, { displayModeBar: false, responsive: true });
    return () => {
      Plotly.purge(el);
    };
  }, [value, min, max, suffix, color, height]);

  return <div ref={ref} className={cx('__s9cmpx-chart', '__s9cmpx-chart-plotly', className)} style={{ width: '100%' }} />;
}
