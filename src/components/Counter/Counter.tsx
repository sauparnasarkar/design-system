import React from 'react';
import { cx } from '../../lib/cx';

export type CounterVariant = 'default' | 'active' | 'important' | 'new-items';

export interface CounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  variant?: CounterVariant;
  /** Cap display at this value, showing e.g. "99+" */
  max?: number;
}

/** Count badge (`sy-counter`) — result counts and notification pips. */
export function Counter({ value, variant = 'default', max, className, ...rest }: CounterProps) {
  const display = max !== undefined && value > max ? `${max}+` : String(value);
  return (
    <span
      className={cx('sy-counter', `sy-counter--${variant}`, 'sy-label3', className)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 10 }}
      {...rest}
    >
      {display}
    </span>
  );
}
