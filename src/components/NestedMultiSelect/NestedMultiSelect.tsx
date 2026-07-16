import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';

export interface NestedOptionGroup {
  value: string;
  label: string;
  children: Array<{ value: string; label: string; disabled?: boolean }>;
}

export interface NestedMultiSelectProps {
  groups: NestedOptionGroup[];
  /** Controlled selection of child values */
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  className?: string;
}

/**
 * Tree multi-select (`sy-dropdown-nested-multi-select` + `sy-nested-checkbox`):
 * expandable groups with tri-state parent checkboxes, as used by the
 * Advanced Search sector/geography filters.
 */
export function NestedMultiSelect({
  groups,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'medium',
  error = false,
  disabled = false,
  label,
  className,
}: NestedMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = value ?? internal;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const commit = (next: string[]) => {
    setInternal(next);
    onChange?.(next);
  };

  const toggleChild = (v: string) =>
    commit(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const toggleGroup = (g: NestedOptionGroup) => {
    const enabled = g.children.filter((c) => !c.disabled).map((c) => c.value);
    const allSelected = enabled.every((v) => selected.includes(v));
    commit(allSelected ? selected.filter((v) => !enabled.includes(v)) : [...new Set([...selected, ...enabled])]);
  };

  const toggleExpand = (v: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  const childLabel = (v: string) => {
    for (const g of groups) {
      const c = g.children.find((x) => x.value === v);
      if (c) return c.label;
    }
    return v;
  };

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', minWidth: 300, height: 'fit-content', alignSelf: 'flex-start' }}>
      {label && <span className="sy-label3" style={{ display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        className={cx(
          'sy-dropdown-nested-multi-select',
          `sy-dropdown-nested-multi-select--${size}`,
          error && 'sy-dropdown-nested-multi-select--error',
        )}
      >
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="tree"
          tabIndex={disabled ? -1 : 0}
          className={cx('sy-dropdown-nested-multi-select__control', open && 'sy-dropdown-nested-multi-select__control--is-focused')}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen((o) => !o);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          style={{ display: 'flex', alignItems: 'center', minHeight: 32, padding: '2px 8px', borderRadius: 3, cursor: disabled ? 'default' : 'pointer' }}
        >
          <div className="sy-dropdown-nested-multi-select__input-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, alignItems: 'center' }}>
            {selected.length === 0 ? (
              <span className="sy-body3-short" style={{ color: 'var(--sy-static-text-weak)' }}>{placeholder}</span>
            ) : (
              selected.map((v) => (
                <span key={v} onClick={(e) => e.stopPropagation()}>
                  <Tag size="small" onRemove={disabled ? undefined : () => toggleChild(v)}>{childLabel(v)}</Tag>
                </span>
              ))
            )}
          </div>
          <span className="sy-dropdown-nested-multi-select__indicators" style={{ display: 'inline-flex' }}>
            <span className="sy-dropdown-nested-multi-select__dropdown-indicator" style={{ display: 'inline-flex' }}>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </span>
          </span>
        </div>
        {open && (
          <div className={cx('sy-dropdown-nested-multi-select__menu', 'sy-dropdown-nested-multi-select__menu--open')} style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, marginTop: 4 }}>
            <ul className="sy-dropdown-nested-multi-select__menu-list" role="tree" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 300, overflowY: 'auto' }}>
              {groups.map((g) => {
                const enabled = g.children.filter((c) => !c.disabled).map((c) => c.value);
                const selCount = enabled.filter((v) => selected.includes(v)).length;
                const all = selCount > 0 && selCount === enabled.length;
                const some = selCount > 0 && !all;
                const isExpanded = expanded.has(g.value);
                return (
                  <li key={g.value} role="treeitem" aria-expanded={isExpanded} className={cx('sy-nested-checkbox', 'sy-nested-checkbox--expandable-right', isExpanded && 'sy-nested-checkbox--expanded')}>
                    <div className="sy-nested-checkbox__parent-wrapper" style={{ display: 'flex', alignItems: 'center', borderRadius: 3 }}>
                      <label
                        className="sy-dropdown-nested-multi-select__checkbox sy-dropdown-nested-multi-select__checkbox--parent sy-checkbox"
                        style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', flex: 1, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleGroup(g);
                        }}
                      >
                        <span className="sy-checkbox__container" style={{ display: 'inline-flex' }}>
                          <input
                            type="checkbox"
                            className="sy-checkbox__input"
                            checked={all}
                            ref={(el) => {
                              if (el) el.indeterminate = some;
                            }}
                            readOnly
                          />
                        </span>
                        <span className="sy-checkbox__label sy-body3-short" style={{ fontWeight: 600 }}>{g.label}</span>
                        <span className="sy-label3" style={{ marginLeft: 6, color: 'var(--sy-static-text-weak)' }}>
                          {selCount > 0 ? `${selCount}/${g.children.length}` : g.children.length}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="sy-nested-checkbox__expandable-wrapper"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={() => toggleExpand(g.value)}
                        style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 6, color: 'var(--sy-static-text-weak)' }}
                      >
                        <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
                      </button>
                    </div>
                    {isExpanded && (
                      <ul role="group" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {g.children.map((c) => {
                          const checked = selected.includes(c.value);
                          return (
                            <li key={c.value} role="treeitem" aria-selected={checked} className="sy-nested-checkbox__option-wrapper">
                              <label
                                className={cx('sy-dropdown-nested-multi-select__checkbox', 'sy-dropdown-nested-multi-select__checkbox--child', 'sy-checkbox')}
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 8px 6px 32px', cursor: c.disabled ? 'default' : 'pointer', opacity: c.disabled ? 0.5 : 1 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!c.disabled) toggleChild(c.value);
                                }}
                              >
                                <span className="sy-checkbox__container" style={{ display: 'inline-flex' }}>
                                  <input type="checkbox" className="sy-checkbox__input" checked={checked} disabled={c.disabled} readOnly />
                                </span>
                                <span className="sy-checkbox__label sy-body3-short">{c.label}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
