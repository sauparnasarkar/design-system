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
  /** Heading level for the title element, to keep page-level heading order valid in context; defaults to h5 (this component's traditional level when used standalone) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function CardHeader({
  title,
  supportText,
  actions,
  size = 'default',
  hasTabs = false,
  headingLevel = 5,
  className,
  ...rest
}: CardHeaderProps) {
  const HeadingTag = `h${headingLevel}` as const;
  return (
    <div
      className={cx(
        '__s9cmpx-card-header',
        size !== 'default' && `__s9cmpx-card-header--size-${size}`,
        hasTabs && '__s9cmpx-card-header--has-tabs',
        className,
      )}
      {...rest}
    >
      <div className="__s9cmpx-card-header__wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div className="__s9cmpx-card-header__left-side">
          <div className="__s9cmpx-card-header__title-wrapper">
            <HeadingTag className="__s9cmpx-card-header__title __s9cmpx-headline6">{title}</HeadingTag>
            {supportText && (
              <span className="__s9cmpx-card-header__support-text __s9cmpx-body4" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>
                {supportText}
              </span>
            )}
          </div>
        </div>
        {actions && <div className="__s9cmpx-card-header__right-side __s9cmpx-card-header__right-side--with-gap" style={{ display: 'flex', gap: 8 }}>{actions}</div>}
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
        '__s9cmpx-card',
        withBorder && '__s9cmpx-card--with-border',
        withShadow && '__s9cmpx-card--with-shadow',
        fullHeight && '__s9cmpx-card--full-height',
        Boolean(footer) && '__s9cmpx-card--has-footer',
        className,
      )}
      {...rest}
    >
      {header}
      <div className={`__s9cmpx-card__content--${padding}`}>{children}</div>
      {footer && <div className="__s9cmpx-card-footer __s9cmpx-card-footer--size-medium">{footer}</div>}
    </div>
  );
}
