import React from 'react';
import { cx } from '../../lib/cx';

export type ToggleSize = 'small' | 'medium' | 'large';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  size?: ToggleSize;
}

export function Toggle({ label, size = 'medium', disabled, className, id, ...rest }: ToggleProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cx('sy-toggle', `sy-toggle--${size}`, disabled && 'sy-toggle--disabled', className)}
    >
      <span className="sy-toggle__toggle">
        <input id={inputId} type="checkbox" role="switch" className="sy-toggle__input" disabled={disabled} {...rest} />
        <span className="sy-toggle__slider" />
      </span>
      {label && <span className="sy-toggle__label sy-body3-short">{label}</span>}
    </label>
  );
}
