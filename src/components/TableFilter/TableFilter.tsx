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
 * Column set-filter popover (`sy-set-table-filter` + custom-filter trigger),
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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const current = value ?? applied;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

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

  return (
    <div ref={rootRef} className={cx('sy-table-custom-filter-base', className)} style={{ position: 'relative', display: 'inline-block', height: 'fit-content', alignSelf: 'flex-start' }}>
      <button
        type="button"
        className={cx('sy-table-custom-filter-base-trigger-element', 'sy-label3')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          minWidth: 150,
          background: 'var(--sy-static-background-standard, #fff)',
          border: '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))',
          borderRadius: 3,
          cursor: 'pointer',
        }}
      >
        {filtered ? (
          <span className="sy-table-custom-filter-base-trigger-element__selected-value" style={{ fontWeight: 600 }}>
            {label}: {current.length} selected
          </span>
        ) : (
          <span className="sy-table-custom-filter-base-trigger-element__placeholder" style={{ color: 'var(--sy-static-text-weak)' }}>
            <span className="sy-table-custom-filter-base-trigger-element__placeholder-text">{label}</span>
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {filtered && (
            <span className="sy-table-custom-filter-base-trigger-element__filtered-icon-wrapper" style={{ display: 'inline-flex' }}>
              <Icon name="check" size={12} />
            </span>
          )}
          <span className="sy-table-custom-filter-base-trigger-element__icon" style={{ display: 'inline-flex' }}>
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} />
          </span>
        </span>
      </button>
      {open && (
        <div
          className="sy-table-custom-filter-base__tippy"
          style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, marginTop: 4, minWidth: 220, background: 'var(--sy-static-layer-standard, #fff)', border: '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          <div className="sy-set-table-filter">
          {!suppressSearch && (
            <div className="sy-set-table-filter__search-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderBottom: '1px solid var(--sy-static-divider-weak, rgba(31,31,31,0.08))' }}>
              <span className="sy-set-table-filter__search-placeholder-icon" style={{ display: 'inline-flex', color: 'var(--sy-static-text-weak)' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                className="sy-set-table-filter__input sy-body3-short"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: 0, outline: 'none', flex: 1, background: 'transparent', color: 'inherit' }}
              />
            </div>
          )}
          <ul className="sy-set-table-filter__menu-list" role="listbox" aria-multiselectable="true" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 220, overflowY: 'auto' }}>
            {visible.length === 0 && (
              <li className="sy-set-table-filter__no-options-message" style={{ padding: 8, color: 'var(--sy-static-text-weak)' }}>
                No matches
              </li>
            )}
            {visible.map((o) => {
              const checked = draft.includes(o.value);
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={checked}
                  className="sy-set-table-filter__option"
                  onClick={() => setDraft((d) => (checked ? d.filter((x) => x !== o.value) : [...d, o.value]))}
                  style={{ cursor: 'pointer', borderRadius: 3 }}
                >
                  <label className="sy-set-table-filter__checkbox sy-checkbox" style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', pointerEvents: 'none' }}>
                    <span className="sy-checkbox__container" style={{ display: 'inline-flex' }}>
                      <input type="checkbox" className="sy-checkbox__input" checked={checked} readOnly />
                    </span>
                    <span className="sy-checkbox__label sy-body3-short">{o.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <hr className="sy-table-custom-filter-base__menu-list-divider" style={{ border: 0, borderTop: '1px solid var(--sy-static-divider-weak, rgba(31,31,31,0.08))', margin: 0 }} />
          <div className="sy-table-custom-filter-base__menu-list-buttons" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: 8 }}>
            <button type="button" className="sy-button sy-button--ghost sy-button--s" onClick={() => commit([])}>
              Clear
            </button>
            <button type="button" className="sy-button sy-button--primary sy-button--s" onClick={() => commit(draft)}>
              Apply
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
