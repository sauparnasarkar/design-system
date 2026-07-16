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
        'sy-checkbox',
        error && 'sy-checkbox--error',
        disabled && 'sy-checkbox--disabled',
        className,
      )}
    >
      <span className="sy-checkbox__container" style={{ display: 'inline-flex' }}>
        <input id={inputId} type="checkbox" className="sy-checkbox__input" disabled={disabled} {...rest} />
      </span>
      {label && (
        <label htmlFor={inputId} className="sy-checkbox__label sy-body3-short">
          {label}
        </label>
      )}
    </div>
  );
}
