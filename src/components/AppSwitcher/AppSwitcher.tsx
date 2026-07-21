import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Logo } from '../Logo/Logo';

export interface AppSwitcherApp {
  id: string;
  /** Brand mark image + wordmark rendered on the tile — consumer-supplied, same as `Logo`'s own props. */
  markSrc: string;
  wordmark: React.ReactNode;
  accent?: string;
  accentColor?: string;
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

/** App switcher panel (`__s9cmpx-app-switcher-module` + `__s9cmpx-app-launcher-tile`) opened from the header grid icon. */
export function AppSwitcher({ apps, onClose, onAppClick, message, tileSize = 'default', className }: AppSwitcherProps) {
  return (
    <div
      className={cx('__s9cmpx-app-switcher-module', className)}
      role="dialog"
      aria-label="App switcher"
      style={{ background: 'var(--__s9cmpx-static-layer-standard, #fff)', border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: 16, width: 'fit-content', position: 'relative' }}
    >
      {onClose && (
        <button
          type="button"
          className="__s9cmpx-app-switcher-module__close-button"
          aria-label="Close"
          onClick={onClose}
          style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', color: 'var(--__s9cmpx-static-text-weak)' }}
        >
          <Icon name="close" size={14} />
        </button>
      )}
      <div className="__s9cmpx-app-switcher-module__items-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.href ?? '#'}
            className={cx('__s9cmpx-app-launcher-tile', tileSize !== 'default' && `__s9cmpx-app-launcher-tile--${tileSize}`, app.noPermission && '__s9cmpx-app-launcher-tile--no-permission')}
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
              border: '1px solid var(--__s9cmpx-static-divider-weak, rgba(31,31,31,0.08))',
              textDecoration: 'none',
              color: 'inherit',
              opacity: app.noPermission ? 0.45 : 1,
              cursor: app.noPermission ? 'default' : 'pointer',
              minWidth: 170,
            }}
            onMouseEnter={(e) => !app.noPermission && (e.currentTarget.style.background = 'var(--__s9cmpx-interactive-overlay-primary-hover, rgba(31,31,31,0.08))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="__s9cmpx-app-launcher-tile__box" style={{ display: 'inline-flex' }}>
              <Logo markSrc={app.markSrc} wordmark={app.wordmark} accent={app.accent} accentColor={app.accentColor} height={20} />
            </span>
            <span className="__s9cmpx-app-launcher-tile__name __s9cmpx-label3">{app.name}</span>
          </a>
        ))}
      </div>
      {message && (
        <div className="__s9cmpx-app-switcher-module__message __s9cmpx-label3" style={{ marginTop: 12, color: 'var(--__s9cmpx-static-text-weak)', maxWidth: 360 }}>
          {message}
        </div>
      )}
    </div>
  );
}
