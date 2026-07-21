import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface ContactAction {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ContactItemProps {
  /** Person's name */
  headline: React.ReactNode;
  /** Role / region line */
  subHeader?: React.ReactNode;
  /** Photo source; initials placeholder is shown when omitted */
  photoSrc?: string;
  /** Name used for the placeholder initials (defaults to headline when it is a string) */
  placeholderName?: string;
  /** Icon actions in the footer, separated by dividers (e.g. mail, phone) */
  actions?: ContactAction[];
  /** Extra footer text (e.g. phone number) */
  footerText?: React.ReactNode;
  className?: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Analyst/contact card (`__s9cmpx-contact-item`): centered photo, name, role, icon footer. */
export function ContactItem({
  headline,
  subHeader,
  photoSrc,
  placeholderName,
  actions = [],
  footerText,
  className,
}: ContactItemProps) {
  const name = placeholderName ?? (typeof headline === 'string' ? headline : '');
  return (
    <div className={cx('__s9cmpx-contact-item', className)}>
      {photoSrc ? (
        <img className="__s9cmpx-contact-item__photo" src={photoSrc} alt={name} style={{ width: 112, aspectRatio: '1 / 1', objectFit: 'cover' }} />
      ) : (
        <div className="__s9cmpx-contact-item__photo-placeholder __s9cmpx-headline5" aria-hidden="true">
          {initials(name)}
        </div>
      )}
      <div className="__s9cmpx-contact-item__headline __s9cmpx-headline7">{headline}</div>
      {subHeader && <div className="__s9cmpx-contact-item__sub-header __s9cmpx-body4">{subHeader}</div>}
      {(actions.length > 0 || footerText) && (
        <div className="__s9cmpx-contact-item__footer">
          {actions.map((a, i) => {
            const Btn = (a.href ? 'a' : 'button') as React.ElementType;
            return (
              <React.Fragment key={a.label}>
                {i > 0 && <span className="__s9cmpx-contact-item__footer-separator" />}
                <Btn
                  className="__s9cmpx-contact-item__footer-icon"
                  aria-label={a.label}
                  title={a.label}
                  href={a.href}
                  onClick={a.onClick}
                  {...(a.href ? null : { type: 'button' })}
                  style={{ border: 0 }}
                >
                  <Icon name={a.icon} size={18} />
                </Btn>
              </React.Fragment>
            );
          })}
          {footerText && (
            <>
              {actions.length > 0 && <span className="__s9cmpx-contact-item__footer-separator" />}
              <span className="__s9cmpx-contact-item__footer-text __s9cmpx-label3">{footerText}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
