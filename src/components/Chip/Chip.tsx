import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Selected state (1.5px active ring) */
  active?: boolean;
  /** Filled gray style instead of outlined */
  grey?: boolean;
  /** Show a remove button inside the chip */
  onRemove?: () => void;
  onClick?: () => void;
  children?: React.ReactNode;
}

/** Pill-shaped filter chip (as used in the Reports/Advanced Search filter bars). */
export function Chip({ active = false, grey = false, onRemove, onClick, disabled, className, children, ...rest }: ChipProps) {
  return (
    <span className={cx('__s9cmpx-chip', grey && '__s9cmpx-chip--color-grey', className)}>
      <button
        type="button"
        className={cx('__s9cmpx-chip__item', active && '__s9cmpx-chip__item--active', '__s9cmpx-label2')}
        disabled={disabled}
        onClick={onClick}
        aria-pressed={active}
        style={onRemove ? { position: 'relative', paddingRight: 32 } : undefined}
        {...rest}
      >
        {children}
        {onRemove && (
          <span
            role="button"
            aria-label="Remove"
            className="__s9cmpx-chip__remove-btn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <Icon name="close" size={14} />
          </span>
        )}
      </button>
    </span>
  );
}
