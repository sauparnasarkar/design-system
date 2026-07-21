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
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  // Roving tabindex (APG tabs pattern): only the active tab (or, if none is active, the
  // first enabled one) sits in the Tab order; Arrow/Home/End move focus + selection
  // together between the remaining enabled tabs.
  const activeIndex = items.findIndex((i) => i.id === active);
  const firstEnabledIndex = items.findIndex((i) => !i.disabled);
  const tabStopIndex = activeIndex !== -1 && !items[activeIndex].disabled ? activeIndex : firstEnabledIndex;

  const focusAndSelect = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    select(item.id);
    tabRefs.current[index]?.focus();
  };

  const moveFocus = (from: number, delta: number) => {
    if (items.length === 0) return;
    let next = from;
    for (let i = 0; i < items.length; i++) {
      next = (next + delta + items.length) % items.length;
      if (!items[next].disabled) break;
    }
    focusAndSelect(next);
  };

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
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          role="tab"
          type="button"
          tabIndex={i === tabStopIndex ? 0 : -1}
          aria-selected={active === item.id}
          disabled={item.disabled}
          className={cx(
            '__s9cmpx-tab',
            `__s9cmpx-tab--${size}`,
            active === item.id && '__s9cmpx-tab--active',
            item.disabled && '__s9cmpx-tab--disabled',
            lastItemRightAligned && i === items.length - 1 && '__s9cmpx-tab--last',
          )}
          onClick={() => select(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              moveFocus(i, 1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              moveFocus(i, -1);
            } else if (e.key === 'Home') {
              e.preventDefault();
              moveFocus(-1, 1);
            } else if (e.key === 'End') {
              e.preventDefault();
              moveFocus(0, -1);
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
