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
  /** Node rendered in place of the default spinning chevron while `isLoading` is true --
   *  e.g. a shared `<Spinner />` for icon-only buttons. Falls back to the default icon when
   *  omitted. `Spinner` animates itself (its own `__s9cmpx-spinner__loader` keyframe), so it
   *  needs no extra class here; a static `<Icon>` passed instead would need its own animation
   *  (e.g. the `__s9cmpx-button__loading-icon` class used by the default) to spin. */
  loadingIcon?: React.ReactNode;
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
  loadingIcon,
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
        '__s9cmpx-button',
        `__s9cmpx-button--${variant}`,
        `__s9cmpx-button--${size}`,
        fullWidth && '__s9cmpx-button--full-width',
        fullRadius && '__s9cmpx-button--full-radius',
        iconOnly && '__s9cmpx-button--icon-only',
        isLoading && '__s9cmpx-button--is-loading',
        className,
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        (loadingIcon ?? <Icon name="chevron-down" size={ICON_SIZE[size]} className="__s9cmpx-button__loading-icon" />)
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
