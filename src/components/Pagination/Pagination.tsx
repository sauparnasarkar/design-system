import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface PaginationProps {
  /** 1-based current page */
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
  /** How many numbered buttons to show around the current page */
  siblingCount?: number;
  /** Compact variant: only prev/next and "Page X of Y" */
  compact?: boolean;
  className?: string;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/**
 * Pager composed from fg button styles. The products page their data grids
 * through AG Grid, so the vendor library has no __s9cmpx-pagination block; this
 * follows the same visual language (secondary buttons, label typography).
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  siblingCount = 1,
  compact = false,
  className,
}: PaginationProps) {
  const go = (p: number) => {
    const next = Math.max(1, Math.min(pageCount, p));
    if (next !== page) onChange?.(next);
  };

  const navButton = (dir: 'prev' | 'next') => (
    <button
      type="button"
      className="__s9cmpx-button __s9cmpx-button--secondary __s9cmpx-button--s __s9cmpx-button--icon-only"
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      disabled={dir === 'prev' ? page <= 1 : page >= pageCount}
      onClick={() => go(dir === 'prev' ? page - 1 : page + 1)}
    >
      <Icon name={dir === 'prev' ? 'chevron-left' : 'chevron-right'} size={14} />
    </button>
  );

  if (compact) {
    return (
      <nav aria-label="Pagination" className={className} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {navButton('prev')}
        <span className="__s9cmpx-label2">Page {page} of {pageCount}</span>
        {navButton('next')}
      </nav>
    );
  }

  const first = 1;
  const last = pageCount;
  const start = Math.max(first + 1, page - siblingCount);
  const end = Math.min(last - 1, page + siblingCount);
  const pages: Array<number | 'gap'> = [first];
  if (start > first + 1) pages.push('gap');
  pages.push(...range(start, end));
  if (end < last - 1) pages.push('gap');
  if (last > first) pages.push(last);

  return (
    <nav aria-label="Pagination" className={className} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {navButton('prev')}
      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="__s9cmpx-label2" style={{ padding: '0 4px', color: 'var(--__s9cmpx-static-text-weak)' }}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={cx('__s9cmpx-button', '__s9cmpx-button--s', p === page ? '__s9cmpx-button--primary' : '__s9cmpx-button--ghost')}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ),
      )}
      {navButton('next')}
    </nav>
  );
}
