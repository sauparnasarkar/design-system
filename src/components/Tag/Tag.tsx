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
    <span className={cx('sy-tags__container', `sy-tags__container--${color}`, className)} {...rest}>
      <span
        className={cx(
          'sy-tags',
          `sy-tags--${size}`,
          clickable && 'sy-tags--clickable',
          removable && 'sy-tags--with-removable-btn',
        )}
      >
        <span className="sy-tags__label sy-label3">{children}</span>
      </span>
      {removable && (
        <button
          type="button"
          className="sy-tags__remove-button"
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
