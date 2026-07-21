import React from 'react';
import { cx } from '../../lib/cx';

export type LinkVariant = 'default' | 'blue' | 'inline' | 'button';
export type LinkSize = 1 | 2;

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  /** __s9cmpx-link1 (16px) or __s9cmpx-link2 (14px) type style */
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
        '__s9cmpx-link',
        `__s9cmpx-link--${variant}`,
        `__s9cmpx-link${size}`,
        hasVisited && '__s9cmpx-link--has-visited',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
