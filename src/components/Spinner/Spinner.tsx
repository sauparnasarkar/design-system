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
      className={cx('sy-spinner', size !== 'default' && `sy-spinner--${size}`, inverse && 'sy-spinner--inverse', className)}
      {...rest}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <span className="sy-spinner__track" />
        <span className="sy-spinner__loader" />
      </span>
      {label && <span className="sy-spinner__content sy-label3">{label}</span>}
    </div>
  );
}
