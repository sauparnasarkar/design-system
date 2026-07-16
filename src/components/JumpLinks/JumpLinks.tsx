import React from 'react';
import { cx } from '../../lib/cx';

export interface JumpLinkItem {
  id: string;
  label: React.ReactNode;
  href: string;
}

export interface JumpLinksProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: JumpLinkItem[];
  /** Controlled active item id */
  activeId?: string;
  onSelect?: (id: string) => void;
  vertical?: boolean;
}

/** In-page anchor navigation (`sy-jump-links`), e.g. section links on entity pages. */
export function JumpLinks({ items, activeId, onSelect, vertical = false, className, ...rest }: JumpLinksProps) {
  const [internal, setInternal] = React.useState(items[0]?.id);
  const active = activeId ?? internal;
  return (
    <nav
      aria-label="Jump links"
      className={cx('sy-jump-links', vertical && 'sy-jump-links--vertical', className)}
      {...rest}
    >
      <ul style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 4 : 16, listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} className={cx('sy-jump-links__item', active === item.id && 'sy-jump-links__item--active')}>
            <a
              href={item.href}
              className={cx('sy-jump-links__anchor', 'sy-label2')}
              aria-current={active === item.id ? 'location' : undefined}
              onClick={() => {
                setInternal(item.id);
                onSelect?.(item.id);
              }}
              style={{
                display: 'inline-block',
                padding: vertical ? '6px 12px' : '8px 0',
                textDecoration: 'none',
                color: active === item.id ? 'var(--sy-static-text-strong)' : 'var(--sy-static-text-weak)',
                borderBottom: !vertical ? `2px solid ${active === item.id ? 'var(--sy-interactive-fill-primary-default, #1f1f1f)' : 'transparent'}` : undefined,
                borderLeft: vertical ? `2px solid ${active === item.id ? 'var(--sy-interactive-fill-primary-default, #1f1f1f)' : 'transparent'}` : undefined,
                fontWeight: active === item.id ? 600 : undefined,
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
