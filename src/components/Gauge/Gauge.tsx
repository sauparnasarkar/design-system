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
    const fill = color ?? cssVar(el, '--__s9cmpx-chart-categorical-default-01', '#7accf5');
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
    const data: IndicatorTrace[] = [
      {
        type: 'indicator',
        mode: 'gauge+number',
        value,
        number: { suffix, font: { ...font, size: 30 } },
        gauge: {
          axis: { range: [min, max], tickfont: { ...font, size: 11 } },
          bar: { color: fill, thickness: 0.75 },
          bgcolor: cssVar(el, '--__s9cmpx-color-brand-100', '#ebebeb'),
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
