import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type BannerAlertVariant = 'info' | 'neutral' | 'success' | 'warning' | 'error';

const VARIANT_ICON: Record<BannerAlertVariant, IconName> = {
  info: 'info',
  neutral: 'info',
  success: 'check',
  warning: 'warning',
  error: 'error',
};

export interface BannerAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BannerAlertVariant;
  withBorder?: boolean;
  /** Show a close button; called when pressed */
  onClose?: () => void;
  children?: React.ReactNode;
}

export function BannerAlert({
  variant = 'info',
  withBorder = false,
  onClose,
  className,
  children,
  ...rest
}: BannerAlertProps) {
  return (
    <div
      role="alert"
      className={cx(
        'sy-banner-alert',
        `sy-banner-alert--${variant}`,
        withBorder && `sy-banner-alert--${variant}-border`,
        onClose && 'sy-banner-alert--removable',
        className,
      )}
      {...rest}
    >
      <Icon name={VARIANT_ICON[variant]} size={16} />
      <span className="sy-body3-short">{children}</span>
      {onClose && (
        <button
          type="button"
          className="sy-banner-alert__close-button"
          aria-label="Close"
          onClick={onClose}
          style={{ display: 'inline-flex', marginLeft: 8 }}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
