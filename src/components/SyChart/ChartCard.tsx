import React from 'react';
import { Card, CardHeader } from '../Card/Card';
import { Icon } from '../Icon/Icon';
import { useFocusTrap } from '../../lib/useFocusTrap';

export interface ChartCardProps {
  title: React.ReactNode;
  /** Header controls (Selects, SegmentedControl, …); a download button is added automatically */
  actions?: React.ReactNode;
  onDownload?: () => void;
  /** "Data as of …" caption under the chart */
  asOf?: React.ReactNode;
  /** Pass a function to react to the expand/restore toggle (e.g. a taller chart when expanded) — only meaningful with `expandable` */
  children: React.ReactNode | ((isExpanded: boolean) => React.ReactNode);
  className?: string;
  /** Heading level for the title, to keep page-level heading order valid in context; defaults to h5 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Adds an expand/restore control to the header; while expanded, the card renders in a
   * safe-area-aware fixed overlay instead of its normal in-flow position (SPEC.md §5.11) */
  expandable?: boolean;
  /** Applied to the outer Card element -- gives a same-page anchor link (e.g. JumpLinks,
   * SPEC.md §5.19) something stable to scroll/focus to, independent of `title`'s own often-
   * dynamic content. */
  id?: string;
}

/** Chart panel chrome as used on the sector pages: Card header with controls + download, chart body, "Data as of" caption. */
export function ChartCard({ title, actions, onDownload, asOf, children, className, headingLevel, expandable = false, id }: ChartCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const content = typeof children === 'function' ? children(isExpanded) : children;
  const overlayRef = useFocusTrap<HTMLDivElement>(expandable && isExpanded);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!expandable || !isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expandable, isExpanded]);

  // Without this, the page behind the overlay stays scrollable -- confirmed live on iOS
  // Safari (landscape especially, where the dynamic toolbar already eats a large share of
  // the viewport) that a touch-drag meant for the overlay's own internal scroll can instead
  // scroll the background page, leaving the expanded chart looking cut off/unreachable and
  // letting background content (e.g. the treemap's own tapped-tile detail box) visibly
  // scroll into view behind the overlay's edge. A plain `body { overflow: hidden }` is a
  // known no-op against touch-driven scrolling on iOS Safari specifically -- pinning body
  // with position:fixed at its current scroll offset (and restoring both on cleanup) is the
  // pattern that actually holds there.
  React.useEffect(() => {
    if (!expandable || !isExpanded) return;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const body = document.body.style;
    const previous = { position: body.position, top: body.top, left: body.left, width: body.width, overflow: body.overflow };
    body.position = 'fixed';
    body.top = `-${scrollY}px`;
    body.left = `-${scrollX}px`;
    body.width = '100%';
    body.overflow = 'hidden';
    return () => {
      body.position = previous.position;
      body.top = previous.top;
      body.left = previous.left;
      body.width = previous.width;
      body.overflow = previous.overflow;
      window.scrollTo(scrollX, scrollY);
    };
  }, [expandable, isExpanded]);

  const card = (
    <Card
      id={id}
      className={className}
      withBorder
      // paper_bgcolor/plot_bgcolor in SyChart are transparent, so the chart inherits whatever's
      // behind it -- the general card surface (--static-background-standard, #1e2f52) is one
      // step lighter than the page (--static-background-weak, #121e35), costing contrast for
      // free. Overriding just this one component-level CSS var (rather than adding a Card prop
      // or a new token) darkens only chart-bearing cards to match the page (SPEC.md §5.12).
      style={{ '--__s9cmpx-c-card-background-color-default': 'var(--__s9cmpx-static-background-weak)' } as React.CSSProperties}
      header={
        <CardHeader
          title={<span id={titleId}>{title}</span>}
          headingLevel={headingLevel}
          actions={
            <>
              {actions}
              {expandable && (
                <button
                  type="button"
                  className="__s9cmpx-button __s9cmpx-button--ghost __s9cmpx-button--s __s9cmpx-button--icon-only"
                  aria-label={isExpanded ? 'Restore chart' : 'Expand chart'}
                  onClick={() => setIsExpanded((v) => !v)}
                >
                  <Icon name={isExpanded ? 'collapse' : 'expand'} size={16} />
                </button>
              )}
              {onDownload && (
                <button
                  type="button"
                  className="__s9cmpx-button __s9cmpx-button--ghost __s9cmpx-button--s __s9cmpx-button--icon-only"
                  aria-label="Download chart data"
                  onClick={onDownload}
                >
                  <Icon name="download" size={16} />
                </button>
              )}
            </>
          }
        />
      }
    >
      {content}
      {asOf && (
        <div className="__s9cmpx-label3" style={{ color: 'var(--__s9cmpx-static-text-weak)', marginTop: 8 }}>
          Data as of {asOf}
        </div>
      )}
    </Card>
  );

  if (!expandable || !isExpanded) return card;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      style={{
        position: 'fixed',
        // `inset: 0` (always the full viewport) rather than `top/right/bottom/left: calc(16px
        // + env(...))` -- confirmed live on iOS Safari (landscape especially) that computing
        // the box from four separate viewport-relative offsets left it not reliably covering
        // the full visual viewport, so the expanded chart looked cut off and its own
        // overflow:auto couldn't be reached to scroll the rest into view. The equivalent
        // margin is applied as padding instead, which only needs the box's own size, not a
        // fresh distance-from-each-viewport-edge calculation.
        inset: 0,
        padding: 'calc(24px + env(safe-area-inset-top, 0px)) calc(24px + env(safe-area-inset-right, 0px)) calc(24px + env(safe-area-inset-bottom, 0px)) calc(24px + env(safe-area-inset-left, 0px))',
        // Must clear the sidebar nav's own z-index (--__s9cmpx-c-sidebar-z-index, 310) --
        // confirmed live that a plain z-index:50 here left the sidebar painted on top of the
        // overlay's left edge, since position:fixed escapes the app shell's flex layout and
        // this box's left edge lands under the sidebar's screen region regardless of DOM
        // order (SPEC.md §5.11). The modal tier is the semantically-closest existing token for
        // a full-content-covering overlay.
        zIndex: 'var(--__s9cmpx-z-index-modal)',
        background: 'var(--__s9cmpx-static-background-weak)',
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {card}
    </div>
  );
}
