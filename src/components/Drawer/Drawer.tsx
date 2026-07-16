import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface DrawerProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  /** Secondary row under the header (filters, tabs, …) */
  subheader?: React.ReactNode;
  footer?: React.ReactNode;
  /** Panel width; the vendor default is 550px */
  width?: number | string;
  /** Render in place (position static) instead of fixed to the right edge */
  embedded?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/** Right-hand slide-in panel (`sy-drawer`), as used for notification and detail panes. */
export function Drawer({
  open,
  onClose,
  title,
  subheader,
  footer,
  width = 550,
  embedded = false,
  children,
  className,
}: DrawerProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const widthValue = typeof width === 'number' ? `${width}px` : width;
  return (
    <div
      className={cx('sy-drawer', open && 'sy-drawer--open', embedded && 'sy-drawer--embedded', className)}
      style={
        {
          '--sy-c-drawer-width': widthValue,
          ...(embedded ? { position: 'static', height: '100%', transform: 'none', visibility: 'visible' } : null),
        } as React.CSSProperties
      }
      role="dialog"
      aria-hidden={!open}
    >
      <div className="sy-drawer__content">
        {(title || onClose) && (
          <div className="sy-drawer-header">
            <h2 className="sy-headline6" style={{ margin: 0 }}>{title}</h2>
            {onClose && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 0, color: 'inherit' }}
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        )}
        {subheader && <div className="sy-drawer-subheader">{subheader}</div>}
        <div className="sy-drawer-body sy-body3-long">{children}</div>
        {footer && <div className="sy-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
