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
 * Tree multi-select (`__s9cmpx-dropdown-nested-multi-select` + `__s9cmpx-nested-checkbox`):
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
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();
  const labelId = React.useId();
  const selected = value ?? internal;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  React.useEffect(() => {
    if (open) setHighlighted(0);
  }, [open]);

  const commit = (next: string[]) => {
    setInternal(next);
    onChange?.(next);
  };

  // Flattened visible rows (groups + their children, only when expanded) — this is what
  // arrow-key navigation moves through and what aria-activedescendant points into. Focus
  // stays on the outer combobox the whole time (same "virtual focus" pattern Select and
  // MultiSelect already use); individual rows are never given real DOM focus.
  type Row = { key: string; kind: 'group'; group: NestedOptionGroup } | { key: string; kind: 'child'; group: NestedOptionGroup; child: NestedOptionGroup['children'][number] };
  const visibleRows = React.useMemo(() => {
    const rows: Row[] = [];
    for (const g of groups) {
      rows.push({ key: `group:${g.value}`, kind: 'group', group: g });
      if (expanded.has(g.value)) {
        for (const c of g.children) {
          rows.push({ key: `child:${c.value}`, kind: 'child', group: g, child: c });
        }
      }
    }
    return rows;
  }, [groups, expanded]);
  const rowIndex = React.useMemo(() => {
    const map = new Map<string, number>();
    visibleRows.forEach((r, i) => map.set(r.key, i));
    return map;
  }, [visibleRows]);
  const optionId = (i: number) => `${listboxId}-option-${i}`;
  const clampedHighlighted = Math.min(highlighted, Math.max(visibleRows.length - 1, 0));

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

  const moveHighlight = (delta: number) => {
    if (visibleRows.length === 0) return;
    setHighlighted((h) => (Math.min(h, visibleRows.length - 1) + delta + visibleRows.length) % visibleRows.length);
  };

  const activateHighlighted = () => {
    const row = visibleRows[clampedHighlighted];
    if (!row) return;
    if (row.kind === 'group') toggleGroup(row.group);
    else if (!row.child.disabled) toggleChild(row.child.value);
  };

  const onTreeKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    const row = visibleRows[clampedHighlighted];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (row?.kind === 'group') {
        if (!expanded.has(row.group.value)) {
          toggleExpand(row.group.value);
        } else if (row.group.children.length > 0) {
          const firstChildIndex = rowIndex.get(`child:${row.group.children[0].value}`);
          if (firstChildIndex !== undefined) setHighlighted(firstChildIndex);
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (row?.kind === 'child') {
        const parentIndex = rowIndex.get(`group:${row.group.value}`);
        if (parentIndex !== undefined) setHighlighted(parentIndex);
      } else if (row?.kind === 'group' && expanded.has(row.group.value)) {
        toggleExpand(row.group.value);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateHighlighted();
    }
  };

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', minWidth: 300, height: 'fit-content', alignSelf: 'flex-start' }}>
      {label && <span id={labelId} className="__s9cmpx-label3" style={{ display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        className={cx(
          '__s9cmpx-dropdown-nested-multi-select',
          `__s9cmpx-dropdown-nested-multi-select--${size}`,
          error && '__s9cmpx-dropdown-nested-multi-select--error',
        )}
      >
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="tree"
          aria-labelledby={label ? labelId : undefined}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && visibleRows.length > 0 ? optionId(clampedHighlighted) : undefined}
          tabIndex={disabled ? -1 : 0}
          className={cx('__s9cmpx-dropdown-nested-multi-select__control', open && '__s9cmpx-dropdown-nested-multi-select__control--is-focused')}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={onTreeKeyDown}
          style={{ display: 'flex', alignItems: 'center', minHeight: 32, padding: '2px 8px', borderRadius: 3, cursor: disabled ? 'default' : 'pointer' }}
        >
          <div className="__s9cmpx-dropdown-nested-multi-select__input-container" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1, alignItems: 'center' }}>
            {selected.length === 0 ? (
              <span className="__s9cmpx-body3-short" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{placeholder}</span>
            ) : (
              selected.map((v) => (
                <span key={v} onClick={(e) => e.stopPropagation()}>
                  <Tag size="small" onRemove={disabled ? undefined : () => toggleChild(v)}>{childLabel(v)}</Tag>
                </span>
              ))
            )}
          </div>
          <span className="__s9cmpx-dropdown-nested-multi-select__indicators" style={{ display: 'inline-flex' }}>
            <span className="__s9cmpx-dropdown-nested-multi-select__dropdown-indicator" style={{ display: 'inline-flex' }}>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </span>
          </span>
        </div>
        {open && (
          <div className={cx('__s9cmpx-dropdown-nested-multi-select__menu', '__s9cmpx-dropdown-nested-multi-select__menu--open')} style={{ position: 'absolute', zIndex: 20, left: 0, right: 0, marginTop: 4 }}>
            <ul id={listboxId} className="__s9cmpx-dropdown-nested-multi-select__menu-list" role="tree" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 300, overflowY: 'auto' }}>
              {groups.map((g) => {
                const enabled = g.children.filter((c) => !c.disabled).map((c) => c.value);
                const selCount = enabled.filter((v) => selected.includes(v)).length;
                const all = selCount > 0 && selCount === enabled.length;
                const some = selCount > 0 && !all;
                const isExpanded = expanded.has(g.value);
                const groupRowIndex = rowIndex.get(`group:${g.value}`);
                return (
                  <li
                    key={g.value}
                    id={groupRowIndex !== undefined ? optionId(groupRowIndex) : undefined}
                    role="treeitem"
                    aria-expanded={isExpanded}
                    className={cx(
                      '__s9cmpx-nested-checkbox',
                      '__s9cmpx-nested-checkbox--expandable-right',
                      isExpanded && '__s9cmpx-nested-checkbox--expanded',
                      groupRowIndex === clampedHighlighted && '__s9cmpx-nested-checkbox--is-focused',
                    )}
                    onMouseEnter={() => groupRowIndex !== undefined && setHighlighted(groupRowIndex)}
                  >
                    <div className="__s9cmpx-nested-checkbox__parent-wrapper" style={{ display: 'flex', alignItems: 'center', borderRadius: 3 }}>
                      <label
                        className="__s9cmpx-dropdown-nested-multi-select__checkbox __s9cmpx-dropdown-nested-multi-select__checkbox--parent __s9cmpx-checkbox"
                        style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', flex: 1, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleGroup(g);
                        }}
                      >
                        <span className="__s9cmpx-checkbox__container" style={{ display: 'inline-flex' }}>
                          <input
                            type="checkbox"
                            className="__s9cmpx-checkbox__input"
                            checked={all}
                            ref={(el) => {
                              if (el) el.indeterminate = some;
                            }}
                            readOnly
                          />
                        </span>
                        <span className="__s9cmpx-checkbox__label __s9cmpx-body3-short" style={{ fontWeight: 600 }}>{g.label}</span>
                        <span className="__s9cmpx-label3" style={{ marginLeft: 6, color: 'var(--__s9cmpx-static-text-weak)' }}>
                          {selCount > 0 ? `${selCount}/${g.children.length}` : g.children.length}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="__s9cmpx-nested-checkbox__expandable-wrapper"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={() => toggleExpand(g.value)}
                        style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 6, color: 'var(--__s9cmpx-static-text-weak)' }}
                      >
                        <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} />
                      </button>
                    </div>
                    {isExpanded && (
                      <ul role="group" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {g.children.map((c) => {
                          const checked = selected.includes(c.value);
                          const childRowIndex = rowIndex.get(`child:${c.value}`);
                          return (
                            <li
                              key={c.value}
                              id={childRowIndex !== undefined ? optionId(childRowIndex) : undefined}
                              role="treeitem"
                              aria-selected={checked}
                              className={cx('__s9cmpx-nested-checkbox__option-wrapper', childRowIndex === clampedHighlighted && '__s9cmpx-nested-checkbox--is-focused')}
                              onMouseEnter={() => childRowIndex !== undefined && setHighlighted(childRowIndex)}
                            >
                              <label
                                className={cx('__s9cmpx-dropdown-nested-multi-select__checkbox', '__s9cmpx-dropdown-nested-multi-select__checkbox--child', '__s9cmpx-checkbox')}
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 8px 6px 32px', cursor: c.disabled ? 'default' : 'pointer', opacity: c.disabled ? 0.5 : 1 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!c.disabled) toggleChild(c.value);
                                }}
                              >
                                <span className="__s9cmpx-checkbox__container" style={{ display: 'inline-flex' }}>
                                  <input type="checkbox" className="__s9cmpx-checkbox__input" checked={checked} disabled={c.disabled} readOnly />
                                </span>
                                <span className="__s9cmpx-checkbox__label __s9cmpx-body3-short">{c.label}</span>
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
