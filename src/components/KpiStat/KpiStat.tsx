import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface KpiStatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric label, e.g. "Average Humidity" */
  label: React.ReactNode;
  /** Big value, e.g. "56.3%" */
  value: React.ReactNode;
  /** Change indicator, e.g. "+76.5%" */
  delta?: React.ReactNode;
  /**
   * Colors the delta. `"up"`/`"down"` color by numeric sign (green/red) and render a
   * matching chevron — the right choice when a larger number is inherently the good
   * outcome (revenue, attendance). `"good"`/`"bad"` color by outcome directly, with no
   * chevron, for metrics where sign and desirability point in opposite directions (e.g.
   * an emissions increase is "up" numerically but a bad outcome) — callers shouldn't have
   * to invert up/down themselves to get the right color. `"neutral"` is gray, no chevron.
   */
  deltaDirection?: 'up' | 'down' | 'neutral' | 'good' | 'bad';
  /**
   * Overrides the delta's color (and, via `currentColor` on the glyph, its icon too),
   * short-circuiting `deltaDirection`'s internal red/green/gray lookup entirely. For a
   * consumer whose sign encoding isn't the conventional red/green pair -- e.g. a diverging
   * brown/teal scale reused from a chart elsewhere on the same page, so a KPI card's delta
   * reads as "the same color family as the chart" rather than introducing a second,
   * unrelated sentiment encoding. `deltaDirection` still selects which glyph renders
   * (chevron for up/down, check/warning for good/bad, none for neutral); only the color
   * changes. Callers reaching for this should keep a redundant non-color cue in mind (the
   * glyph, or a sign in `delta` itself) especially for a pair with low mutual contrast --
   * brown/teal sit at roughly 1.2:1, far below the ~3:1 red/green usually manages.
   */
  deltaColor?: string;
  /** Render inside a bordered card (BoldBI KPI tile look) */
  card?: boolean;
}

/** KPI stat tile (st.metric / BI dashboard KPI card): label, big value, optional delta. */
export function KpiStat({
  label,
  value,
  delta,
  deltaDirection = 'neutral',
  deltaColor: deltaColorOverride,
  card = true,
  className,
  ...rest
}: KpiStatProps) {
  const deltaColor =
    deltaColorOverride ??
    (deltaDirection === 'up' || deltaDirection === 'good'
      ? 'var(--__s9cmpx-static-text-sentiment-positive, #187254)'
      : deltaDirection === 'down' || deltaDirection === 'bad'
        ? 'var(--__s9cmpx-static-text-sentiment-negative, #8d1a2a)'
        : 'var(--__s9cmpx-static-text-weak, #757575)');
  // 'up'/'down' get a directional chevron; 'good'/'bad' get a non-directional check/warning
  // glyph instead -- deliberately not a chevron, since good/bad doesn't inherently imply a
  // numeric direction the way up/down does. Without this, the delta's desirability reading
  // was color-only (borderline WCAG 1.4.1) -- partially mitigated already by the +/- sign
  // callers typically include in `delta` itself, but a glyph makes it unambiguous even
  // without color vision.
  const deltaIcon =
    deltaDirection === 'up' ? 'chevron-up'
    : deltaDirection === 'down' ? 'chevron-down'
    : deltaDirection === 'good' ? 'check'
    : deltaDirection === 'bad' ? 'warning'
    : undefined;
  return (
    <div
      className={cx('__s9cmpx-kpi-stat', card && '__s9cmpx-card __s9cmpx-card--with-border', className)}
      style={{ padding: card ? 16 : 0, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 160 }}
      {...rest}
    >
      <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{label}</span>
      <span className="__s9cmpx-headline4" style={{ lineHeight: 1.1 }}>{value}</span>
      {delta && (
        <span className="__s9cmpx-label2" style={{ color: deltaColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {deltaIcon && <Icon name={deltaIcon} size={14} />}
          {delta}
        </span>
      )}
    </div>
  );
}
