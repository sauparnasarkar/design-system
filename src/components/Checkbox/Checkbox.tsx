import React from 'react';
import { cx } from '../../lib/cx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  error?: boolean;
}

export function Checkbox({ label, error = false, disabled, className, id, ...rest }: CheckboxProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div
      className={cx(
        '__s9cmpx-checkbox',
        error && '__s9cmpx-checkbox--error',
        disabled && '__s9cmpx-checkbox--disabled',
        className,
      )}
    >
      <span className="__s9cmpx-checkbox__container" style={{ display: 'inline-flex' }}>
        <input id={inputId} type="checkbox" className="__s9cmpx-checkbox__input" disabled={disabled} {...rest} />
      </span>
      {label && (
        <label htmlFor={inputId} className="__s9cmpx-checkbox__label __s9cmpx-body3-short">
          {label}
        </label>
      )}
    </div>
  );
}
