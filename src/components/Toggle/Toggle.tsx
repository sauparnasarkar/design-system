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
      className={cx('__s9cmpx-toggle', `__s9cmpx-toggle--${size}`, disabled && '__s9cmpx-toggle--disabled', className)}
    >
      <span className="__s9cmpx-toggle__toggle">
        <input id={inputId} type="checkbox" role="switch" className="__s9cmpx-toggle__input" disabled={disabled} {...rest} />
        <span className="__s9cmpx-toggle__slider" />
      </span>
      {label && <span className="__s9cmpx-toggle__label __s9cmpx-body3-short">{label}</span>}
    </label>
  );
}
