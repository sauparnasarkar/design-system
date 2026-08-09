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
  /** Marks this item as part of the page's naturally-adjacent top cluster (SPEC.md §5.20) --
   * eligible to skip its scroll when already fully visible, same as items[0] (which is always
   * eligible regardless of this flag). Defaults to false for every item but items[0]. Only worth
   * setting when a page author knows two sections sit close enough together that scrolling the
   * second one to the top, while both are already on screen, would just hide the nav for no
   * benefit -- e.g. Country Profile's "Per Capita" chart, stacked directly under "Emissions".
   * This can't be inferred from viewport geometry alone: a target's raw document position varies
   * by viewport size the same way regardless of whether it's a natural neighbor of the top
   * section or a genuinely later one, confirmed live when a geometric attempt at this exact
   * distinction wrongly classified a real later section as top-section on a wide viewport. Still
   * viewport-dependent in effect, just not in how it's decided: the runtime "already visible"
   * check still applies on top of this flag, so on a narrow/short viewport (e.g. mobile, where a
   * marked item is genuinely below the fold) it scrolls normally regardless of the flag. */
  topSection?: boolean;
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
export function scrollToJumpTarget(id: string, opts?: { reduceMotion?: boolean; isTopSection?: boolean }): void {
  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const alreadyFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  // "Top section" (opts.isTopSection, set by JumpLinks' own click handler below for items[0]
  // unconditionally, or a later item if the page author marked it JumpLinkItem.topSection) is a
  // caller-supplied fact, not something measured here from the viewport. An earlier attempt
  // inferred it purely geometrically instead (targetY < window.innerHeight, i.e. "would this be
  // visible with zero scrolling") -- confirmed live to be wrong: on a common 1920x963 desktop
  // viewport, Country Profile's *third* jump item ("YoY Change", 604px down) still fell within
  // that 963px window and got wrongly treated as top-section. Geometry alone can't tell "a later
  // section that happens to fit this viewport" apart from "a natural neighbor of the top
  // section" -- both are just a document position compared to a viewport height, and the same
  // position either does or doesn't fit regardless of which case it actually is. So `topSection`
  // is an explicit per-item opt-in instead (JumpLinkItem.topSection, JumpLinks.tsx), for the
  // rarer case where a page author *does* know two sections are close enough neighbors that
  // scrolling the second one away while both are already visible would only hide the nav for no
  // benefit -- e.g. Country Profile's "Per Capita" chart, stacked directly under "Emissions".
  // Still viewport-dependent in effect: the `alreadyFullyVisible` check below still gates it, so
  // a marked item that's genuinely below the fold (e.g. on a narrow mobile viewport, where
  // "Emissions" alone fills the screen) scrolls normally regardless of the flag. Calls with no
  // isTopSection (BackToTop's own click, and a page's hash-on-load handling) always scroll --
  // correct in both cases: BackToTop always means "go all the way", and a freshly loaded page
  // with a #anchor already in the URL should just land on it, same as native browser hash-scroll
  // would.
  if (!(opts?.isTopSection && alreadyFullyVisible)) {
    // Scrolls the target flush to the top of the viewport when there's enough real page content
    // below it to reach that far -- but never further than the document's own natural end, so a
    // short page's last section can't be forced past its real content (e.g. the app's footer)
    // into blank space. An earlier version defeated the browser's own clamp on purpose, with a
    // temporary spacer appended after the target so it could always reach exactly flush-to-top
    // even on a page too short to naturally support that -- reported directly, with screenshots:
    // that left a large blank gap below the footer whenever a short page's last section was
    // jumped to, with the footer (and this session's BackToTop.avoidSelector fix docking above
    // it) scrolled far out of view above that gap. `scrollTop` is already continuously clamped to
    // [0, scrollHeight - clientHeight] by the browser -- once nothing artificially extends
    // scrollHeight, that native clamp *is* the desired behavior, so the spacer is removed
    // entirely here rather than trying to cap its size. Accepted tradeoff: a short page's last
    // section may not land perfectly flush at the very top (part of the previous section can
    // remain visible above it) -- preferred over ever showing blank space past the page's real
    // content.
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

    // items[0] is always "the top section"; a later item only is if the page author explicitly
    // marked it topSection -- see scrollToJumpTarget's own comment for why this isn't inferred.
    scrollToJumpTarget(item.id, { reduceMotion, isTopSection: item.id === items[0]?.id || item.topSection === true });
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
