import React from 'react';
import { cx } from '../../lib/cx';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Copyright text — no default, since this is white-label consumer branding, not the design system's own. */
  copyright: React.ReactNode;
  links?: Array<{ label: React.ReactNode; href: string }>;
}

export function Footer({
  copyright,
  links = [{ label: 'Policies', href: '#' }],
  className,
  ...rest
}: FooterProps) {
  return (
    <footer
      className={cx('__s9cmpx-footer', className)}
      {...rest}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderTop: '1px solid var(--__s9cmpx-static-divider-standard, rgba(31,31,31,0.16))' }}
    >
      <p className="__s9cmpx-body4" style={{ margin: 0, color: 'var(--__s9cmpx-static-text-weak)' }}>{copyright}</p>
      {links.map((l, i) => (
        <a key={i} className="__s9cmpx-link __s9cmpx-link--default __s9cmpx-link2" href={l.href}>
          {l.label}
        </a>
      ))}
    </footer>
  );
}
