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
        'sy-radio',
        error && 'sy-radio--error',
        large && 'sy-radio--large',
        className,
      )}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', cursor: disabled ? 'default' : 'pointer' }}
    >
      <span className="sy-radio__container" style={{ display: 'inline-flex' }}>
        <input id={inputId} type="radio" className="sy-radio__input" disabled={disabled} {...rest} />
        <span className="sy-radio__checkmark" />
      </span>
      {label && (
        <span className={cx('sy-radio__label', 'sy-body3-short', disabled && 'sy-radio__label--disabled')}>
          {label}
        </span>
      )}
    </label>
  );
}
