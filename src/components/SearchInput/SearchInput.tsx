import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** "classic" is the compact field; "full" is the header-width variant */
  variant?: 'classic' | 'full';
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export function SearchInput({
  variant = 'classic',
  placeholder = 'Search…',
  value,
  onChange,
  onClear,
  className,
  ...rest
}: SearchInputProps) {
  const [internal, setInternal] = React.useState('');
  const current = value !== undefined ? String(value) : internal;
  return (
    <div className={cx('__s9cmpx-search-input', `__s9cmpx-search-input--${variant}`, className)}>
      <div
        className="__s9cmpx-search-input__control"
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
      >
        <Icon name="search" size={16} style={{ color: 'var(--__s9cmpx-static-text-weak)', flexShrink: 0 }} />
        <input
          type="search"
          role="combobox"
          aria-expanded={false}
          className="__s9cmpx-search-input__input __s9cmpx-body3-short"
          placeholder={placeholder}
          value={current}
          onChange={(e) => {
            setInternal(e.target.value);
            onChange?.(e.target.value);
          }}
          style={{ border: 0, outline: 'none', background: 'transparent', flex: 1 }}
          {...rest}
        />
        {current && (
          <button
            type="button"
            className="__s9cmpx-search-input__clear-indicator"
            aria-label="Clear search"
            onClick={() => {
              setInternal('');
              onClear?.();
              onChange?.('');
            }}
            style={{ display: 'inline-flex', background: 'none', border: 0, cursor: 'pointer', color: 'var(--__s9cmpx-static-text-weak)' }}
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
