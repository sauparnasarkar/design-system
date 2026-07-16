import React from 'react';
import { cx } from '../../lib/cx';

export type TileSize = 'none' | 'small' | 'medium' | 'default';

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding preset; default is 16px */
  size?: TileSize;
  /** Gray background variant */
  secondary?: boolean;
  /** Hover/pressed affordances */
  interactive?: boolean;
  disabled?: boolean;
  fullHeight?: boolean;
  children?: React.ReactNode;
}

export function Tile({
  size = 'default',
  secondary = false,
  interactive = false,
  disabled = false,
  fullHeight = false,
  className,
  children,
  ...rest
}: TileProps) {
  return (
    <div
      className={cx(
        'sy-tile',
        size !== 'default' && `sy-tile--${size}`,
        secondary && 'sy-tile--secondary',
        interactive && 'sy-tile--interactive',
        disabled && 'sy-tile--disabled',
        fullHeight && 'sy-tile--full-height',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
