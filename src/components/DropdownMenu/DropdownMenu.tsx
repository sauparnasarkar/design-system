import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

export type DropdownMenuSize = 'small' | 'medium' | 'large';

export interface DropdownMenuItem {
  id: string;
  label: React.ReactNode;
  icon?: IconName;
  disabled?: boolean;
  /** Render a divider above this item */
  dividerBefore?: boolean;
}

export interface DropdownMenuProps {
  /** The element that toggles the menu */
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  items: DropdownMenuItem[];
  onSelect?: (id: string) => void;
  size?: DropdownMenuSize;
  withBorder?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  onSelect,
  size = 'medium',
  withBorder = true,
  header,
  footer,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {React.cloneElement(trigger, { onClick: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={cx('__s9cmpx-dropdown-menu', `__s9cmpx-dropdown-menu--${size}`, withBorder && '__s9cmpx-dropdown-menu--with-border', className)}
          style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 20, minWidth: 200 }}
        >
          <div className="__s9cmpx-dropdown-menu__list">
            {header && <div className="__s9cmpx-dropdown-menu__list-header __s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)' }}>{header}</div>}
            <div className="__s9cmpx-dropdown-menu__list-content" role="menu">
              {items.map((item) => (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && <hr className="__s9cmpx-dropdown-menu__divider" style={{ border: 0, height: 1 }} />}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    className="__s9cmpx-dropdown-menu__list-item __s9cmpx-body3-short"
                    onClick={() => {
                      onSelect?.(item.id);
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      background: 'none',
                      border: 0,
                      borderRadius: 3,
                      cursor: item.disabled ? 'default' : 'pointer',
                      color: item.disabled ? 'var(--__s9cmpx-static-text-weak)' : 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    {item.icon && <Icon name={item.icon} size={16} />}
                    {item.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
            {footer && <div className="__s9cmpx-dropdown-menu__list-footer">{footer}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
