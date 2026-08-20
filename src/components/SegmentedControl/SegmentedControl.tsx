import React from 'react';
import { cx } from '../../lib/cx';
import { Icon, type IconName } from '../Icon/Icon';

// SSR-safe: React.useLayoutEffect warns ("does nothing on the server") when the component
// itself is server-rendered. Same local pattern PromptBar.tsx already uses -- not shared/
// exported, matching this repo's small-per-component-copy convention.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export type SegmentedControlSize = 'small' | 'medium';

export interface SegmentedControlItem {
  value: string;
  label?: React.ReactNode;
  icon?: IconName;
  disabled?: boolean;
  /** Accessible name for icon-only segments (no `label`) — required in that
   * case, since the icon alone gives screen readers nothing to announce. */
  ariaLabel?: string;
}

export interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value?: string;
  onChange?: (value: string) => void;
  size?: SegmentedControlSize;
  /** Icon-only square segments */
  square?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export function SegmentedControl({
  items,
  value,
  onChange,
  size = 'medium',
  square = false,
  fullWidth = false,
  disabled = false,
  name = '__s9cmpx-segmented-control',
  className,
}: SegmentedControlProps) {
  const [internal, setInternal] = React.useState(items[0]?.value);
  const active = value ?? internal;

  // The vendor CSS paints the sliding "active" pill via a container-level ::before whose
  // position/width come entirely from the --highlight-x-pos/--highlight-width custom
  // properties (segmented-control.css) -- nothing in this component ever set them, so the
  // pill was always width:auto/x:0, i.e. invisible, on every consumer of this component (first
  // caught live via climate-dashboard-react's AdminPage, the first real usage of this component
  // in that app: both segments read as plain, indistinguishable text with only their own
  // hover/focus states to go on). Measured directly off the DOM, not computed from item widths,
  // since label/icon content is arbitrary React children with no reliable size formula.
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef(new Map<string, HTMLLabelElement>());

  const measureHighlight = React.useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current.get(active ?? '');
    if (!container || !activeEl) return;
    container.style.setProperty('--highlight-x-pos', `${activeEl.offsetLeft}px`);
    container.style.setProperty('--highlight-width', `${activeEl.offsetWidth}px`);
  }, [active]);

  useIsomorphicLayoutEffect(() => {
    measureHighlight();
  }, [measureHighlight, items, size, square, fullWidth]);

  React.useEffect(() => {
    // ResizeObserver on the container (not a window resize listener) -- same pattern
    // TabsWrapper.tsx already uses for its own scroll-affordance recalculation. Catches every
    // layout-affecting change that actually matters here (viewport resize *only* matters
    // insofar as it changes the container's own box; a non-fullWidth control's inline-flex
    // width also naturally reflows from font-loading or content changes without any viewport
    // resize at all) via one direct signal instead of a broader, less precise proxy for it.
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(measureHighlight);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureHighlight]);

  return (
    <div
      ref={containerRef}
      className={cx(
        '__s9cmpx-segmented-control',
        `__s9cmpx-segmented-control--${size}`,
        square && '__s9cmpx-segmented-control--square',
        fullWidth && '__s9cmpx-segmented-control--full-width',
        disabled && '__s9cmpx-segmented-control--disabled',
        className,
      )}
      role="radiogroup"
    >
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <label
            key={item.value}
            ref={(el) => {
              if (el) itemRefs.current.set(item.value, el);
              else itemRefs.current.delete(item.value);
            }}
            // Both the item.__item and the item--active class live on this single element (not
            // nested, e.g. .item > .active > .content) -- overrides.css's active-text-color
            // rule targets this exact compound shape; see that file for why the vendor CSS's
            // own descendant-combinator version of the same rule can never match it.
            className={cx('__s9cmpx-segmented-control__item', isActive && '__s9cmpx-segmented-control--active')}
          >
            <input
              type="radio"
              className="__s9cmpx-segmented-control__item-input"
              name={name}
              value={item.value}
              checked={isActive}
              disabled={disabled || item.disabled}
              aria-label={item.label ? undefined : item.ariaLabel}
              onChange={() => {
                setInternal(item.value);
                onChange?.(item.value);
              }}
            />
            <span className="__s9cmpx-segmented-control__item-content">
              {item.icon && (
                <span className="__s9cmpx-segmented-control__item-content__icon">
                  <Icon name={item.icon} size={size === 'small' ? 14 : 16} />
                </span>
              )}
              {item.label && (
                <span className="__s9cmpx-segmented-control__item-content__label">{item.label}</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
