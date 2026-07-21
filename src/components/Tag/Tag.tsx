import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type TagColor = 'grey' | 'blue' | 'green' | 'red' | 'yellow' | 'white';
export type TagSize = 'small' | 'medium' | 'large';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: TagColor;
  size?: TagSize;
  /** Show a remove ("x") button and call onRemove when pressed */
  onRemove?: () => void;
  /** Whole tag is clickable */
  clickable?: boolean;
  children?: React.ReactNode;
}

export function Tag({
  color = 'grey',
  size = 'medium',
  onRemove,
  clickable = false,
  className,
  children,
  ...rest
}: TagProps) {
  const removable = Boolean(onRemove);
  return (
    <span className={cx('__s9cmpx-tags__container', `__s9cmpx-tags__container--${color}`, className)} {...rest}>
      <span
        className={cx(
          '__s9cmpx-tags',
          `__s9cmpx-tags--${size}`,
          clickable && '__s9cmpx-tags--clickable',
          removable && '__s9cmpx-tags--with-removable-btn',
        )}
      >
        <span className="__s9cmpx-tags__label __s9cmpx-label3">{children}</span>
      </span>
      {removable && (
        <button
          type="button"
          className="__s9cmpx-tags__remove-button"
          aria-label="Remove"
          onClick={onRemove}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" size={size === 'small' ? 12 : 14} />
        </button>
      )}
    </span>
  );
}
