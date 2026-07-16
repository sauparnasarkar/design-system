import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghost-blue' | 'special' | 'warning';
export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width */
  fullWidth?: boolean;
  /** Pill-shaped */
  fullRadius?: boolean;
  /** Replaces the label with a spinner and keeps the width stable */
  isLoading?: boolean;
  /** Icon rendered before the label */
  iconLeft?: IconName;
  /** Icon rendered after the label */
  iconRight?: IconName;
  /** Square button with only an icon (pass it via iconLeft) */
  iconOnly?: boolean;
  children?: React.ReactNode;
}

const ICON_SIZE: Record<ButtonSize, number> = { xs: 12, s: 14, m: 16, l: 18, xl: 20 };

export function Button({
  variant = 'primary',
  size = 'm',
  fullWidth = false,
  fullRadius = false,
  isLoading = false,
  iconLeft,
  iconRight,
  iconOnly = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'sy-button',
        `sy-button--${variant}`,
        `sy-button--${size}`,
        fullWidth && 'sy-button--full-width',
        fullRadius && 'sy-button--full-radius',
        iconOnly && 'sy-button--icon-only',
        isLoading && 'sy-button--is-loading',
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <Icon name="chevron-down" size={ICON_SIZE[size]} className="sy-button__loading-icon" />
      ) : (
        <>
          {iconLeft && <Icon name={iconLeft} size={ICON_SIZE[size]} />}
          {!iconOnly && children}
          {iconRight && !iconOnly && <Icon name={iconRight} size={ICON_SIZE[size]} />}
        </>
      )}
    </button>
  );
}
