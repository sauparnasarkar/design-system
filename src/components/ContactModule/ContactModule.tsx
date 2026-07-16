import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface ContactModuleProps {
  /** ContactItem elements */
  children: React.ReactNode;
  /** Heading above the contacts row */
  title?: React.ReactNode;
  /** How many contacts are visible per page */
  perPage?: number;
  /** Footer action (e.g. "Message the team") */
  action?: React.ReactNode;
  className?: string;
}

/** Analyst contacts carousel (`sy-contact-module`): pages through ContactItems with arrow controls. */
export function ContactModule({ children, title, perPage = 3, action, className }: ContactModuleProps) {
  const items = React.Children.toArray(children);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = React.useState(0);
  const visible = items.slice(page * perPage, page * perPage + perPage);
  const showArrows = pageCount > 1;

  return (
    <div className={cx('sy-contact-module', className)}>
      {(title || showArrows) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          {title && <span className="sy-headline7">{title}</span>}
          {showArrows && (
            <span className={cx('sy-contact-module__arrows')} style={{ display: 'inline-flex', gap: 4 }}>
              <button
                type="button"
                className="sy-button sy-button--secondary sy-button--s sy-button--icon-only"
                aria-label="Previous contacts"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <Icon name="chevron-left" size={14} />
              </button>
              <button
                type="button"
                className="sy-button sy-button--secondary sy-button--s sy-button--icon-only"
                aria-label="Next contacts"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                <Icon name="chevron-right" size={14} />
              </button>
            </span>
          )}
        </div>
      )}
      <div className="sy-contact-module__first-active-slide" style={{ display: 'flex', gap: 24 }}>
        {visible}
      </div>
      {action && (
        <div className="sy-contact-module__message-wrapper" style={{ marginTop: 16 }}>
          {action}
        </div>
      )}
    </div>
  );
}
