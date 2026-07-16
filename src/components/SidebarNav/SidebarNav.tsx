import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

const MOBILE_QUERY = '(max-width: 768px)';

/** True below the tablet breakpoint, where the rail becomes an off-canvas drawer instead of narrowing in place. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches,
  );
  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

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
  /** Corner for the floating mobile menu button, since the host header's own
   * content may occupy one side (e.g. a logo on the left, or search/user menu
   * on the right). Defaults to 'left'. */
  mobileToggleSide?: 'left' | 'right';
}

export function SidebarNav({
  items,
  footerItems = [],
  open: openProp,
  onToggle,
  onItemClick,
  className,
  mobileToggleSide = 'left',
}: SidebarNavProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(() => !isMobile);
  const open = openProp ?? internalOpen;

  const setOpenState = (next: boolean) => {
    setInternalOpen(next);
    onToggle?.(next);
  };

  // Uncontrolled usage only: default to the rail expanded on desktop and the
  // drawer closed on mobile, re-applied whenever the viewport crosses the
  // breakpoint (not on every render — isMobile only changes at that crossing).
  React.useEffect(() => {
    if (openProp !== undefined) return;
    setInternalOpen(!isMobile);
  }, [isMobile, openProp]);

  const renderItem = (item: SidebarNavItem) => (
    <li key={item.id} className="sy-sidebar-nav__sidebar-item" role="none">
      <a
        role="menuitem"
        href={item.href ?? '#'}
        className={cx('sy-sidebar-nav__sidebar-item-button', item.active && 'sy-sidebar-nav__sidebar-item-button--active', item.hasFlyout && 'sy-sidebar-nav__sidebar-item-button--flyout')}
        onClick={(e) => {
          if (!item.href) e.preventDefault();
          onItemClick?.(item.id);
          if (isMobile) setOpenState(false);
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

  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slideTransition = reduceMotion ? 'none' : 'transform 0.2s cubic-bezier(0.77, 0, 0.175, 1)';
  const widthTransition = reduceMotion ? 'none' : 'width 0.15s cubic-bezier(0.77, 0, 0.175, 1)';

  return (
    <>
      {isMobile && !open && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpenState(true)}
          style={{
            position: 'fixed',
            top: 12,
            [mobileToggleSide]: 12,
            zIndex: 40,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 8,
            // The elevated "menus, popovers, toasts" surface tone, not the flat
            // card background — against a header that's often a similarly dark
            // static-background-weak, the plain card tone left this control
            // nearly imperceptible as a tappable element.
            background: 'var(--sy-static-layer-standard)',
            border: '1px solid var(--sy-static-divider-strong, rgba(31,31,31,0.24))',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            color: 'var(--sy-static-text-strong)',
            cursor: 'pointer',
          }}
        >
          <Icon name="menu" size={20} />
        </button>
      )}
      {isMobile && open && (
        <div
          aria-hidden="true"
          onClick={() => setOpenState(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 10, 0.5)', zIndex: 24 }}
        />
      )}
      <nav
        aria-label="Sidebar Navigation"
        className={cx('sy-sidebar-nav', className)}
        style={
          isMobile
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: 240,
                zIndex: 25,
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
                transition: slideTransition,
                boxShadow: open ? '4px 0 24px rgba(0, 0, 0, 0.25)' : 'none',
              }
            : { height: '100%', minHeight: 480, width: open ? 240 : 56, flexShrink: 0, transition: widthTransition }
        }
      >
        <div
          className={cx('sy-sidebar-nav__sidebar', open && 'sy-sidebar-nav__sidebar--open', !open && 'sy-sidebar-nav__sidebar--collapsed-mode')}
          style={{ display: 'flex', flexDirection: 'column', height: '100%', width: isMobile ? 240 : open ? 240 : 56 }}
        >
          <button
            type="button"
            aria-label={isMobile ? 'Close menu' : 'Toggle Menu'}
            onClick={() => setOpenState(!open)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
          >
            <Icon name={isMobile ? 'close' : 'menu'} size={20} />
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
    </>
  );
}
