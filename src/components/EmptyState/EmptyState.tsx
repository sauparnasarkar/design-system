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
      className={cx('sy-empty-state', `sy-empty-state--${size}`, bordered && 'sy-empty-state--bordered', background && 'sy-empty-state--background', className)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: size === 'large' ? 48 : 32, textAlign: 'center', borderRadius: 3 }}
      {...rest}
    >
      <span className="sy-empty-state__icon" style={{ color: 'var(--sy-static-text-weak)' }}>
        <Icon name={icon} size={size === 'large' ? 40 : 32} />
      </span>
      <span className={cx('sy-empty-state__title', size === 'large' ? 'sy-headline6' : 'sy-headline7')}>{title}</span>
      {message && (
        <span className="sy-empty-state__message sy-body3-short" style={{ color: 'var(--sy-static-text-weak)', maxWidth: 420 }}>
          {message}
        </span>
      )}
      {actions && <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}
