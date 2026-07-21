import React from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps focus within a dialog-like container while `open` is true: moves focus into the
 * container on open, wraps Tab/Shift+Tab at its first/last focusable descendant, and
 * restores focus to whatever was focused before opening once `open` becomes false.
 * Shared by Modal and Drawer — both are dialog-role overlays with the same requirement.
 */
export function useFocusTrap<T extends HTMLElement>(open: boolean): React.RefObject<T | null> {
  const containerRef = React.useRef<T>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const focusFirst = () => {
      const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable?.[0] ?? container)?.focus();
    };
    // Focus after paint so the container (often just-mounted) is actually focusable.
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  return containerRef;
}
