import React from 'react';
import { cx } from '../../lib/cx';
import { Button } from '../Button/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface BackToTopProps {
  /** Scroll distance (px) past which the button becomes visible. */
  threshold?: number;
  /** Element id to focus once the page has scrolled back to the top -- mirrors
   * scrollToJumpTarget's (JumpLinks, SPEC.md §5.19) own scroll-then-focus convention rather than
   * leaving focus wherever the click happened to land. Omit to skip focus management. */
  targetId?: string;
  className?: string;
}

/** Floating "back to top" button (`__s9cmpx-back-to-top`, SPEC.md §5.20). Page-agnostic -- unlike
 * JumpLinks, it needs no per-page section knowledge, so a consuming app wires it once (e.g. in a
 * shared app shell) rather than per page. */
export function BackToTop({ threshold = 400, targetId, className }: BackToTopProps) {
  const [visible, setVisible] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    const el = targetId ? document.getElementById(targetId) : null;
    if (el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  };

  if (!visible) return null;

  return (
    <div
      className={cx('__s9cmpx-back-to-top', className)}
      style={{
        position: 'fixed',
        right: 'calc(24px + env(safe-area-inset-right, 0px))',
        bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
        // Must clear the sidebar nav's own z-index (--__s9cmpx-c-sidebar-z-index, 310) --
        // same fix ChartCard's expand overlay already needed for the same reason.
        zIndex: 'var(--__s9cmpx-z-index-modal)',
      }}
    >
      <Button variant="primary" size="l" iconOnly fullRadius iconLeft="chevron-up" aria-label="Back to top" onClick={handleClick} />
    </div>
  );
}
