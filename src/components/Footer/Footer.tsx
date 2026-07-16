import React from 'react';
import { cx } from '../../lib/cx';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  copyright?: React.ReactNode;
  links?: Array<{ label: React.ReactNode; href: string }>;
}

export function Footer({
  copyright = 'Copyright 2026 Syena Systems.',
  links = [{ label: 'Policies', href: '#' }],
  className,
  ...rest
}: FooterProps) {
  return (
    <footer
      className={cx('sy-footer', className)}
      {...rest}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderTop: '1px solid var(--sy-static-divider-standard, rgba(31,31,31,0.16))' }}
    >
      <p className="sy-body4" style={{ margin: 0, color: 'var(--sy-static-text-weak)' }}>{copyright}</p>
      {links.map((l, i) => (
        <a key={i} className="sy-link sy-link--default sy-link2" href={l.href}>
          {l.label}
        </a>
      ))}
    </footer>
  );
}
