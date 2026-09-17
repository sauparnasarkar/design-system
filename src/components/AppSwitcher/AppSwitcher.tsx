import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface AppSwitcherApp {
  id: string;
  /** Brand mark image rendered on the tile — consumer-supplied. */
  markSrc: string;
  /** @deprecated unused since the tile switched to an icon-over-label layout (see `name`) -- kept only so existing callers that still pass it don't need an immediate edit. */
  wordmark?: React.ReactNode;
  /** @deprecated unused for the same reason as `wordmark`. */
  accent?: string;
  /** @deprecated unused for the same reason as `wordmark`. */
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

// Google's own app switcher (the reference this tile design was matched against) keeps a fixed
// 3-column grid at every viewport width rather than reflowing by breakpoint -- its tiles are
// narrow enough (a single icon + a below label, not a full Logo lockup) that 3 of them never
// risk overflowing a phone-width popover the way this component's old 2-column, 170px-tile
// layout did (confirmed live: right-anchored on a ~390px viewport, that older layout rendered
// partly off the left edge of the screen). `Math.min` also means a caller with only 1-2 apps
// (both of this workspace's real consumers today) gets exactly that many columns, never a grid
// with an empty trailing cell.
const MAX_COLUMNS = 3;

/** App switcher panel (`__s9cmpx-app-switcher-module` + `__s9cmpx-app-launcher-tile`) opened from the header grid icon. Tile layout: icon on top, app name below -- matches the icon-launcher convention (Google's app switcher, iOS/Android home screens) rather than this design system's own inline Logo lockup, which doubled up the app name (lockup wordmark + a second name label) when used as a launcher tile. */
export function AppSwitcher({ apps, onClose, onAppClick, message, tileSize = 'default', className }: AppSwitcherProps) {
  const columns = Math.max(1, Math.min(MAX_COLUMNS, apps.length));
  return (
    <div
      className={cx('__s9cmpx-app-switcher-module', className)}
      role="dialog"
      aria-label="App switcher"
      style={{ background: 'var(--__s9cmpx-static-layer-standard, #fff)', border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', padding: 16, width: 'fit-content', maxWidth: 'calc(100vw - 32px)', position: 'relative' }}
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
      {/* overflowX handles the boundary case a fixed 120px tile width creates once MAX_COLUMNS=3
          apps land on a viewport narrow enough that the popover's own maxWidth (above) caps below
          3 tiles' real combined width (3*120 + gaps + padding) -- rather than letting the grid's
          content visually spill past this dialog's own rounded border, it scrolls within it. Not
          a real case for either of this workspace's own consumers today (both pass exactly 2
          apps), but a real one for the day a 3rd app is added. */}
      <div className="__s9cmpx-app-switcher-module__items-wrapper" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 4, overflowX: 'auto' }}>
        {apps.map((app) => (
          <a
            key={app.id}
            href={app.href ?? '#'}
            className={cx('__s9cmpx-app-launcher-tile', tileSize !== 'default' && `__s9cmpx-app-launcher-tile--${tileSize}`, app.noPermission && '__s9cmpx-app-launcher-tile--no-permission')}
            onClick={(e) => {
              // noPermission must block navigation even when the caller also supplied a real
              // href -- a grayed-out, aria-disabled tile that still followed its own link on
              // click would contradict `noPermission`'s whole purpose (confirmed real: no
              // current caller does this today, but the prop's own contract allows it).
              if (app.noPermission || !app.href) e.preventDefault();
              if (!app.noPermission) onAppClick?.(app.id);
            }}
            aria-disabled={app.noPermission}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 8,
              padding: '14px 6px',
              borderRadius: 8,
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              opacity: app.noPermission ? 0.45 : 1,
              cursor: app.noPermission ? 'default' : 'pointer',
              width: 120,
            }}
            onMouseEnter={(e) => !app.noPermission && (e.currentTarget.style.background = 'var(--__s9cmpx-interactive-overlay-primary-hover, rgba(31,31,31,0.08))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="__s9cmpx-app-launcher-tile__box" style={{ display: 'inline-flex' }}>
              <img src={app.markSrc} alt="" style={{ width: 40, height: 40, objectFit: 'contain', display: 'block' }} />
            </span>
            {/* Two real rows, not a 1-line-then-ellipsis truncation -- tile width above is sized
                so both real consumers' longest word ("Intelligence") fits a row on its own;
                minHeight of two lines reserves consistent tile height whether a given name
                actually wraps to one row or two, so tiles in the same grid row stay level. */}
            <span
              className="__s9cmpx-app-launcher-tile__name __s9cmpx-label3"
              style={{ whiteSpace: 'normal', lineHeight: 1.3, minHeight: 'calc(1.3em * 2)' }}
            >
              {app.name}
            </span>
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
