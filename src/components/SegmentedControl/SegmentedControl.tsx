import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type SegmentedControlSize = 'small' | 'medium';

export interface SegmentedControlItem {
  value: string;
  label?: React.ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: SegmentedControlSize;
  /** Icon-only square segments */
  square?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function SegmentedControl({
  items,
  value,
  onChange,
  size = 'medium',
  square = false,
  fullWidth = false,
  disabled = false,
  name = 'sy-segmented-control',
  className,
}: SegmentedControlProps) {
  const [internal, setInternal] = React.useState(items[0]?.value);
  const active = value ?? internal;
  return (
    <div
      className={cx(
        'sy-segmented-control',
        `sy-segmented-control--${size}`,
        square && 'sy-segmented-control--square',
        fullWidth && 'sy-segmented-control--full-width',
        disabled && 'sy-segmented-control--disabled',
        className,
      )}
      role="radiogroup"
    >
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <label
            key={item.value}
            className={cx('sy-segmented-control__item', isActive && 'sy-segmented-control--active')}
          >
            <input
              type="radio"
              className="sy-segmented-control__item-input"
              name={name}
              value={item.value}
              checked={isActive}
              disabled={disabled || item.disabled}
              onChange={() => {
                setInternal(item.value);
                onChange?.(item.value);
              }}
            />
            <span className="sy-segmented-control__item-content">
              {item.icon && (
                <span className="sy-segmented-control__item-content__icon">
                  <Icon name={item.icon} size={size === 'small' ? 14 : 16} />
                </span>
              )}
              {item.label && (
                <span className="sy-segmented-control__item-content__label">{item.label}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
