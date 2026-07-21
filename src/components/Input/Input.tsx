import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type InputSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  label?: React.ReactNode;
}

export function Input({ size = 'm', error = false, iconLeft, iconRight, label, className, id, ...rest }: InputProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="__s9cmpx-label3" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <div
        className={cx(
          '__s9cmpx-input',
          `__s9cmpx-input--${size}`,
          iconLeft && '__s9cmpx-input--with-left-element',
          iconRight && '__s9cmpx-input--with-right-element',
        )}
      >
        {iconLeft && (
          <span className="__s9cmpx-input__left-element">
            <Icon name={iconLeft} size={16} />
          </span>
        )}
        <input
          id={inputId}
          className={cx('__s9cmpx-input__input', error && '__s9cmpx-input__input--error')}
          {...rest}
        />
        {iconRight && (
          <span className="__s9cmpx-input__right-element">
            <Icon name={iconRight} size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
