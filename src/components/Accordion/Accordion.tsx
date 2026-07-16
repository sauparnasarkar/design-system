import React from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../Icon/Icon';

export type AccordionSize = 's' | 'l';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Chevron position */
  iconPosition?: 'left' | 'right';
  size?: AccordionSize;
  /** Allow multiple panels open at once */
  multiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  iconPosition = 'right',
  size = 'l',
  multiple = false,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = React.useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(multiple ? prev : [...prev].filter((x) => x === id));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cx('sy-accordion', `sy-accordion--icon-${iconPosition}`, `sy-accordion--${size}`, className)}>
      {items.map((item) => {
        const open = openIds.has(item.id);
        const buttonId = `${item.id}-accordion-button`;
        const panelId = `${item.id}-accordion-panel`;
        return (
          <div key={item.id} className={cx('sy-accordion__item', item.disabled && 'sy-accordion__item--disabled')}>
            <h3 className="sy-accordion__heading" style={{ margin: 0 }}>
              <button
                type="button"
                id={buttonId}
                className="sy-accordion__button"
                aria-expanded={open}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}
              >
                {iconPosition === 'left' && (
                  <span className="sy-accordion__icon">
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
                  </span>
                )}
                <span className="sy-accordion__title sy-headline7">{item.title}</span>
                {iconPosition === 'right' && (
                  <span className="sy-accordion__icon">
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
                  </span>
                )}
              </button>
            </h3>
            {open && (
              <div id={panelId} className="sy-accordion__panel sy-body3-long" role="region" aria-labelledby={buttonId}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
