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
  className?: string;
}

/** Checkbox-list multi select (`__s9cmpx-dropdown-multi-select`), selected values shown as removable tags. */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'medium',
  error = false,
  disabled = false,
  label,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>([]);
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = value ?? internal;
  const labelId = React.useId();
  const listboxId = React.useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Land on the first non-disabled option whenever the menu opens, so arrow-key
  // navigation and aria-activedescendant have a sane starting point.
  React.useEffect(() => {
    if (!open) return;
    const firstEnabled = options.findIndex((o) => !o.disabled);
    setHighlighted(firstEnabled === -1 ? 0 : firstEnabled);
  }, [open, options]);

  const commit = (next: string[]) => {
    setInternal(next);
    onChange?.(next);
  };
  const toggle = (v: string) =>
    commit(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const moveHighlight = (delta: number) => {
    if (options.length === 0) return;
    let next = highlighted;
    for (let i = 0; i < options.length; i++) {
      next = (next + delta + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    setHighlighted(next);
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
          aria-activedescendant={open ? optionId(highlighted) : undefined}
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!open) {
                setOpen(true);
              } else {
                const opt = options[highlighted];
                if (opt && !opt.disabled) toggle(opt.value);
              }
              return;
            }
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              if (!open) setOpen(true);
              else moveHighlight(1);
              return;
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              if (!open) setOpen(true);
              else moveHighlight(-1);
            }
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
            <ul id={listboxId} className="__s9cmpx-dropdown-multi-select__menu-list" role="listbox" aria-multiselectable="true" style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 240, overflowY: 'auto' }}>
              {options.map((o, i) => {
                const isSel = selected.includes(o.value);
                return (
                  <li
                    key={o.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSel}
                    className={cx(
                      '__s9cmpx-dropdown-multi-select__option',
                      isSel && '__s9cmpx-dropdown-multi-select__option--is-selected',
                      i === highlighted && '__s9cmpx-dropdown-multi-select__option--is-focused',
                      o.disabled && '__s9cmpx-dropdown-multi-select__option--is-disabled',
                    )}
                    onClick={() => !o.disabled && toggle(o.value)}
                    onMouseEnter={() => setHighlighted(i)}
                    style={{ cursor: o.disabled ? 'default' : 'pointer' }}
                  >
                    <label className="__s9cmpx-dropdown-multi-select__checkbox __s9cmpx-checkbox" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <span className="__s9cmpx-checkbox__container" style={{ display: 'inline-flex' }}>
                        <input type="checkbox" className="__s9cmpx-checkbox__input" checked={isSel} disabled={o.disabled} readOnly />
                      </span>
                      <span className="__s9cmpx-checkbox__label __s9cmpx-body3-short">{o.label}</span>
                    </label>
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
