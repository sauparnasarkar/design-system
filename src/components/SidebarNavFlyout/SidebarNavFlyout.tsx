import React from 'react';
import { cx } from '../../lib/cx';

export interface FlyoutItem {
  id: string;
  label: React.ReactNode;
  href?: string;
}

export interface FlyoutColumn {
  title?: React.ReactNode;
  items: FlyoutItem[];
}

export interface SidebarNavFlyoutProps {
  /** Flyout heading (usually the sidebar item label) */
  title: React.ReactNode;
  columns: FlyoutColumn[];
  onItemClick?: (id: string) => void;
  className?: string;
}

/**
 * Sidebar flyout submenu panel (`__s9cmpx-sidebar-nav-flyout`), as opened by the
 * Geographies / Services & Industries sidebar items. Rendered as a plain
 * panel; position it next to the sidebar item (the products use tippy).
 */
export function SidebarNavFlyout({ title, columns, onItemClick, className }: SidebarNavFlyoutProps) {
  return (
    <div
      className={cx('__s9cmpx-sidebar-nav-flyout', className)}
      style={{ background: 'var(--__s9cmpx-static-layer-standard, #fff)', border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: 260, maxWidth: 560 }}
    >
      <div className="__s9cmpx-sidebar-nav-flyout__content" style={{ padding: 8 }}>
        <div className="__s9cmpx-sidebar-nav-flyout__content__title __s9cmpx-label3" style={{ padding: '8px 12px', color: 'var(--__s9cmpx-static-text-weak)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {columns.map((col, ci) => (
            <div key={ci} className="__s9cmpx-sidebar-nav-flyout__content__subitems-column" style={{ flex: 1, minWidth: 180 }}>
              {col.title && (
                <div className="__s9cmpx-label3" style={{ padding: '6px 12px', fontWeight: 600 }}>{col.title}</div>
              )}
              <ul className="__s9cmpx-sidebar-nav-flyout__content__list" role="menu" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {col.items.map((item) => (
                  <li key={item.id} className="__s9cmpx-sidebar-nav-flyout__content__item" role="none">
                    <a
                      role="menuitem"
                      href={item.href ?? '#'}
                      className="__s9cmpx-sidebar-nav-flyout__content__button __s9cmpx-body3-short"
                      onClick={(e) => {
                        if (!item.href) e.preventDefault();
                        onItemClick?.(item.id);
                      }}
                      style={{ display: 'block', padding: '8px 12px', borderRadius: 3, color: 'inherit', textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--__s9cmpx-interactive-overlay-primary-hover, rgba(31,31,31,0.08))')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
