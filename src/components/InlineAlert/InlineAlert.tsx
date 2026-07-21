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
        '__s9cmpx-inline-alert',
        `__s9cmpx-inline-alert--${variant}`,
        withBorder && `__s9cmpx-inline-alert--${variant}-border`,
        fullWidth && '__s9cmpx-inline-alert--full-width',
        className,
      )}
      {...rest}
    >
      <span className="__s9cmpx-inline-alert__icon-wrapper">
        <Icon name={VARIANT_ICON[variant]} size={16} />
      </span>
      <span className="__s9cmpx-inline-alert__content __s9cmpx-body3-short">
        {children}
        {link && (
          <>
            {' '}
            <a className="__s9cmpx-inline-alert__link __s9cmpx-link __s9cmpx-link--blue __s9cmpx-link2" href={link.href}>
              {link.label}
            </a>
          </>
        )}
      </span>
    </div>
  );
}
