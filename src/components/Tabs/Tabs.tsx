import React from 'react';
import { cx } from '../../lib/cx';

export type TabsVariant = 'primary' | 'secondary' | 'tertiary' | 'chips';
export type TabsSize = 'small' | 'large';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active tab id */
  activeId?: string;
  onChange?: (id: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  /** Push the last tab to the right edge (used e.g. for a cross-sell tab) */
  lastItemRightAligned?: boolean;
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  variant = 'primary',
  size = 'large',
  lastItemRightAligned = false,
  className,
}: TabsProps) {
  const [internal, setInternal] = React.useState(items[0]?.id);
  const active = activeId ?? internal;
  return (
    <div
      role="tablist"
      className={cx(
        '__s9cmpx-tabs',
        `__s9cmpx-tabs--${variant}`,
        lastItemRightAligned && '__s9cmpx-tabs--last-item-right-alignment',
        className,
      )}
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={active === item.id}
          disabled={item.disabled}
          className={cx(
            '__s9cmpx-tab',
            `__s9cmpx-tab--${size}`,
            active === item.id && '__s9cmpx-tab--active',
            item.disabled && '__s9cmpx-tab--disabled',
            lastItemRightAligned && i === items.length - 1 && '__s9cmpx-tab--last',
          )}
          onClick={() => {
            setInternal(item.id);
            onChange?.(item.id);
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
