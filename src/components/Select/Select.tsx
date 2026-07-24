import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type SelectSize = 'small' | 'medium' | 'large';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: SelectSize;
  borderless?: boolean;
  error?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  /** Accessible name to use when no visible `label` is rendered (e.g. compact controls in a card header) */
  ariaLabel?: string;
  /** Hide the in-menu search box that filters options by label as you type */
  suppressSearch?: boolean;
  /** Placeholder for the in-menu search box */
  searchPlaceholder?: string;
  className?: string;
}

/** Single-select combobox (`__s9cmpx-select`). Opens with a search box in the menu that
 * filters options by label as you type — mirrors `MultiSelect`'s own search-in-menu
 * pattern, adapted for single-select semantics (Enter commits *and closes*, unlike
 * `MultiSelect`'s toggle-and-stay-open). */
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'medium',
  borderless = false,
  error = false,
  disabled = false,
  label,
  ariaLabel,
  suppressSearch = false,
  searchPlaceholder = 'Search…',
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string | undefined>(undefined);
  const [query, setQuery] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const selected = value ?? internal;
  const selectedOption = options.find((o) => o.value === selected);
  const labelId = React.useId();
  const listboxId = React.useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  const visibleOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return options;
    return options.filter((o) => (typeof o.label === 'string' ? o.label.toLowerCase().includes(q) : true));
  }, [options, query]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Land on the selected option (or the first enabled one) whenever the menu opens, and
  // again whenever the search query narrows/widens the visible set, so arrow-key
  // navigation and aria-activedescendant never point at a filtered-out (or stale) option.
  React.useEffect(() => {
    if (!open) return;
    const selectedIndex = visibleOptions.findIndex((o) => o.value === selected);
    if (selectedIndex !== -1) {
      setHighlighted(selectedIndex);
      return;
    }
    const firstEnabled = visibleOptions.findIndex((o) => !o.disabled);
    setHighlighted(firstEnabled === -1 ? 0 : firstEnabled);
  }, [open, visibleOptions, selected]);

  React.useEffect(() => {
    if (!open) return;
    setQuery('');
    if (!suppressSearch) searchInputRef.current?.focus();
  }, [open, suppressSearch]);

  const commit = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

  const moveHighlight = (delta: number) => {
    if (visibleOptions.length === 0) return;
    let next = highlighted;
    for (let i = 0; i < visibleOptions.length; i++) {
      next = (next + delta + visibleOptions.length) % visibleOptions.length;
      if (!visibleOptions[next].disabled) break;
    }
    setHighlighted(next);
  };

  // Shared between the trigger button (while closed, just opens the menu; and while open,
  // only when search is suppressed and it's the thing actually holding focus) and the
  // in-menu search input (while open, normally). `allowSpaceCommit` must be false for the
  // search input — Space there is a normal character for multi-word queries, not a
  // select-this-option key.
  const navigateOrCommit = (e: React.KeyboardEvent, allowSpaceCommit: boolean) => {
    if (e.key === 'Enter' || (allowSpaceCommit && e.key === ' ')) {
      e.preventDefault();
      const opt = visibleOptions[highlighted];
      if (opt && !opt.disabled) {
        commit(opt.value);
        setOpen(false);
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveHighlight(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveHighlight(-1);
    }
  };

  return (
    <div className={className} ref={rootRef} style={{ position: 'relative', width: 'fit-content', minWidth: 200 }}>
      {label && <span id={labelId} className="__s9cmpx-label3" style={{ display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        className={cx(
          '__s9cmpx-select',
          borderless ? '__s9cmpx-select--borderless' : '__s9cmpx-select--default',
          `__s9cmpx-select--${size}`,
          error && '__s9cmpx-select--error',
          disabled && '__s9cmpx-select--is-disabled',
        )}
      >
        <button
          type="button"
          role="combobox"
          className={cx('__s9cmpx-select__control', open && '__s9cmpx-select__control--is-focused', disabled && '__s9cmpx-select__control--is-disabled')}
          style={{ width: '100%' }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : ariaLabel}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && visibleOptions.length > 0 ? optionId(highlighted) : undefined}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
              e.preventDefault();
              setOpen(true);
              return;
            }
            // Once open, focus normally moves to the search box below (which does not
            // treat Space as a commit key). This branch only covers suppressSearch, where
            // there is no input to move focus to and this control drives selection directly.
            if (open && suppressSearch) navigateOrCommit(e, true);
          }}
        >
          {selectedOption ? (
            <span className="__s9cmpx-select__single-value __s9cmpx-body3-short">{selectedOption.label}</span>
          ) : (
            <span className="__s9cmpx-select__placeholder __s9cmpx-body3-short">{placeholder}</span>
          )}
          <span className="__s9cmpx-select__indicators">
            <span className="__s9cmpx-select__dropdown-indicator">
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </span>
          </span>
        </button>
        {open && (
          <div className={cx('__s9cmpx-select__menu', `__s9cmpx-select__menu--${size}`, '__s9cmpx-select__menu--open')} style={{ position: 'absolute', zIndex: 10, left: 0, right: 0 }}>
            {!suppressSearch && (
              <div
                className="__s9cmpx-select__search-wrapper"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderBottom: '1px solid var(--__s9cmpx-static-divider-weak, rgba(31,31,31,0.08))' }}
              >
                <span style={{ display: 'inline-flex', color: 'var(--__s9cmpx-static-text-weak)' }}>
                  <Icon name="search" size={14} />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="__s9cmpx-select__search-input __s9cmpx-body3-short"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listboxId}
                  aria-activedescendant={visibleOptions.length > 0 ? optionId(highlighted) : undefined}
                  aria-label={typeof label === 'string' ? `Search ${label}` : 'Search options'}
                  value={query}
                  placeholder={searchPlaceholder}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => navigateOrCommit(e, false)}
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
                />
              </div>
            )}
            <ul id={listboxId} className="__s9cmpx-select__menu-list" role="listbox" aria-labelledby={label ? labelId : undefined} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {visibleOptions.length === 0 ? (
                <li role="option" aria-disabled="true" className="__s9cmpx-body3-short" style={{ padding: '8px 12px', color: 'var(--__s9cmpx-static-text-weak)' }}>
                  No matches
                </li>
              ) : (
                visibleOptions.map((o, i) => (
                  <li
                    key={o.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={selected === o.value}
                    className={cx(
                      '__s9cmpx-select__option',
                      '__s9cmpx-body3-short',
                      selected === o.value && '__s9cmpx-select__option--is-selected',
                      i === highlighted && '__s9cmpx-select__option--is-focused',
                      o.disabled && '__s9cmpx-select__option--is-disabled',
                    )}
                    onClick={() => {
                      if (o.disabled) return;
                      commit(o.value);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setHighlighted(i)}
                  >
                    <span className="__s9cmpx-select__option-label">{o.label}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
