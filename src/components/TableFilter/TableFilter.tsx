import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilterProps {
  /** Column/filter name shown on the trigger */
  label: React.ReactNode;
  options: TableFilterOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  /** Hide the search input inside the menu */
  suppressSearch?: boolean;
  className?: string;
}

/**
 * Column set-filter popover (`__s9cmpx-set-table-filter` + custom-filter trigger),
 * as used in the grids' floating filter row: trigger with selected count,
 * searchable checkbox menu, Clear/Apply footer.
 */
export function TableFilter({
  label,
  options,
  value,
  onChange,
  suppressSearch = false,
  className,
}: TableFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;
  const current = value ?? applied;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Land on the first visible option whenever the menu opens, so arrow-key
  // navigation and aria-activedescendant have a sane starting point, and again
  // whenever the search query narrows the list (so it never points off-list).
  React.useEffect(() => {
    if (!open) return;
    setHighlighted(0);
  }, [open, query]);

  React.useEffect(() => {
    if (open && !suppressSearch) searchInputRef.current?.focus();
  }, [open, suppressSearch]);

  const openMenu = () => {
    setDraft(current);
    setQuery('');
    setOpen(true);
  };

  const commit = (values: string[]) => {
    setApplied(values);
    onChange?.(values);
    setOpen(false);
  };

  const visible = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
  const filtered = current.length > 0;

  const moveHighlight = (delta: number) => {
    if (visible.length === 0) return;
    setHighlighted((h) => (h + delta + visible.length) % visible.length);
  };

  const toggleHighlighted = () => {
    const opt = visible[highlighted];
    if (!opt) return;
    setDraft((d) => (d.includes(opt.value) ? d.filter((x) => x !== opt.value) : [...d, opt.value]));
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      toggleHighlighted();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={cx('__s9cmpx-table-custom-filter-base', className)} style={{ position: 'relative', display: 'inline-block', height: 'fit-content', alignSelf: 'flex-start' }}>
      <button
        type="button"
        className={cx('__s9cmpx-table-custom-filter-base-trigger-element', '__s9cmpx-label3')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open ? optionId(highlighted) : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            openMenu();
            return;
          }
          if (open) onMenuKeyDown(e);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          minWidth: 150,
          background: 'var(--__s9cmpx-static-background-standard, #fff)',
          border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))',
          borderRadius: 3,
          cursor: 'pointer',
        }}
      >
        {filtered ? (
          <span className="__s9cmpx-table-custom-filter-base-trigger-element__selected-value" style={{ fontWeight: 600 }}>
            {label}: {current.length} selected
          </span>
        ) : (
          <span className="__s9cmpx-table-custom-filter-base-trigger-element__placeholder" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>
            <span className="__s9cmpx-table-custom-filter-base-trigger-element__placeholder-text">{label}</span>
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {filtered && (
            <span className="__s9cmpx-table-custom-filter-base-trigger-element__filtered-icon-wrapper" style={{ display: 'inline-flex' }}>
              <Icon name="check" size={12} />
            </span>
          )}
          <span className="__s9cmpx-table-custom-filter-base-trigger-element__icon" style={{ display: 'inline-flex' }}>
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
          </span>
        </span>
      </button>
      {open && (
        <div
          className="__s9cmpx-table-custom-filter-base__tippy"
          style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, marginTop: 4, minWidth: 220, background: 'var(--__s9cmpx-static-layer-standard, #fff)', border: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          <div className="__s9cmpx-set-table-filter">
          {!suppressSearch && (
            <div className="__s9cmpx-set-table-filter__search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderBottom: '1px solid var(--__s9cmpx-static-divider-weak, rgba(31,31,31,0.08))' }}>
              <span className="__s9cmpx-set-table-filter__search-placeholder-icon" style={{ display: 'inline-flex', color: 'var(--__s9cmpx-static-text-weak)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                ref={searchInputRef}
                className="__s9cmpx-set-table-filter__input __s9cmpx-body3-short"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={optionId(highlighted)}
                onKeyDown={onMenuKeyDown}
                style={{ border: 0, outline: 'none', flex: 1, background: 'transparent', color: 'inherit' }}
              />
            </div>
          )}
          <ul id={listboxId} className="__s9cmpx-set-table-filter__menu-list" role="listbox" aria-multiselectable="true" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 220, overflowY: 'auto' }}>
            {visible.length === 0 && (
              <li className="__s9cmpx-set-table-filter__no-options-message" style={{ padding: 8, color: 'var(--__s9cmpx-static-text-weak)' }}>
                No matches
              </li>
            )}
            {visible.map((o, i) => {
              const checked = draft.includes(o.value);
              return (
                <li
                  key={o.value}
                  id={optionId(i)}
                  role="option"
                  aria-selected={checked}
                  className={cx('__s9cmpx-set-table-filter__option', i === highlighted && '__s9cmpx-set-table-filter__option--is-focused')}
                  onClick={() => setDraft((d) => (checked ? d.filter((x) => x !== o.value) : [...d, o.value]))}
                  onMouseEnter={() => setHighlighted(i)}
                  style={{ cursor: 'pointer', borderRadius: 3 }}
                >
                  <label className="__s9cmpx-set-table-filter__checkbox __s9cmpx-checkbox" style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', pointerEvents: 'none' }}>
                    <span className="__s9cmpx-checkbox__container" style={{ display: 'inline-flex' }}>
                      <input type="checkbox" className="__s9cmpx-checkbox__input" checked={checked} readOnly />
                    </span>
                    <span className="__s9cmpx-checkbox__label __s9cmpx-body3-short">{o.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <hr className="__s9cmpx-table-custom-filter-base__menu-list-divider" style={{ border: 0, borderTop: '1px solid var(--__s9cmpx-static-divider-weak, rgba(31,31,31,0.08))', margin: 0 }} />
          <div className="__s9cmpx-table-custom-filter-base__menu-list-buttons" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: 8 }}>
            <button type="button" className="__s9cmpx-button __s9cmpx-button--ghost __s9cmpx-button--s" onClick={() => commit([])}>
              Clear
            </button>
            <button type="button" className="__s9cmpx-button __s9cmpx-button--primary __s9cmpx-button--s" onClick={() => commit(draft)}>
              Apply
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
