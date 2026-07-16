import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error';

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  default: 'info',
  success: 'check',
  warning: 'warning',
  error: 'error',
};

export interface ToastProps {
  variant?: ToastVariant;
  /** Multi-line layout with bottom-right actions */
  long?: boolean;
  /** Action buttons (e.g. Undo) */
  actions?: React.ReactNode;
  /** Hide the close button */
  withoutCloseIcon?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * The products render toasts through react-toastify; the vendor CSS targets
 * `.Toastify__toast--<variant>` wrappers, so this component reproduces that
 * DOM. Base react-toastify box styles (padding/shadow) are inlined.
 */
export function Toast({
  variant = 'default',
  long = false,
  actions,
  withoutCloseIcon = false,
  onClose,
  children,
  className,
}: ToastProps) {
  return (
    <div className="Toastify">
      <div className="Toastify__toast-container" style={{ position: 'static', width: 'fit-content' }}>
        <div
          role="status"
          className={cx('Toastify__toast', `Toastify__toast--${variant}`, className)}
          style={{
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.16)',
            minHeight: 48,
            padding: '12px 16px',
            paddingRight: withoutCloseIcon ? 16 : 40,
            position: 'relative',
            width: 'fit-content',
            maxWidth: 560,
          }}
        >
          <div className={cx('sy-toast', long && 'sy-toast--long', withoutCloseIcon && 'sy-toast--without-close-icon')}>
            <div className={cx('sy-toast__wrapper', !actions && 'sy-toast__wrapper--without-buttons')} style={{ display: 'flex', alignItems: long ? 'flex-start' : 'center', gap: 8 }}>
              <span className="sy-toast__icon" style={{ display: 'inline-flex', flexShrink: 0 }}>
                <Icon name={VARIANT_ICON[variant]} size={16} />
              </span>
              <span className="sy-toast__text sy-body3-short">{children}</span>
            </div>
            {actions && (
              <div className={cx('sy-toast__button-wrapper', !withoutCloseIcon && 'sy-toast__button-wrapper--with-close-button')} style={{ display: 'flex', gap: 8 }}>
                {actions}
              </div>
            )}
          </div>
          {!withoutCloseIcon && (
            <span className={cx('sy-toast__close-button-wrapper', 'sy-toast__close-button-wrapper--top')}>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                style={{ background: 'none', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 0 }}
              >
                <span className="sy-toast__close-button-icon" style={{ display: 'inline-flex' }}>
                  <Icon name="close" size={14} />
                </span>
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
