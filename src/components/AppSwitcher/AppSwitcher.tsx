import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Logo, type LogoProduct } from '../Logo/Logo';

export interface AppSwitcherApp {
  id: string;
  /** Product logo to render on the tile */
  product: LogoProduct;
  name: string;
  href?: string;
  /** Grayed-out tile for apps outside the user's entitlement */
  noPermission?: boolean;
}

export interface AppSwitcherProps {
  apps: AppSwitcherApp[];
  onClose?: () => void;
  onAppClick?: (id: string) => void;
  /** Note under the grid (e.g. entitlement message) */
  message?: React.ReactNode;
  tileSize?: 'small' | 'default' | 'large';
  className?: string;
}

/** App switcher panel (`sy-app-switcher-module` + `sy-app-launcher-tile`) opened from the header grid icon. */
export function AppSwitcher({ apps, onClose, onAppClick, message, tileSize = 'default', className }: AppSwitcherProps) {
  return (
    <div
      className={cx('sy-app-switcher-module', className)}
      role="dialog"
      aria-label="App switcher"
      style={{ background: 'var(--sy-static-layer-standard, #fff)', border: '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: 16, width: 'fit-content', position: 'relative' }}
    >
      {onClose && (
        <button
          type="button"
          className="sy-app-switcher-module__close-button"
          aria-label="Close"
          onClick={onClose}
          style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', color: 'var(--sy-static-text-weak)' }}
        >
          <Icon name="close" size={14} />
        </button>
      )}
      <div className="sy-app-switcher-module__items-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.href ?? '#'}
            className={cx('sy-app-launcher-tile', tileSize !== 'default' && `sy-app-launcher-tile--${tileSize}`, app.noPermission && 'sy-app-launcher-tile--no-permission')}
            onClick={(e) => {
              if (!app.href) e.preventDefault();
              if (!app.noPermission) onAppClick?.(app.id);
            }}
            aria-disabled={app.noPermission}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: 12,
              borderRadius: 3,
              border: '1px solid var(--sy-static-divider-weak, rgba(31,31,31,0.08))',
              textDecoration: 'none',
              color: 'inherit',
              opacity: app.noPermission ? 0.45 : 1,
              cursor: app.noPermission ? 'default' : 'pointer',
              minWidth: 170,
            }}
            onMouseEnter={(e) => !app.noPermission && (e.currentTarget.style.background = 'var(--sy-interactive-overlay-primary-hover, rgba(31,31,31,0.08))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="sy-app-launcher-tile__box" style={{ display: 'inline-flex' }}>
              <Logo product={app.product} height={20} />
            </span>
            <span className="sy-app-launcher-tile__name sy-label3">{app.name}</span>
          </a>
        ))}
      </div>
      {message && (
        <div className="sy-app-switcher-module__message sy-label3" style={{ marginTop: 12, color: 'var(--sy-static-text-weak)', maxWidth: 360 }}>
          {message}
        </div>
      )}
    </div>
  );
}
