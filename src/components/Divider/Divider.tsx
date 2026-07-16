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
        'sy-divider',
        vertical && 'sy-divider--vertical',
        emphasis !== 'default' && `sy-divider--${emphasis}`,
        dashed && 'sy-divider--dashed',
        className,
      )}
      {...rest}
    >
      {children && <span className="sy-divider__content sy-label3">{children}</span>}
    </div>
  );
}
