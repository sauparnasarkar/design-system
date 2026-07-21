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
        '__s9cmpx-tile',
        size !== 'default' && `__s9cmpx-tile--${size}`,
        secondary && '__s9cmpx-tile--secondary',
        interactive && '__s9cmpx-tile--interactive',
        disabled && '__s9cmpx-tile--disabled',
        fullHeight && '__s9cmpx-tile--full-height',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
