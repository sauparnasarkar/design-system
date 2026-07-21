import React from 'react';
import { cx } from '../../lib/cx';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  error?: boolean;
  large?: boolean;
}

export function Radio({ label, error = false, large = false, disabled, className, id, ...rest }: RadioProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={cx(
        '__s9cmpx-radio',
        error && '__s9cmpx-radio--error',
        large && '__s9cmpx-radio--large',
        className,
      )}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', cursor: disabled ? 'default' : 'pointer' }}
    >
      <span className="__s9cmpx-radio__container" style={{ display: 'inline-flex' }}>
        <input id={inputId} type="radio" className="__s9cmpx-radio__input" disabled={disabled} {...rest} />
        <span className="__s9cmpx-radio__checkmark" />
      </span>
      {label && (
        <span className={cx('__s9cmpx-radio__label', '__s9cmpx-body3-short', disabled && '__s9cmpx-radio__label--disabled')}>
          {label}
        </span>
      )}
    </label>
  );
}
