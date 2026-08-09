import React from 'react';
import { cx } from '../../lib/cx';
import { Button } from '../Button/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToJumpTarget } from '../JumpLinks/JumpLinks';

// Gap left between the button's bottom edge and the docked-against element's top edge, once
// docking is active -- same visual breathing room the button's own base bottom/right offset
// already gives the viewport edge, just applied against the docked element instead.
const DOCK_GAP_PX = 16;

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
  /** CSS selector for an element (e.g. a page footer) the button should never visually render
   * below (SPEC.md §5.20). Reported directly: a JumpLinks target near the end of a short page can
   * leave a large scrollable gap below the real content (the shortfall spacer scrollToJumpTarget
   * uses to bring a target flush to the top, deliberately never auto-removed -- see its own
   * comment -- so that gap can persist well past the jump itself), and this fixed-position button
   * kept rendering at its normal viewport-anchored spot regardless, ending up stranded deep inside
   * that empty space, visibly detached from the page's actual last content. Once the matched
   * element's top edge rises above the viewport's bottom edge, the button's `bottom` offset grows
   * to keep it docked just above that edge instead of the viewport's -- and keeps growing as the
   * user scrolls further into the gap, so the button scrolls out of view (rather than staying
   * pinned in empty space) once even the docked element itself has scrolled past. No-ops entirely
   * (falls back to the normal viewport-anchored position) if omitted or if no element matches. */
  avoidSelector?: string;
  className?: string;
}

/** Floating "back to top" button (`__s9cmpx-back-to-top`, SPEC.md §5.20). Page-agnostic -- unlike
 * JumpLinks, it needs no per-page section knowledge, so a consuming app wires it once (e.g. in a
 * shared app shell) rather than per page. */
export function BackToTop({ threshold = 400, targetId, avoidSelector, className }: BackToTopProps) {
  const [visible, setVisible] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [dockOffset, setDockOffset] = React.useState(0);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
      // Recomputed on every scroll tick, same listener as the visibility check above -- matches
      // this component's own established preference (see the file-level history/SPEC.md §5.20)
      // for a plain scroll listener over a rAF-throttled one, since rAF callbacks were confirmed
      // to go unfired in a backgrounded test-runner tab.
      const avoidEl = avoidSelector ? document.querySelector(avoidSelector) : null;
      if (!avoidEl) {
        setDockOffset(0);
        return;
      }
      const avoidRectTop = avoidEl.getBoundingClientRect().top;
      setDockOffset(Math.max(0, window.innerHeight - avoidRectTop + DOCK_GAP_PX));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, avoidSelector]);

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
        bottom: `calc(${24 + dockOffset}px + env(safe-area-inset-bottom, 0px))`,
        // Must clear the sidebar nav's own z-index (--__s9cmpx-c-sidebar-z-index, 310) --
        // same fix ChartCard's expand overlay already needed for the same reason.
        zIndex: 'var(--__s9cmpx-z-index-modal)',
      }}
    >
      <Button variant="primary" size="l" iconOnly fullRadius iconLeft="chevron-up" aria-label="Back to top" onClick={handleClick} />
    </div>
  );
}
