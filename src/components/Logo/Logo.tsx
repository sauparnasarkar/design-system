import React from 'react';
import { cx } from '../../lib/cx';

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Brand mark image source — consumer-supplied, no built-in default (white-label: this is their brand, not the design system's). */
  markSrc: string;
  /** Wordmark text, e.g. the consumer's product/company name */
  wordmark: React.ReactNode;
  /** Optional accent-colored suffix word (e.g. a product line name) */
  accent?: string;
  /** Color for `accent`, if supplied. Defaults to a neutral text token. */
  accentColor?: string;
  /** Rendered height in px */
  height?: number;
}

/** Generic brand lockup: an image mark + wordmark, with an optional accent-tinted suffix word. */
export function Logo({ markSrc, wordmark, accent, accentColor, height = 28, className, ...rest }: LogoProps) {
  return (
    <span
      role="img"
      aria-label={accent ? `${wordmark} ${accent}` : String(wordmark)}
      className={cx('__s9cmpx-logo', className)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(height * 0.3) }}
      {...rest}
    >
      <img src={markSrc} alt="" style={{ height, width: height, objectFit: 'contain', display: 'block' }} />
      <span
        className="__s9cmpx-logo__asset"
        style={{
          fontFamily: 'var(--__s9cmpx-font-families-primary)',
          fontWeight: 700,
          fontSize: height * 0.62,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: 'var(--__s9cmpx-static-text-strong, #000)',
          whiteSpace: 'nowrap',
        }}
      >
        {wordmark}
        {accent && (
          <span style={{ color: accentColor ?? 'var(--__s9cmpx-static-text-strong, #000)', fontWeight: 500, marginLeft: '0.28em' }}>{accent}</span>
        )}
      </span>
    </span>
  );
}
