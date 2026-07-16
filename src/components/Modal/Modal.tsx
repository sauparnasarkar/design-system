import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  /** Max width 360px instead of 562px */
  small?: boolean;
  /** Align the dialog to the top of the viewport */
  overlayTop?: boolean;
  /** Footer actions (buttons); right-aligned */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  small = false,
  overlayTop = false,
  actions,
  children,
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className={cx('sy-modal__overlay', overlayTop && 'sy-modal__overlay--top')}
      style={{ backgroundColor: 'var(--sy-static-background-backdrop, rgba(0,0,0,0.4))', padding: 16 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cx('sy-modal', small && 'sy-modal--small', className)}
      >
        {(title || onClose) && (
          <div className="sy-modal__dialog-header-wrapper">
            <div className="sy-modal__heading-wrapper-text">
              <h2 className="sy-headline6" style={{ margin: 0 }}>{title}</h2>
            </div>
            {onClose && (
              <button
                type="button"
                className="sy-modal__close-icon"
                aria-label="Close"
                onClick={onClose}
                style={{ border: 0, display: 'inline-flex' }}
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        )}
        <div className="sy-modal__content sy-body3-long">{children}</div>
        {actions && (
          <div className="sy-modal__actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
