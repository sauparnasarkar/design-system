import React from 'react';

// Exported so SidebarNav's own hand-rolled mobile-drawer Tab-trap (it also needs Escape-to-close
// and a specific initial-focus target, so it can't just call useFocusTrap wholesale) stays in
// sync with this list instead of re-declaring a second, narrower copy that silently misses
// native form controls -- confirmed live: mobileOnlyContent can render a SegmentedControl or
// Toggle (both plain <input>s, no [tabindex]), and SidebarNav's old inline selector had no
// input/select/textarea clause at all, so Tab from that control escaped the open drawer.
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Native radio groups do not put every enabled radio into the sequential Tab order: only the
 * checked member is tabbable, or the first enabled member when nothing is checked yet. Filtering
 * to those real tab stops keeps focus wrapping aligned with what the browser itself will do.
 */
export function getFocusableElements(container: ParentNode): HTMLElement[] {
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const radioOwners = new WeakMap<object, number>();
  let nextOwnerId = 0;
  const getRadioGroupKey = (el: HTMLInputElement) => {
    const owner = el.form ?? el.getRootNode();
    if (!radioOwners.has(owner)) radioOwners.set(owner, nextOwnerId++);
    return `${el.name}::${radioOwners.get(owner)}`;
  };
  const radioGroups = new Map<string, HTMLInputElement[]>();
  for (const el of focusable) {
    if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) continue;
    const key = getRadioGroupKey(el);
    const group = radioGroups.get(key) ?? [];
    group.push(el);
    radioGroups.set(key, group);
  }
  return focusable.filter((el, _, all) => {
    if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.name) return true;
    const group = radioGroups.get(getRadioGroupKey(el)) ?? all.filter((candidate): candidate is HTMLInputElement => (
      candidate instanceof HTMLInputElement
      && candidate.type === 'radio'
      && candidate.name === el.name
      && candidate.form === el.form
    ));
    const checked = group.find((candidate) => candidate.checked);
    return checked ? el === checked : el === group[0];
  });
}

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
      const focusable = container ? getFocusableElements(container) : undefined;
      (focusable?.[0] ?? container)?.focus();
    };
    // Focus after paint so the container (often just-mounted) is actually focusable.
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const focusable = getFocusableElements(container);
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
