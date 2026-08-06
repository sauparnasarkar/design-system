// Pure color/tick math used by SyChart, split out from SyChart.tsx so it can be unit-tested
// (src/**/*.test.ts runs in a plain Node environment) without pulling in
// plotly.js-dist-min — that module has a module-scope reference to `self` that only exists
// in a browser, so importing anything from SyChart.tsx itself crashes under Node.

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
 * caller-supplied override (SyChartSeries.noDataHoverText). Kept a plain function (not inlined
 * at the trace-construction site) so it's unit-testable without pulling in plotly.js-dist-min. */
export function noDataHovertemplate(noDataHoverText?: string): string {
  return `%{location}<br>${noDataHoverText ?? 'No data reported'}<extra></extra>`;
}
