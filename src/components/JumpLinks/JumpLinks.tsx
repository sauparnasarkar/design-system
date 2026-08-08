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

// Tracks the one spacer (if any) a previous scrollToJumpTarget call left in the DOM -- see the
// comment where it's created below for why it's cleaned up here, at the start of the *next* jump,
// rather than on its own timer.
let activeSpacer: HTMLDivElement | null = null;

/** Scrolls to and focuses a jump target by id -- factored out of JumpLinks' own click handler so
 * a page can call the exact same logic on mount when the URL already carries a `#anchor` (a
 * bookmarked/shared link), since the browser's one-shot native hash-scroll on page load often
 * fires before a data-loaded page's target section exists in the DOM yet. No-ops silently if the
 * target genuinely doesn't exist (e.g. the section is currently gated behind an empty selection). */
export function scrollToJumpTarget(id: string, opts?: { reduceMotion?: boolean; isTopSection?: boolean }): void {
  const el = document.getElementById(id);
  if (!el) return;

  // Reclaims the space from an earlier jump's spacer now, at the start of this new jump, rather
  // than on its own timer -- the user is already navigating away from wherever that spacer put
  // them, so a scroll adjustment as a side effect of this click isn't surprising the way it would
  // be if it happened on its own, later, for no visible reason.
  activeSpacer?.remove();
  activeSpacer = null;

  const rect = el.getBoundingClientRect();
  const alreadyFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  // "Top section" (opts.isTopSection, set by JumpLinks' own click handler below only for
  // items[0] -- the literal first section on the page, right after the page's own <h1>/this
  // JumpLinks row) is a caller-supplied fact, not something measured here from the viewport.
  // An earlier attempt inferred it geometrically instead (targetY < window.innerHeight, i.e.
  // "would this be visible with zero scrolling") -- confirmed live to be wrong: on a common
  // 1920x963 desktop viewport, Country Profile's *third* jump item ("YoY Change", 604px down)
  // still fell within that 963px window and got wrongly treated as top-section, reproducing the
  // exact bug a follow-up report described (its link visibly did nothing). Both examples in that
  // report -- YoY Change (Country Profile's 3rd of 4 items) and GHG Share by Decade (Historical
  // Trends' *2nd and last* item) -- are non-first items that must always scroll regardless of
  // whether they happen to fit in whatever viewport is open. Only items[0] is "the top section".
  // Calls with no isTopSection (BackToTop's own click, and a page's hash-on-load handling) always
  // scroll -- correct in both cases: BackToTop always means "go all the way", and a freshly
  // loaded page with a #anchor already in the URL should just land on it, same as native
  // browser hash-scroll would.
  if (!(opts?.isTopSection && alreadyFullyVisible)) {
    // getBoundingClientRect().top + scrollY, not el.offsetTop -- offsetTop is relative to the
    // element's offsetParent, which is only the document origin if no ancestor between el and
    // <body> is positioned. This measures from the document origin regardless of DOM nesting.
    const targetY = rect.top + window.scrollY;
    // If there isn't enough scrollable room below the target to bring it flush to the viewport's
    // top, the browser silently clamps the scroll short of it -- confirmed live: on a page whose
    // content ends soon after the target (e.g. Country Profile's Key Statistics, Data Explorer's
    // Summary Statistics, Overview's % Change -- each the last jump target on its page), up to
    // ~225px of the *previous* section stays visible above the intended target no matter how the
    // scroll is triggered. An aria-hidden spacer appended after the target's own scrollIntoView
    // call gives just enough extra room.
    //
    // This spacer is deliberately never removed on a timer/event once added -- an earlier version
    // did (on 'scrollend', or a double rAF for the reduced-motion path), which looked correct in
    // Storybook's test environment only because the test's own assertion happened to run before
    // the removal fired. Confirmed live it's actually broken: on Historical Trends' "GHG Share by
    // Decade" (the page's last, shortest section), scrollY reached 671 with the spacer in place,
    // then snapped back to 255 the instant the spacer was removed -- reproducing the exact "~225px
    // of the previous section stays visible" bug this spacer exists to fix. This isn't a timing
    // race to fix with a different delay: removing a spacer that's currently the only thing making
    // targetY a reachable scroll position will *always* make the browser re-clamp scrollY back
    // down, however long you wait first, because scrollTop is continuously clamped to
    // [0, scrollHeight - clientHeight] as the document resizes. So instead of ever auto-removing
    // it, this one spacer is reclaimed lazily -- at the very top of this function, on the *next*
    // jump (activeSpacer above) -- once the user has already moved on from wherever it put them.
    const doc = document.documentElement;
    const shortfall = targetY - (doc.scrollHeight - doc.clientHeight);
    if (shortfall > 0) {
      const spacer = document.createElement('div');
      spacer.style.height = `${shortfall}px`;
      spacer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(spacer);
      activeSpacer = spacer;
    }

    const reduceMotion = opts?.reduceMotion;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

    // Element.scrollIntoView doesn't reliably fire a native 'scroll' event on window in every
    // browser -- confirmed live (SPEC.md §5.20 bug report): scrollY genuinely changed but zero
    // 'scroll' events fired, leaving passive scroll-position observers (BackToTop) stuck never
    // becoming visible after a jump-nav click. Dispatch one synthetic event right away, which
    // already covers the reduced-motion/'auto' case since the position is final by this point,
    // and one more on 'scrollend' (with a timeout fallback in case it never fires) to cover the
    // default smooth case once the animation genuinely settles -- 'scroll' listeners re-read
    // window.scrollY fresh each time, so a synthetic event with no real position data is enough
    // to make them re-check.
    window.dispatchEvent(new Event('scroll'));
    if (!reduceMotion) {
      const redispatch = () => window.dispatchEvent(new Event('scroll'));
      window.addEventListener('scrollend', redispatch, { once: true });
      setTimeout(redispatch, 1000);
    }
  }

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

    // Only the very first item is "the top section" -- see scrollToJumpTarget's own comment.
    scrollToJumpTarget(item.id, { reduceMotion, isTopSection: item.id === items[0]?.id });
    if (window.location.hash !== `#${item.id}`) {
      window.history.pushState(null, '', `#${item.id}`);
    }
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
