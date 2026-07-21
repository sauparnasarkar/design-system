import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';
import { Tabs, type TabsProps } from './Tabs';

export interface TabsWrapperProps extends TabsProps {
  /** How far one chevron click scrolls, in px */
  scrollStep?: number;
}

/**
 * Scroll wrapper for Tabs (`__s9cmpx-tabs-wrapper`): when the tablist overflows,
 * gradient-backed chevron controls appear on the overflowing side(s).
 */
export function TabsWrapper({ scrollStep = 240, size = 'large', ...tabsProps }: TabsWrapperProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(false);

  const update = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 1);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [update]);

  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  const controls = (side: 'left' | 'right') => (
    <div className={cx('__s9cmpx-tabs__controls', `__s9cmpx-tabs__controls--${side}`, size === 'small' && '__s9cmpx-tabs__controls--small')}>
      <button
        type="button"
        className="__s9cmpx-tabs__controls-button"
        aria-label={side === 'left' ? 'Scroll tabs left' : 'Scroll tabs right'}
        onClick={() => scrollBy(side === 'left' ? -scrollStep : scrollStep)}
        style={{ cursor: 'pointer' }}
      >
        <Icon name={side === 'left' ? 'chevron-left' : 'chevron-right'} size={16} />
      </button>
    </div>
  );

  return (
    <div className="__s9cmpx-tabs-wrapper">
      <div ref={scrollRef} onScroll={update} style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <Tabs size={size} {...tabsProps} />
      </div>
      {canLeft && controls('left')}
      {canRight && controls('right')}
    </div>
  );
}
