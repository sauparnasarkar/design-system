import React from 'react';
import { cx } from '../../lib/cx';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  /** Emphasis relative to the standard divider color */
  emphasis?: 'weak' | 'default' | 'strong';
  dashed?: boolean;
  /** Centered label rendered inside the rule */
  children?: React.ReactNode;
}

export function Divider({ vertical = false, emphasis = 'default', dashed = false, className, children, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cx(
        '__s9cmpx-divider',
        vertical && '__s9cmpx-divider--vertical',
        emphasis !== 'default' && `__s9cmpx-divider--${emphasis}`,
        dashed && '__s9cmpx-divider--dashed',
        className,
      )}
      {...rest}
    >
      {children && <span className="__s9cmpx-divider__content __s9cmpx-label3">{children}</span>}
    </div>
  );
}
