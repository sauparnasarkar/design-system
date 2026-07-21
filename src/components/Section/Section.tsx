import React from 'react';
import { cx } from '../../lib/cx';

export type SectionSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Lay children out in a row instead of a column */
  row?: boolean;
  gap?: SectionSpacing;
  padding?: SectionSpacing;
  margin?: SectionSpacing;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'start' | 'center' | 'end';
  /** Stretch to the full container width */
  fluid?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}

/** Layout wrapper (`__s9cmpx-section`) with gap/padding/margin/alignment presets. */
export function Section({
  row = false,
  gap,
  padding,
  margin,
  horizontalAlign,
  verticalAlign,
  fluid = false,
  as = 'section',
  className,
  children,
  ...rest
}: SectionProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cx(
        '__s9cmpx-section',
        row && '__s9cmpx-section--row',
        gap && `__s9cmpx-section--gap-${gap}`,
        padding && `__s9cmpx-section--padding-${padding}`,
        margin && `__s9cmpx-section--margin-${margin}`,
        horizontalAlign && horizontalAlign !== 'start' && `__s9cmpx-section--horizontal-align-${horizontalAlign}`,
        verticalAlign && verticalAlign !== 'start' && `__s9cmpx-section--vertical-align-${verticalAlign}`,
        fluid && '__s9cmpx-section--fluid',
        className,
      )}
      style={{ display: 'flex', flexDirection: row ? 'row' : 'column' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
