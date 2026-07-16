import React from 'react';
import { cx } from '../../lib/cx';

export type ProgressVariant = 'primary' | 'secondary' | 'tertiary' | 'success';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value: number;
  variant?: ProgressVariant;
  large?: boolean;
  /** Square ends instead of rounded */
  square?: boolean;
  hideAnimation?: boolean;
  label?: React.ReactNode;
}

export function Progress({
  value,
  variant = 'primary',
  large = false,
  square = false,
  hideAnimation = false,
  label,
  className,
  ...rest
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={className} {...rest}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="sy-label3">{label}</span>
          <span className="sy-label3" style={{ color: 'var(--sy-static-text-weak)' }}>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cx(
          'sy-progress',
          variant !== 'primary' && `sy-progress--${variant}`,
          large && 'sy-progress--large',
          square && 'sy-progress--square',
          hideAnimation && 'sy-progress--hide-animation',
        )}
        style={{ background: 'var(--sy-color-brand-100, #ebebeb)', borderRadius: square ? 0 : 4, height: large ? 8 : 4, overflow: 'hidden' }}
      >
        <div
          className="sy-progress__bar"
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: variant === 'success' ? 'var(--sy-static-background-sentiment-positive, #187254)' : 'var(--sy-interactive-fill-primary-default, #1f1f1f)',
            transition: hideAnimation ? undefined : 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
