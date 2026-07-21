import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type EmptyStateSize = 'medium' | 'large';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  message?: React.ReactNode;
  icon?: IconName;
  size?: EmptyStateSize;
  bordered?: boolean;
  /** Tinted background */
  background?: boolean;
  /** Action button(s) under the message */
  actions?: React.ReactNode;
}

export function EmptyState({
  title,
  message,
  icon = 'search',
  size = 'medium',
  bordered = false,
  background = false,
  actions,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cx('__s9cmpx-empty-state', `__s9cmpx-empty-state--${size}`, bordered && '__s9cmpx-empty-state--bordered', background && '__s9cmpx-empty-state--background', className)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: size === 'large' ? 48 : 32, textAlign: 'center', borderRadius: 3 }}
      {...rest}
    >
      <span className="__s9cmpx-empty-state__icon" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>
        <Icon name={icon} size={size === 'large' ? 40 : 32} />
      </span>
      <span className={cx('__s9cmpx-empty-state__title', size === 'large' ? '__s9cmpx-headline6' : '__s9cmpx-headline7')}>{title}</span>
      {message && (
        <span className="__s9cmpx-empty-state__message __s9cmpx-body3-short" style={{ color: 'var(--__s9cmpx-static-text-weak)', maxWidth: 420 }}>
          {message}
        </span>
      )}
      {actions && <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
