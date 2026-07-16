import React from 'react';
import { cx } from '../../lib/cx';

export interface ChartTooltipRow {
  /** Series swatch color (any CSS color, e.g. a --sy-chart-categorical token) */
  color?: string;
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface ChartTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Header line, usually the x-axis category (date, region…) */
  title?: React.ReactNode;
  rows: ChartTooltipRow[];
  variant?: 'dark' | 'light';
}

/** Chart hover tooltip (`sy-chart-tooltip`): series swatches with label/value rows. */
export function ChartTooltip({ title, rows, variant = 'dark', className, ...rest }: ChartTooltipProps) {
  const dark = variant === 'dark';
  return (
    <div
      className={cx('sy-chart-tooltip', `sy-chart-tooltip--${variant}`, className)}
      style={{
        background: dark ? 'var(--sy-static-background-inverse-weak, #1f1f1f)' : 'var(--sy-static-layer-standard, #fff)',
        color: dark ? 'var(--sy-static-text-inverse-strong, #fff)' : 'var(--sy-static-text-standard)',
        border: dark ? 'none' : '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        padding: '8px 10px',
        width: 'fit-content',
        minWidth: 160,
      }}
      {...rest}
    >
      {title && (
        <>
          <div className="sy-chart-tooltip-content__label sy-label3" style={{ fontWeight: 600 }}>{title}</div>
          <hr className="sy-chart-tooltip-content__divider" style={{ border: 0, borderTop: `1px solid ${dark ? 'var(--sy-static-divider-inverse-weak, rgba(255,255,255,0.2))' : 'var(--sy-static-divider-weak, rgba(31,31,31,0.12))'}`, margin: '6px 0' }} />
        </>
      )}
      <div className="sy-chart-tooltip-content" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {r.color && (
              <span
                className="sy-chart-tooltip__color-indicator"
                style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }}
              />
            )}
            <span className="sy-chart-tooltip-content__label sy-label3" style={{ opacity: dark ? 0.8 : 1 }}>{r.label}</span>
            <span className="sy-chart-tooltip-content__value sy-label3" style={{ marginLeft: 'auto', fontWeight: 600 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
