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
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string | undefined>(undefined);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = value ?? internal;
  const selectedOption = options.find((o) => o.value === selected);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className={className} ref={rootRef} style={{ position: 'relative', width: 'fit-content', minWidth: 200 }}>
      {label && <span className="sy-label3" style={{ display: 'block', marginBottom: 4 }}>{label}</span>}
      <div
        className={cx(
          'sy-select',
          borderless ? 'sy-select--borderless' : 'sy-select--default',
          `sy-select--${size}`,
          error && 'sy-select--error',
          disabled && 'sy-select--is-disabled',
        )}
      >
        <button
          type="button"
          className={cx('sy-select__control', open && 'sy-select__control--is-focused', disabled && 'sy-select__control--is-disabled')}
          style={{ width: '100%' }}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          {selectedOption ? (
            <span className="sy-select__single-value sy-body3-short">{selectedOption.label}</span>
          ) : (
            <span className="sy-select__placeholder sy-body3-short">{placeholder}</span>
          )}
          <span className="sy-select__indicators">
            <span className="sy-select__dropdown-indicator">
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
            </span>
          </span>
        </button>
        {open && (
          <div className={cx('sy-select__menu', `sy-select__menu--${size}`, 'sy-select__menu--open')} style={{ position: 'absolute', zIndex: 10, left: 0, right: 0 }}>
            <ul className="sy-select__menu-list" role="listbox" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {options.map((o) => (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={selected === o.value}
                  className={cx(
                    'sy-select__option',
                    'sy-body3-short',
                    selected === o.value && 'sy-select__option--is-selected',
                    o.disabled && 'sy-select__option--is-disabled',
                  )}
                  onClick={() => {
                    if (o.disabled) return;
                    setInternal(o.value);
                    onChange?.(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="sy-select__option-label">{o.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
