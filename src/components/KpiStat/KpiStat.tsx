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
  /** Colors the delta; "up" green, "down" red, "neutral" gray */
  deltaDirection?: 'up' | 'down' | 'neutral';
  /** Render inside a bordered card (BoldBI KPI tile look) */
  card?: boolean;
}

/** KPI stat tile (st.metric / BI dashboard KPI card): label, big value, optional delta. */
export function KpiStat({
  label,
  value,
  delta,
  deltaDirection = 'neutral',
  card = true,
  className,
  ...rest
}: KpiStatProps) {
  const deltaColor =
    deltaDirection === 'up'
      ? 'var(--__s9cmpx-static-text-sentiment-positive, #187254)'
      : deltaDirection === 'down'
        ? 'var(--__s9cmpx-static-text-sentiment-negative, #8d1a2a)'
        : 'var(--__s9cmpx-static-text-weak, #757575)';
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
          {deltaDirection !== 'neutral' && (
            <Icon name={deltaDirection === 'up' ? 'chevron-up' : 'chevron-down'} size={14} />
          )}
          {delta}
        </span>
      )}
    </div>
  );
}
