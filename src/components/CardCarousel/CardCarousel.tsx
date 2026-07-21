import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface CardCarouselProps {
  /** Section heading, e.g. "Related Tools & Data" */
  title?: React.ReactNode;
  /** Count badge next to the title, e.g. "63 results" */
  subtitle?: React.ReactNode;
  /** Cards per page */
  perPage?: number;
  children: React.ReactNode;
  className?: string;
}

/** Paged card row with chevron controls — the "Related Tools & Data" / "Upcoming Events" pattern. */
export function CardCarousel({ title, subtitle, perPage = 5, children, className }: CardCarouselProps) {
  const items = React.Children.toArray(children);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = React.useState(0);
  const visible = items.slice(page * perPage, page * perPage + perPage);

  return (
    <div className={cx('__s9cmpx-card-carousel', className)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        {title && <span className="__s9cmpx-headline6">{title}</span>}
        {subtitle && <span className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{subtitle}</span>}
        {pageCount > 1 && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
            <button
              type="button"
              className="__s9cmpx-button __s9cmpx-button--secondary __s9cmpx-button--s __s9cmpx-button--icon-only"
              aria-label="Previous"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <Icon name="chevron-left" size={14} />
            </button>
            <button
              type="button"
              className="__s9cmpx-button __s9cmpx-button--secondary __s9cmpx-button--s __s9cmpx-button--icon-only"
              aria-label="Next"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              <Icon name="chevron-right" size={14} />
            </button>
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${perPage}, 1fr)`, gap: 24, alignItems: 'start' }}>
        {visible}
      </div>
    </div>
  );
}
