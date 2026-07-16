import React from 'react';
import { cx } from '../../lib/cx';
import mark from '../../assets/logos/syena-mark.png';

export type LogoProduct = 'default' | 'green' | 'blue' | 'analytics';

const PRODUCT_WORD: Record<LogoProduct, string | null> = {
  default: null,
  green: 'Green',
  blue: 'Blue',
  analytics: 'Analytics',
};

const PRODUCT_COLOR: Record<LogoProduct, string> = {
  default: 'var(--sy-static-text-strong, #000)',
  green: 'var(--sy-color-teal-600, #187272)',
  blue: 'var(--sy-color-blue-600, #1c5ece)',
  // Analytics theme cyan, darkened for light surfaces (fixed, so the lockup reads the same outside the theme)
  analytics: '#1d84a3',
};

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which Syena product lockup to show */
  product?: LogoProduct;
  /** Rendered height in px */
  height?: number;
}

/** Syena lockup: the eagle mark (official 2026 logo) + "Syena" wordmark, with an accent-tinted product word. */
export function Logo({ product = 'default', height = 28, className, ...rest }: LogoProps) {
  const word = PRODUCT_WORD[product];
  return (
    <span
      role="img"
      aria-label={word ? `Syena ${word}` : 'Syena'}
      className={cx('sy-logo', className)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(height * 0.3) }}
      {...rest}
    >
      <img src={mark} alt="" style={{ height, width: height, objectFit: 'contain', display: 'block' }} />
      <span
        className="sy-logo__asset"
        style={{
          fontFamily: 'var(--sy-font-families-primary)',
          fontWeight: 700,
          fontSize: height * 0.62,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: 'var(--sy-static-text-strong, #000)',
          whiteSpace: 'nowrap',
        }}
      >
        Syena
        {word && (
          <span style={{ color: PRODUCT_COLOR[product], fontWeight: 500, marginLeft: '0.28em' }}>{word}</span>
        )}
      </span>
    </span>
  );
}
