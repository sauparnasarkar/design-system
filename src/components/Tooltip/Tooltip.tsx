import React from 'react';
import { cx } from '../../lib/cx';

export type TooltipVariant = 'dark' | 'light' | 'alert' | 'warning' | 'hint';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Main tooltip text */
  label: React.ReactNode;
  /** Bold heading above the label */
  header?: React.ReactNode;
  /** Muted secondary line */
  description?: React.ReactNode;
  variant?: TooltipVariant;
  placement?: TooltipPlacement;
  /** Element the tooltip is attached to */
  children: React.ReactElement;
}

const OFFSET = 8;

const PLACEMENT_STYLE: Record<TooltipPlacement, React.CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: OFFSET },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: OFFSET },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: OFFSET },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: OFFSET },
};

export function Tooltip({
  label,
  header,
  description,
  variant = 'dark',
  placement = 'top',
  children,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          data-placement={placement}
          className={cx('sy-tooltip', `sy-tooltip--${variant}`)}
          style={{
            position: 'absolute',
            zIndex: 20,
            width: 'max-content',
            maxWidth: 280,
            padding: '8px 6px 8px 8px',
            ...PLACEMENT_STYLE[placement],
          }}
        >
          {header && <span className="sy-tooltip__header sy-label3" style={{ display: 'block', fontWeight: 600 }}>{header}</span>}
          <span className="sy-tooltip__label sy-label3" style={{ display: 'block' }}>{label}</span>
          {description && <span className="sy-tooltip__description sy-label3" style={{ display: 'block' }}>{description}</span>}
        </span>
      )}
    </span>
  );
}
