import React from 'react';
import { cx } from '../../lib/cx';

export type TabsVariant = 'primary' | 'secondary' | 'tertiary' | 'chips';
export type TabsSize = 'small' | 'large';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  /** Native `title` attribute shown on hover -- same convention as SegmentedControlItem's own
   * `tooltip`, deliberately a plain title rather than the richer Tooltip component (no layout
   * measurement to break here, but kept consistent so a caller can move between the two
   * components without re-deriving how to explain a disabled item). Most useful paired with
   * `disabled: true`, to say why. */
  tooltip?: string;
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
  const [focusIndex, setFocusIndex] = React.useState(() => {
    const activeIndex = items.findIndex((i) => i.id === activeId);
    return activeIndex !== -1 ? activeIndex : Math.max(items.findIndex((i) => !i.disabled), 0);
  });
  const active = activeId ?? internal;
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  // Callback refs only fire for indices React still renders, so a shrinking `items`
  // would otherwise leave stale/detached elements at the tail of this array forever.
  tabRefs.current = tabRefs.current.slice(0, items.length);

  const select = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };

  // Roving tabindex (APG tabs pattern): only one tab sits in the Tab order at a time.
  // Arrow/Home/End move focus across every rendered tab, but only enabled tabs change
  // selection -- disabled tabs stay non-activatable while remaining reachable for their
  // explanatory tooltip/title.
  const activeIndex = items.findIndex((i) => i.id === active);
  const firstEnabledIndex = items.findIndex((i) => !i.disabled);
  const tabStopIndex =
    focusIndex >= 0 && focusIndex < items.length
      ? focusIndex
      : activeIndex !== -1
        ? activeIndex
        : Math.max(firstEnabledIndex, 0);

  React.useEffect(() => {
    setFocusIndex((current) => {
      if (current >= 0 && current < items.length) return current;
      if (activeIndex !== -1) return activeIndex;
      return Math.max(firstEnabledIndex, 0);
    });
  }, [activeIndex, firstEnabledIndex, items.length]);

  const focusAndSelect = (index: number) => {
    const item = items[index];
    if (!item) return;
    setFocusIndex(index);
    if (!item.disabled) select(item.id);
    tabRefs.current[index]?.focus();
  };

  const moveFocus = (from: number, delta: number) => {
    if (items.length === 0) return;
    focusAndSelect((from + delta + items.length) % items.length);
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
          aria-disabled={item.disabled || undefined}
          title={item.tooltip}
          className={cx(
            '__s9cmpx-tab',
            `__s9cmpx-tab--${size}`,
            active === item.id && '__s9cmpx-tab--active',
            item.disabled && '__s9cmpx-tab--disabled',
            lastItemRightAligned && i === items.length - 1 && '__s9cmpx-tab--last',
          )}
          onFocus={() => setFocusIndex(i)}
          onClick={() => {
            setFocusIndex(i);
            if (!item.disabled) select(item.id);
          }}
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
            } else if (item.disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
