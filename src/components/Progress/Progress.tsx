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
          <span className="__s9cmpx-label3">{label}</span>
          <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cx(
          '__s9cmpx-progress',
          variant !== 'primary' && `__s9cmpx-progress--${variant}`,
          large && '__s9cmpx-progress--large',
          square && '__s9cmpx-progress--square',
          hideAnimation && '__s9cmpx-progress--hide-animation',
        )}
        style={{ background: 'var(--__s9cmpx-color-brand-100, #ebebeb)', borderRadius: square ? 0 : 4, height: large ? 8 : 4, overflow: 'hidden' }}
      >
        <div
          className="__s9cmpx-progress__bar"
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: variant === 'success' ? 'var(--__s9cmpx-static-background-sentiment-positive, #187254)' : 'var(--__s9cmpx-interactive-fill-primary-default, #1f1f1f)',
            transition: hideAnimation ? undefined : 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
