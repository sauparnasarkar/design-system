import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { SearchInput } from '../SearchInput/SearchInput';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Product wordmark; text or an <img> */
  logo: React.ReactNode;
  /** Placeholder for the global search field; omit to hide search */
  searchPlaceholder?: string;
  /** Called with the typed value when the user presses Enter in the search field. Omit to
   *  leave the field purely decorative -- but consider whether that's really the intent, since
   *  a visible search box with no wired action reads as broken, not intentionally inert. */
  onSearch?: (query: string) => void;
  /** Extra actions before the standard icons (e.g. an AI assistant button) */
  centerActions?: React.ReactNode;
  showNotifications?: boolean;
  showAppSwitcher?: boolean;
  showUserMenu?: boolean;
  onLogoClick?: () => void;
}

export function Header({
  logo,
  // No default value, deliberately -- the prop doc promises "omit to hide search," and a
  // default of 'Search…' would silently contradict that for every caller who omits it
  // expecting the box to disappear. Confirmed live this was already a real bug for an
  // existing consumer (climate-emissions-analysis-project's own Header call omits both
  // searchPlaceholder and onSearch, intending no search box at all, but was actually
  // rendering a decorative "Search…" box with no wired action -- exactly the failure
  // mode the onSearch doc comment below already warns about, just via omission instead
  // of an explicit empty value).
  searchPlaceholder,
  onSearch,
  centerActions,
  showNotifications = true,
  showAppSwitcher = true,
  showUserMenu = true,
  onLogoClick,
  className,
  ...rest
}: HeaderProps) {
  const [searchValue, setSearchValue] = React.useState('');
  const iconButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: 'none',
    border: 0,
    borderRadius: 3,
    cursor: 'pointer',
    color: 'var(--__s9cmpx-static-text-standard)',
  };
  return (
    <header className={cx('__s9cmpx-header', className)} {...rest}>
      <div className="__s9cmpx-header__left" style={{ gridArea: 'left', display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onLogoClick}
          style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', color: 'var(--__s9cmpx-static-text-strong)' }}
          aria-label="Home"
        >
          {logo}
        </button>
      </div>
      <div className="__s9cmpx-header__center" style={{ gridArea: 'center', display: 'flex', alignItems: 'center', gap: 12 }}>
        {searchPlaceholder && (
          <div
            style={{
              flex: 1,
              border: '1px solid var(--__s9cmpx-static-divider-inverse-weak)',
              borderRadius: 3,
              padding: '6px 10px',
              background: 'var(--__s9cmpx-static-background-inverse-weak)',
              color: 'var(--__s9cmpx-static-text-inverse-standard)',
              // SearchInput's icon/clear button read --__s9cmpx-static-text-weak directly (not
              // `inherit`), and the vendor CSS sets the typed-text color via
              // `color:var(--__s9cmpx-c-search-input-control-text-color-default)!important`
              // (itself var(--__s9cmpx-static-text-strong)) — remap both in this subtree so
              // everything reads correctly against the inverse surface instead of the
              // page's normal (non-inverse) text tokens.
              ['--__s9cmpx-static-text-weak' as string]: 'var(--__s9cmpx-static-text-inverse-weak)',
              ['--__s9cmpx-static-text-strong' as string]: 'var(--__s9cmpx-static-text-inverse-strong)',
            } as React.CSSProperties}
          >
            <SearchInput
              variant="full"
              placeholder={searchPlaceholder}
              aria-label="Search Bar"
              className="__s9cmpx-search-input--on-inverse"
              value={searchValue}
              onChange={setSearchValue}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim()) onSearch?.(searchValue.trim());
              }}
            />
          </div>
        )}
        {centerActions}
      </div>
      <div className="__s9cmpx-header__right" style={{ gridArea: 'right', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
        {showNotifications && (
          <button type="button" style={iconButtonStyle} aria-label="Notifications">
            <Icon name="bell" size={20} />
          </button>
        )}
        {showAppSwitcher && (
          <button type="button" style={iconButtonStyle} aria-label="App switcher">
            <Icon name="grid" size={20} />
          </button>
        )}
        {showUserMenu && (
          <button type="button" style={iconButtonStyle} aria-label="User account menu">
            <Icon name="user" size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
