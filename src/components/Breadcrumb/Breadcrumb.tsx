import React from 'react';
import { cx } from '../../lib/cx';

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx('__s9cmpx-breadcrumb', className)} {...rest}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: 4, listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="__s9cmpx-breadcrumb__item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {item.href && !last ? (
                <a href={item.href} className="__s9cmpx-breadcrumb__link __s9cmpx-label2">
                  {item.label}
                </a>
              ) : (
                <span
                  className={cx('__s9cmpx-breadcrumb__link', last && '__s9cmpx-breadcrumb__link--active', '__s9cmpx-label2')}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
