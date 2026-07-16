import React from 'react';
import { cx } from '../../lib/cx';

export type LinkVariant = 'default' | 'blue' | 'inline' | 'button';
export type LinkSize = 1 | 2;

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  /** sy-link1 (16px) or sy-link2 (14px) type style */
  size?: LinkSize;
  /** Show the visited state color */
  hasVisited?: boolean;
  children?: React.ReactNode;
}

export function Link({
  variant = 'blue',
  size = 2,
  hasVisited = false,
  className,
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      className={cx(
        'sy-link',
        `sy-link--${variant}`,
        `sy-link${size}`,
        hasVisited && 'sy-link--has-visited',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
