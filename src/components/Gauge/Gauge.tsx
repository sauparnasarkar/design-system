import React from 'react';
import Plotly from 'plotly.js-dist-min';
import { cx } from '../../lib/cx';

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
    const fill = color ?? cssVar(el, '--sy-chart-categorical-default-01', '#7accf5');
    const font = {
      family: cssVar(el, '--sy-font-families-primary', '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
      color: cssVar(el, '--sy-static-text-standard', '#494949'),
    };
    const data = [
      {
        type: 'indicator',
        mode: 'gauge+number',
        value,
        number: { suffix, font: { ...font, size: 30 } },
        gauge: {
          axis: { range: [min, max], tickfont: { ...font, size: 11 } },
          bar: { color: fill, thickness: 0.75 },
          bgcolor: cssVar(el, '--sy-color-brand-100', '#ebebeb'),
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
    Plotly.react(el, data, layout, { displayModeBar: false, responsive: true });
    return () => {
      Plotly.purge(el);
    };
  }, [value, min, max, suffix, color, height]);

  return <div ref={ref} className={cx('sy-chart', 'sy-chart-plotly', className)} style={{ width: '100%' }} />;
}
