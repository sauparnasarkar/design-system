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
        <label htmlFor={inputId} className="sy-label3" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <div
        className={cx(
          'sy-input',
          `sy-input--${size}`,
          iconLeft && 'sy-input--with-left-element',
          iconRight && 'sy-input--with-right-element',
        )}
      >
        {iconLeft && (
          <span className="sy-input__left-element">
            <Icon name={iconLeft} size={16} />
          </span>
        )}
        <input
          id={inputId}
          className={cx('sy-input__input', error && 'sy-input__input--error')}
          {...rest}
        />
        {iconRight && (
          <span className="sy-input__right-element">
            <Icon name={iconRight} size={16} />
          </span>
        )}
      </div>
    </div>
  );
}
