import React from 'react';
import { cx } from '../../lib/cx';

export type CardPadding = 'medium' | 'large' | 'mixed' | 'inner-card';
export type CardHeaderSize = 'extra-small' | 'small' | 'default' | 'large';

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  /** Muted text under the title */
  supportText?: React.ReactNode;
  /** Right-aligned actions (buttons, links) */
  actions?: React.ReactNode;
  size?: CardHeaderSize;
  hasTabs?: boolean;
}

export function CardHeader({
  title,
  supportText,
  actions,
  size = 'default',
  hasTabs = false,
  className,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cx(
        'sy-card-header',
        size !== 'default' && `sy-card-header--size-${size}`,
        hasTabs && 'sy-card-header--has-tabs',
        className,
      )}
      {...rest}
    >
      <div className="sy-card-header__wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div className="sy-card-header__left-side">
          <div className="sy-card-header__title-wrapper">
            <h5 className="sy-card-header__title sy-headline6">{title}</h5>
            {supportText && (
              <span className="sy-card-header__support-text sy-body4" style={{ color: 'var(--sy-static-text-weak)' }}>
                {supportText}
              </span>
            )}
          </div>
        </div>
        {actions && <div className="sy-card-header__right-side sy-card-header__right-side--with-gap" style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
  withShadow?: boolean;
  fullHeight?: boolean;
  /** Content padding preset */
  padding?: CardPadding;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function Card({
  withBorder = true,
  withShadow = false,
  fullHeight = false,
  padding = 'medium',
  header,
  footer,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cx(
        'sy-card',
        withBorder && 'sy-card--with-border',
        withShadow && 'sy-card--with-shadow',
        fullHeight && 'sy-card--full-height',
        Boolean(footer) && 'sy-card--has-footer',
        className,
      )}
      {...rest}
    >
      {header}
      <div className={`sy-card__content--${padding}`}>{children}</div>
      {footer && <div className="sy-card-footer sy-card-footer--size-medium">{footer}</div>}
    </div>
  );
}
