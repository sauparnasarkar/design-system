import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type InlineAlertVariant = 'default' | 'success' | 'warning' | 'error';

const VARIANT_ICON: Record<InlineAlertVariant, IconName> = {
  default: 'info',
  success: 'check',
  warning: 'warning',
  error: 'error',
};

export interface InlineAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: InlineAlertVariant;
  /** Add the tinted border treatment */
  withBorder?: boolean;
  fullWidth?: boolean;
  /** Optional link rendered after the message */
  link?: { label: React.ReactNode; href: string };
  children?: React.ReactNode;
}

export function InlineAlert({
  variant = 'default',
  withBorder = false,
  fullWidth = false,
  link,
  className,
  children,
  ...rest
}: InlineAlertProps) {
  return (
    <div
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      className={cx(
        'sy-inline-alert',
        `sy-inline-alert--${variant}`,
        withBorder && `sy-inline-alert--${variant}-border`,
        fullWidth && 'sy-inline-alert--full-width',
        className,
      )}
      {...rest}
    >
      <span className="sy-inline-alert__icon-wrapper">
        <Icon name={VARIANT_ICON[variant]} size={16} />
      </span>
      <span className="sy-inline-alert__content sy-body3-short">
        {children}
        {link && (
          <>
            {' '}
            <a className="sy-inline-alert__link sy-link sy-link--blue sy-link2" href={link.href}>
              {link.label}
            </a>
          </>
        )}
      </span>
    </div>
  );
}
