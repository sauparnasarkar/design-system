import React from 'react';
import { cx } from '../../lib/cx';

export type AvatarSize = 'small' | 'default' | 'large' | 'xlarge';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Full name; initials are derived when no image is given */
  name?: string;
  /** Image source; takes precedence over initials */
  src?: string;
  size?: AvatarSize;
  /** Gray background variant */
  gray?: boolean;
  bordered?: boolean;
  /** 3px corners instead of a circle */
  square?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function Avatar({
  name = '',
  src,
  size = 'default',
  gray = false,
  bordered = false,
  square = false,
  className,
  ...rest
}: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={name || 'Avatar'}
      className={cx(
        'sy-avatar',
        size !== 'default' && `sy-avatar--${size}`,
        gray && 'sy-avatar--gray',
        bordered && 'sy-avatar--bordered',
        square && 'sy-avatar--square',
        className,
      )}
      {...rest}
    >
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(name)}
    </div>
  );
}
