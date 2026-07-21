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
  className?: string;
}

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
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string | undefined>(undefined);
  const [highlighted, setHighlighted] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = value ?? internal;
  const selectedOption = options.find((o) => o.value === selected);
  const labelId = React.useId();
  const listboxId = React.useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Land on the selected option (or the first enabled one) whenever the menu
  // opens, so arrow-key navigation and aria-activedescendant have a sane start.
  React.useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((o) => o.value === selected);
    if (selectedIndex !== -1) {
      setHighlighted(selectedIndex);
      return;
    }
    const firstEnabled = options.findIndex((o) => !o.disabled);
    setHighlighted(firstEnabled === -1 ? 0 : firstEnabled);
  }, [open, options, selected]);

  const commit = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };

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
          aria-activedescendant={open ? optionId(highlighted) : undefined}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!open) {
                setOpen(true);
              } else {
                const opt = options[highlighted];
                if (opt && !opt.disabled) {
                  commit(opt.value);
                  setOpen(false);
                }
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
            <ul id={listboxId} className="__s9cmpx-select__menu-list" role="listbox" aria-labelledby={label ? labelId : undefined} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {options.map((o, i) => (
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
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
