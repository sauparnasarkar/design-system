import React from 'react';
import { cx } from '../../lib/cx';
import { Button } from '../Button/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToJumpTarget } from '../JumpLinks/JumpLinks';

export interface BackToTopProps {
  /** Scroll distance (px) past which the button becomes visible. */
  threshold?: number;
  /** Element id to scroll into view and focus on click -- e.g. a page's <main> landmark, so
   * "back to top" also lands focus somewhere meaningful rather than just repainting under a
   * keyboard/screen-reader user. Reuses scrollToJumpTarget (JumpLinks, SPEC.md §5.19) itself:
   * confirmed live that a smooth `window.scrollTo` never actually animates in some browser
   * contexts this app runs in, while `Element.scrollIntoView` reliably does, so this deliberately
   * doesn't scroll the window directly. Omitted, falls back to an instant (non-smooth)
   * `window.scrollTo(0, 0)` with no focus change. */
  targetId?: string;
  className?: string;
}

/** Floating "back to top" button (`__s9cmpx-back-to-top`, SPEC.md §5.20). Page-agnostic -- unlike
 * JumpLinks, it needs no per-page section knowledge, so a consuming app wires it once (e.g. in a
 * shared app shell) rather than per page. */
export function BackToTop({ threshold = 400, targetId, className }: BackToTopProps) {
  const [visible, setVisible] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const handleClick = () => {
    if (targetId) {
      scrollToJumpTarget(targetId, { reduceMotion });
    } else {
      window.scrollTo(0, 0);
    }
  };

  if (!visible && !focusWithin) return null;

  return (
    <div
      className={cx('__s9cmpx-back-to-top', className)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
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
