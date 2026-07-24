import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';

export type MultiSelectSize = 'small' | 'medium' | 'large';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Controlled selection */
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  size?: MultiSelectSize;
  error?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  /** Hide the in-menu search box that filters options by label as you type */
  suppressSearch?: boolean;
  /** Placeholder for the in-menu search box */
  searchPlaceholder?: string;
  /** Caps the number of simultaneous selections — further un-selected options render
   * disabled (blocked from toggling on) once reached, while existing tags stay removable.
   * For picking a bounded number from a large pool (e.g. up to 10 countries for a chart
   * that gets unreadable past that), not general form validation. */
  maxSelected?: number;
  className?: string;
}

/** Checkbox-list multi select (`__s9cmpx-dropdown-multi-select`), selected values shown as
 * removable tags. Opens with a search box (mirrors TableFilter's own search-in-menu pattern)
 * that filters the option list by label as you type — the whole point once a list gets long
 * (e.g. a 220-country list), not just a nice-to-have. */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'medium',
  error = false,
  disabled = false,
  label,
  suppressSearch = false,
  searchPlaceholder = 'Search…',
  maxSelected,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const selected = value ?? internal;
  const labelId = React.useId();
  const listboxId = React.useId();
  const maxHintId = React.useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;
  const atCap = maxSelected !== undefined && selected.length >= maxSelected;
  const isBlocked = (o: MultiSelectOption) => o.disabled || (atCap && !selected.includes(o.value));

  const visibleOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q === '' ? options : options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Land on the first non-disabled visible option whenever the menu opens, and again
  // whenever the search query narrows/widens the visible set, so arrow-key navigation and
  // aria-activedescendant never point at a filtered-out (or stale) option.
  React.useEffect(() => {
    if (!open) return;
    const firstEnabled = visibleOptions.findIndex((o) => !isBlocked(o));
    setHighlighted(firstEnabled === -1 ? 0 : firstEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, visibleOptions]);

  React.useEffect(() => {
    if (!open) return;
    setQuery('');
    if (!suppressSearch) searchInputRef.current?.focus();
  }, [open, suppressSearch]);

  const commit = (next: string[]) => {
    setInternal(next);
    onChange?.(next);
  };
  // Removing an already-selected value is always allowed, even at the cap — only adding a
  // new one is blocked once maxSelected is reached.
  const toggle = (v: string) => {
    if (selected.includes(v)) {
      commit(selected.filter((x) => x !== v));
    } else if (!atCap) {
      commit([...selected, v]);
    }
  };

  const moveHighlight = (delta: number) => {
    if (visibleOptions.length === 0) return;
    let next = highlighted;
    for (let i = 0; i < visibleOptions.length; i++) {
      next = (next + delta + visibleOptions.length) % visibleOptions.length;
      if (!isBlocked(visibleOptions[next])) break;
    }
    setHighlighted(next);
  };

  // Shared between the trigger control (while closed, just opens the menu; and while
  // open, only when search is suppressed and it's the thing actually holding focus) and
  // the in-menu search input (while open, normally). `allowSpaceToggle` must be false for
  // the search input — Space there is a normal character for multi-word queries (e.g.
  // "United King...", not a select-this-option key.
  const navigateOrToggle = (e: React.KeyboardEvent, allowSpaceToggle: boolean) => {
    if (e.key === 'Enter' || (allowSpaceToggle && e.key === ' ')) {
      e.preventDefault();
      const opt = visibleOptions[highlighted];
      if (opt && !isBlocked(opt)) toggle(opt.value);
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
    <div ref={rootRef} className={className} style={{ position: 'relative', minWidth: 'min(280px, 100%)' }}>
      {label && <span id={labelId} className="__s9cmpx-label3" style={{ display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        className={cx(
          '__s9cmpx-dropdown-multi-select',
          `__s9cmpx-dropdown-multi-select--${size}`,
          error && '__s9cmpx-dropdown-multi-select--error',
          disabled && '__s9cmpx-dropdown-multi-select--is-disabled',
        )}
      >
        <div
          className={cx('__s9cmpx-dropdown-multi-select__control', open && '__s9cmpx-dropdown-multi-select__control--is-focused')}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && visibleOptions.length > 0 ? optionId(highlighted) : undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
              e.preventDefault();
              setOpen(true);
              return;
            }
            // Once open, focus normally moves to the search box below (which does not
            // treat Space as a toggle key). This branch only covers suppressSearch, where
            // there is no input to move focus to and this control drives selection directly.
            if (open && suppressSearch) navigateOrToggle(e, true);
          }}
          style={{ display: 'flex', alignItems: 'center', borderRadius: 3, cursor: disabled ? 'default' : 'pointer', minHeight: 32, padding: '2px 8px' }}
        >
          <div className="__s9cmpx-dropdown-multi-select__value-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, alignItems: 'center' }}>
            {selected.length === 0 && (
              <span className="__s9cmpx-dropdown-multi-select__placeholder __s9cmpx-body3-short">{placeholder}</span>
            )}
            {selected.map((v) => {
              const opt = options.find((o) => o.value === v);
              return (
                <span key={v} className="__s9cmpx-dropdown-multi-select__tag" onClick={(e) => e.stopPropagation()}>
                  <Tag size="small" onRemove={disabled ? undefined : () => toggle(v)}>{opt?.label ?? v}</Tag>
                </span>
              );
            })}
          </div>
          <span className="__s9cmpx-dropdown-multi-select__indicator" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {selected.length > 0 && !disabled && (
              <button
                type="button"
                className="__s9cmpx-dropdown-multi-select__clear-indicator"
                aria-label="Clear all"
                onClick={(e) => {
                  e.stopPropagation();
                  commit([]);
                }}
                style={{ background: 'none', border: 0, display: 'inline-flex', padding: 0, cursor: 'pointer' }}
              >
                <Icon name="close" size={14} />
              </button>
            )}
            <span className="__s9cmpx-dropdown-multi-select__dropdown-indicator" style={{ display: 'inline-flex' }}>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </span>
          </span>
        </div>
        {open && (
          <div className={cx('__s9cmpx-dropdown-multi-select__menu', '__s9cmpx-dropdown-multi-select__menu--open')} style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, marginTop: 4 }}>
            {!suppressSearch && (
              <div
                className="__s9cmpx-dropdown-multi-select__search-wrapper"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderBottom: '1px solid var(--__s9cmpx-static-divider-weak, rgba(31,31,31,0.08))' }}
              >
                <span style={{ display: 'inline-flex', color: 'var(--__s9cmpx-static-text-weak)' }}>
                  <Icon name="search" size={14} />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="__s9cmpx-dropdown-multi-select__search-input __s9cmpx-body3-short"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls={listboxId}
                  aria-activedescendant={visibleOptions.length > 0 ? optionId(highlighted) : undefined}
                  aria-label={typeof label === 'string' ? `Search ${label}` : 'Search options'}
                  aria-describedby={atCap ? maxHintId : undefined}
                  value={query}
                  placeholder={searchPlaceholder}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => navigateOrToggle(e, false)}
                  style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
                />
              </div>
            )}
            {atCap && (
              <div
                id={maxHintId}
                className="__s9cmpx-dropdown-multi-select__max-hint __s9cmpx-body4"
                style={{ padding: '6px 8px', color: 'var(--__s9cmpx-static-text-weak)' }}
              >
                Maximum {maxSelected} selected
              </div>
            )}
            <ul id={listboxId} className="__s9cmpx-dropdown-multi-select__menu-list" role="listbox" aria-multiselectable="true" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 240, overflowY: 'auto' }}>
              {visibleOptions.length === 0 ? (
                <li
                  role="option"
                  aria-disabled="true"
                  aria-selected="false"
                  className="__s9cmpx-body3-short"
                  style={{ padding: '8px 12px', color: 'var(--__s9cmpx-static-text-weak)' }}
                >
                  No matches
                </li>
              ) : (
                visibleOptions.map((o, i) => {
                  const isSel = selected.includes(o.value);
                  const blocked = isBlocked(o);
                  return (
                    <li
                      key={o.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={blocked || undefined}
                      className={cx(
                        '__s9cmpx-dropdown-multi-select__option',
                        isSel && '__s9cmpx-dropdown-multi-select__option--is-selected',
                        i === highlighted && '__s9cmpx-dropdown-multi-select__option--is-focused',
                        blocked && '__s9cmpx-dropdown-multi-select__option--is-disabled',
                      )}
                      onClick={() => !blocked && toggle(o.value)}
                      onMouseEnter={() => setHighlighted(i)}
                      style={{ cursor: blocked ? 'default' : 'pointer' }}
                    >
                      {/* A real <input type="checkbox"> here would be a focusable element
                          nested inside this <li role="option"> — an axe "nested-interactive"
                          violation that a negative tabindex/aria-hidden does NOT satisfy (axe
                          flags it regardless, since some assistive tech can still reach it).
                          The actual checked state is already conveyed via aria-selected above;
                          this is purely a decorative visual echo of it. */}
                      <span className="__s9cmpx-dropdown-multi-select__checkbox __s9cmpx-checkbox" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        <span
                          aria-hidden="true"
                          className="__s9cmpx-checkbox__container"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 16,
                            height: 16,
                            borderRadius: 2,
                            boxSizing: 'border-box',
                            border: isSel ? 'none' : '1px solid var(--__s9cmpx-c-checkbox-input-border-color-default)',
                            background: blocked
                              ? 'var(--__s9cmpx-c-checkbox-input-background-color-disabled)'
                              : isSel
                                ? 'var(--__s9cmpx-c-checkbox-input-background-color-checked)'
                                : 'var(--__s9cmpx-c-checkbox-input-background-color-default)',
                          }}
                        >
                          {isSel && <Icon name="check" size={10} style={{ color: '#fff' }} />}
                        </span>
                        <span className="__s9cmpx-checkbox__label __s9cmpx-body3-short">{o.label}</span>
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
