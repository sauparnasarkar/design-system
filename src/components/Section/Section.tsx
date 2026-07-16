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

/** Layout wrapper (`sy-section`) with gap/padding/margin/alignment presets. */
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
        'sy-section',
        row && 'sy-section--row',
        gap && `sy-section--gap-${gap}`,
        padding && `sy-section--padding-${padding}`,
        margin && `sy-section--margin-${margin}`,
        horizontalAlign && horizontalAlign !== 'start' && `sy-section--horizontal-align-${horizontalAlign}`,
        verticalAlign && verticalAlign !== 'start' && `sy-section--vertical-align-${verticalAlign}`,
        fluid && 'sy-section--fluid',
        className,
      )}
      style={{ display: 'flex', flexDirection: row ? 'row' : 'column' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
