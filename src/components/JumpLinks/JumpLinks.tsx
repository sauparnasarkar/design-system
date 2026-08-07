import React from 'react';
import { cx } from '../../lib/cx';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export interface JumpLinkItem {
  id: string;
  label: React.ReactNode;
  href: string;
  /** Run before jumping -- e.g. force-open an Accordion panel containing this target (SPEC.md
   * §5.19). Awaited before scrollIntoView runs, so it may return a Promise; a sync return
   * resolves immediately. Only the items that actually need this (a minority in practice) pay
   * the extra settle-time cost below -- everything else scrolls immediately. */
  onBeforeJump?: () => void | Promise<void>;
}

export interface JumpLinksProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: JumpLinkItem[];
  /** Controlled active item id */
  activeId?: string;
  onSelect?: (id: string) => void;
  vertical?: boolean;
}

/** Scrolls to and focuses a jump target by id -- factored out of JumpLinks' own click handler so
 * a page can call the exact same logic on mount when the URL already carries a `#anchor` (a
 * bookmarked/shared link), since the browser's one-shot native hash-scroll on page load often
 * fires before a data-loaded page's target section exists in the DOM yet. No-ops silently if the
 * target genuinely doesn't exist (e.g. the section is currently gated behind an empty selection). */
export function scrollToJumpTarget(id: string, opts?: { reduceMotion?: boolean }): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: opts?.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** In-page anchor navigation (`__s9cmpx-jump-links`), e.g. section links on entity pages. Clicking
 * an item smooth-scrolls to (and focuses) its target -- the same principle already applied to
 * route-change navigation (SPEC.md §5.10.3): a keyboard/screen-reader user needs their focus to
 * follow where the content visually went, not just have the page repaint under them. */
export function JumpLinks({ items, activeId, onSelect, vertical = false, className, ...rest }: JumpLinksProps) {
  const [internal, setInternal] = React.useState(items[0]?.id);
  const active = activeId ?? internal;
  const reduceMotion = useReducedMotion();

  const handleClick = async (item: JumpLinkItem, e: React.MouseEvent<HTMLAnchorElement>) => {
    setInternal(item.id);
    onSelect?.(item.id);

    // Same guard as SidebarNav's real-href fix (SPEC.md §5.10): a modified click (ctrl/cmd/
    // shift/alt -- "open in new tab") or a non-primary mouse button is never intercepted, so
    // that still works natively against the real href, same as right-click "copy link address".
    const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (e.button !== 0 || isModifiedClick) return;

    e.preventDefault();

    if (item.onBeforeJump) {
      await item.onBeforeJump();
      // Wait for the DOM mutation onBeforeJump triggered (e.g. an Accordion panel opening) to
      // actually be laid out before measuring scroll position -- a state update isn't
      // synchronously reflected in layout. Double rAF is the standard "wait for the next paint
      // after a state update" pattern: the first rAF can still fire before this update's own
      // paint in some browsers, the second guarantees a full layout/paint cycle has completed.
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }

    scrollToJumpTarget(item.id, { reduceMotion });
  };

  return (
    <nav
      aria-label="Jump links"
      className={cx('__s9cmpx-jump-links', vertical && '__s9cmpx-jump-links--vertical', className)}
      {...rest}
    >
      <ul style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 4 : 16, listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} className={cx('__s9cmpx-jump-links__item', active === item.id && '__s9cmpx-jump-links__item--active')}>
            <a
              href={item.href}
              className={cx('__s9cmpx-jump-links__anchor', '__s9cmpx-label2')}
              aria-current={active === item.id ? 'location' : undefined}
              onClick={(e) => void handleClick(item, e)}
              style={{
                display: 'inline-block',
                padding: vertical ? '6px 12px' : '8px 0',
                textDecoration: 'none',
                color: active === item.id ? 'var(--__s9cmpx-static-text-strong)' : 'var(--__s9cmpx-static-text-weak)',
                borderBottom: !vertical ? `2px solid ${active === item.id ? 'var(--__s9cmpx-interactive-fill-primary-default, #1f1f1f)' : 'transparent'}` : undefined,
                borderLeft: vertical ? `2px solid ${active === item.id ? 'var(--__s9cmpx-interactive-fill-primary-default, #1f1f1f)' : 'transparent'}` : undefined,
                fontWeight: active === item.id ? 600 : undefined,
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
