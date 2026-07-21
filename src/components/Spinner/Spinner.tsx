import React from 'react';
import { cx } from '../../lib/cx';

export type SpinnerSize = 'xs' | 'sm' | 'default';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  /** Light ring for dark surfaces */
  inverse?: boolean;
  /** Text next to the spinner */
  label?: React.ReactNode;
}

export function Spinner({ size = 'default', inverse = false, label, className, ...rest }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx('__s9cmpx-spinner', size !== 'default' && `__s9cmpx-spinner--${size}`, inverse && '__s9cmpx-spinner--inverse', className)}
      {...rest}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <span className="__s9cmpx-spinner__track" />
        <span className="__s9cmpx-spinner__loader" />
      </span>
      {label ? (
        <span className="__s9cmpx-spinner__content __s9cmpx-label3">{label}</span>
      ) : (
        // role="status" with no text content announces nothing — most call
        // sites render a bare <Spinner /> with no visible label, so without
        // this every loading state is silent to screen reader users.
        <span
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Loading…
        </span>
      )}
    </div>
  );
}
