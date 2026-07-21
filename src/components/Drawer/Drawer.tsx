import React from 'react';
import { cx } from '../../lib/cx';
import { useFocusTrap } from '../../lib/useFocusTrap';
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

/** Right-hand slide-in panel (`__s9cmpx-drawer`), as used for notification and detail panes. */
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

  // `embedded` is a permanently-visible, docked-inline rendering (position: static,
  // forced visible regardless of `open`) — not a true modal overlay, so none of the
  // modal-dialog behaviors (focus trap, inert-when-closed, aria-modal) apply to it.
  const dialogRef = useFocusTrap<HTMLDivElement>(open && !embedded);
  const titleId = React.useId();

  const widthValue = typeof width === 'number' ? `${width}px` : width;
  return (
    <div
      ref={dialogRef}
      className={cx('__s9cmpx-drawer', open && '__s9cmpx-drawer--open', embedded && '__s9cmpx-drawer--embedded', className)}
      style={
        {
          '--__s9cmpx-c-drawer-width': widthValue,
          ...(embedded ? { position: 'static', height: '100%', transform: 'none', visibility: 'visible' } : null),
        } as React.CSSProperties
      }
      role="dialog"
      aria-modal={embedded ? undefined : true}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={embedded ? undefined : !open}
      // Slides off-screen via CSS transform rather than unmounting (for the transition),
      // so its buttons/inputs would otherwise stay in the tab order while invisible —
      // `inert` removes them from focus/AT entirely while closed, same as unmounting would.
      inert={embedded ? undefined : !open}
      tabIndex={-1}
    >
      <div className="__s9cmpx-drawer__content">
        {(title || onClose) && (
          <div className="__s9cmpx-drawer-header">
            <h2 id={titleId} className="__s9cmpx-headline6" style={{ margin: 0 }}>{title}</h2>
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
        {subheader && <div className="__s9cmpx-drawer-subheader">{subheader}</div>}
        <div className="__s9cmpx-drawer-body __s9cmpx-body3-long">{children}</div>
        {footer && <div className="__s9cmpx-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
