import React from 'react';
import { cx } from '../../lib/cx';
import { cssVar, pickTileInk, resolveTileColors, squarify, syPalette } from './chartMath';

export interface SquarifiedTreemapProps {
  /** One label per tile. */
  labels: string[];
  /** Tile size per entry, parallel to `labels`. */
  values: number[];
  /** Discrete fill color per tile, parallel to `labels`. Falls back to the theme's categorical
   * palette, cycled, when omitted (same convention as the Plotly renderer's own `tileColors`). */
  tileColors?: string[];
  /** Label-ink color per tile, parallel to `labels`. Falls back to a WCAG-luminance-based
   * dark/light choice per tile when omitted (see `chartMath.ts::pickTileInk`). */
  tileLabelColors?: string[];
  /** Secondary line of text per tile, parallel to `labels` (e.g. "$5.25B · 14.8%"), shown below
   * the tile's name once the tile is large enough to fit it. */
  tileMeta?: string[];
  /** Unit label appended to a tile's hover title (e.g. 'MtCO₂'). */
  hoverUnit?: string;
  onTileClick?: (pointNumber: number, label: string) => void;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Squarified-layout treemap (see `chartMath.ts::squarify`), rendered as plain absolutely-
 * positioned `div` tiles inside a dark-framed panel rather than Plotly's native treemap trace --
 * opt into this via `SyChartSeries.treemapLayout: 'squarified'` (see that prop's own doc comment
 * for why it's a separate renderer, not a replacement). No continuous `colorValues`/colorbar
 * support -- discrete per-tile fills only; a caller needing a continuous scale should stay on
 * the default 'plotly' treemap layout.
 */
export function SquarifiedTreemap({
  labels,
  values,
  tileColors,
  tileLabelColors,
  tileMeta,
  hoverUnit,
  onTileClick,
  height = 420,
  className,
  ariaLabel,
}: SquarifiedTreemapProps) {
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [palette, setPalette] = React.useState<string[] | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Resolved once the outer wrapper is mounted (theme CSS vars need a real DOM node with the
  // right [data-theme] ancestor to read against) -- see SyChartPlotly's own identical pattern.
  // Not needed at all when the caller already supplies tileColors, but resolved unconditionally
  // (cheap, one-time) so switching a caller from explicit tileColors to the palette fallback
  // later doesn't need a second render to pick up a theme-resolved value.
  React.useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    setPalette(syPalette(el));
  }, []);

  const resolvedColors = resolveTileColors(labels, tileColors, palette ?? []);
  const items = labels
    .map((label, idx) => ({ idx, label, value: values[idx] ?? 0 }))
    .filter((it) => it.value > 0)
    .sort((a, b) => b.value - a.value);
  const rects = React.useMemo(() => squarify(items, width, height), [items, width, height]);

  // Guarded on outerRef.current rather than falling back to `document.documentElement` --
  // `document` doesn't exist under SSR, and cssVar's own `typeof window === 'undefined'` guard
  // only protects calls that already have a real `el` to (not) read from. The ref is null only
  // on the very first render, before React has committed it to the DOM; the resize/palette
  // effects below both trigger a second render once mounted, by which point it's set.
  const frame = outerRef.current ? cssVar(outerRef.current, '--__s9cmpx-chart-treemap-frame', '#16150F') : '#16150F';

  return (
    <div
      ref={outerRef}
      role="img"
      aria-label={ariaLabel ?? `Treemap of ${labels.length} categories`}
      className={cx('__s9cmpx-chart', '__s9cmpx-chart-squarified-treemap', className)}
      style={{ background: frame, borderRadius: 4, padding: 3, width: '100%' }}
    >
      <div ref={innerRef} style={{ position: 'relative', height, overflow: 'hidden' }}>
        {rects.map((r) => {
          const bg = resolvedColors[r.idx] ?? '#D6D3CC';
          const ink = tileLabelColors?.[r.idx] ?? pickTileInk(bg);
          const label = labels[r.idx];
          const meta = tileMeta?.[r.idx];
          const showName = r.w >= 56 && r.h >= 22;
          const showMeta = !!meta && r.w >= 84 && r.h >= 40;
          const unit = hoverUnit ? ` ${hoverUnit}` : '';
          const tip = meta ? `${label} — ${meta}` : `${label}${values[r.idx] != null ? ` — ${values[r.idx]}${unit}` : ''}`;
          return (
            <div
              key={r.idx}
              title={tip}
              onClick={onTileClick ? () => onTileClick(r.idx, label) : undefined}
              onMouseEnter={() => setHoverIdx(r.idx)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                position: 'absolute',
                boxSizing: 'border-box',
                left: r.x,
                top: r.y,
                width: r.w,
                height: r.h,
                border: `1px solid ${frame}`,
                background: bg,
                opacity: hoverIdx != null && hoverIdx !== r.idx ? 0.55 : 1,
                cursor: onTileClick ? 'pointer' : 'default',
                overflow: 'hidden',
                padding: '5px 7px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                color: ink,
              }}
            >
              {showName && (
                <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {label}
                </span>
              )}
              {showMeta && (
                <span
                  style={{
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    opacity: 0.85,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {meta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
