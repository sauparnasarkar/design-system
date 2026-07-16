import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  /** Renders a chevron to indicate a flyout submenu */
  hasFlyout?: boolean;
  active?: boolean;
}

export interface SidebarNavProps {
  items: SidebarNavItem[];
  /** Items pinned to the bottom, after a divider (e.g. Customer Support) */
  footerItems?: SidebarNavItem[];
  /** Expanded (labels visible) vs collapsed (icons only) */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  onItemClick?: (id: string) => void;
  className?: string;
}

export function SidebarNav({
  items,
  footerItems = [],
  open: openProp,
  onToggle,
  onItemClick,
  className,
}: SidebarNavProps) {
  const [internalOpen, setInternalOpen] = React.useState(true);
  const open = openProp ?? internalOpen;

  const renderItem = (item: SidebarNavItem) => (
    <li key={item.id} className="sy-sidebar-nav__sidebar-item" role="none">
      <a
        role="menuitem"
        href={item.href ?? '#'}
        className={cx('sy-sidebar-nav__sidebar-item-button', item.active && 'sy-sidebar-nav__sidebar-item-button--active', item.hasFlyout && 'sy-sidebar-nav__sidebar-item-button--flyout')}
        onClick={(e) => {
          if (!item.href) e.preventDefault();
          onItemClick?.(item.id);
        }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', textDecoration: 'none', color: 'inherit' }}
        title={open ? undefined : item.label}
      >
        <span className="sy-sidebar-nav__sidebar-item-icon" style={{ display: 'inline-flex', flexShrink: 0 }}>
          <Icon name={item.icon} size={20} />
        </span>
        {open && <span className="sy-sidebar-nav__sidebar-item-text sy-label2" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
        {open && item.hasFlyout && <Icon name="chevron-right" size={14} style={{ color: 'var(--sy-static-text-weak)' }} />}
      </a>
    </li>
  );

  return (
    <nav
      aria-label="Sidebar Navigation"
      className={cx('sy-sidebar-nav', className)}
      style={{ height: '100%', minHeight: 480, width: open ? 240 : 56, flexShrink: 0, transition: 'width 0.15s cubic-bezier(0.77, 0, 0.175, 1)' }}
    >
      <div
        className={cx('sy-sidebar-nav__sidebar', open && 'sy-sidebar-nav__sidebar--open', !open && 'sy-sidebar-nav__sidebar--collapsed-mode')}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', width: open ? 240 : 56 }}
      >
        <button
          type="button"
          aria-label="Toggle Menu"
          onClick={() => {
            setInternalOpen(!open);
            onToggle?.(!open);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
        >
          <Icon name="menu" size={20} />
        </button>
        <ul className="sy-sidebar-nav__menu-list" role="menu" style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1 }}>
          {items.map(renderItem)}
        </ul>
        {footerItems.length > 0 && (
          <>
            <hr className="sy-sidebar-nav__sidebar-item--divider" style={{ border: 0, borderTop: '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))', margin: '4px 12px' }} />
            <ul role="menu" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {footerItems.map(renderItem)}
            </ul>
          </>
        )}
      </div>
    </nav>
  );
}
