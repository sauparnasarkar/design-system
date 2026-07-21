import React from 'react';
import { cx } from '../../lib/cx';

export type TypographyStyle =
  | 'display1' | 'display2'
  | 'headline1' | 'headline2' | 'headline3' | 'headline4' | 'headline5' | 'headline6' | 'headline7' | 'headline8'
  | 'body1' | 'body2' | 'body3-long' | 'body3-short' | 'body4'
  | 'label1' | 'label2' | 'label3';

export type TypographyColor =
  | 'standard' | 'strong' | 'weak'
  | 'inverse-standard' | 'inverse-strong' | 'inverse-weak'
  | 'info' | 'positive' | 'negative' | 'notice' | 'neutral';

export type TypographyWeight = 'regular' | 'semi' | 'bold' | 'heavy';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify' | 'inherit';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Type style from the fg scale */
  variant?: TypographyStyle;
  color?: TypographyColor;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  /** Rendered element; defaults to a sensible tag for the variant */
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}

const DEFAULT_TAG: Partial<Record<TypographyStyle, keyof React.JSX.IntrinsicElements>> = {
  display1: 'h1', display2: 'h1',
  headline1: 'h1', headline2: 'h2', headline3: 'h3', headline4: 'h4',
  headline5: 'h5', headline6: 'h6', headline7: 'h6', headline8: 'h6',
  body1: 'p', body2: 'p', 'body3-long': 'p', 'body3-short': 'p', body4: 'p',
  label1: 'span', label2: 'span', label3: 'span',
};

export function Typography({
  variant = 'body3-long',
  color,
  weight,
  align,
  as,
  className,
  children,
  ...rest
}: TypographyProps) {
  const Tag = (as ?? DEFAULT_TAG[variant] ?? 'span') as React.ElementType;
  return (
    <Tag
      className={cx(
        '__s9cmpx-typography',
        `__s9cmpx-${variant}`,
        color && `__s9cmpx-typography--color-${color}`,
        weight && `__s9cmpx-typography--weight-${weight}`,
        align && `__s9cmpx-typography--align-${align}`,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
