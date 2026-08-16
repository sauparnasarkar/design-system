import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import { cx } from '../../lib/cx';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface DataTableProps<Row> {
  columns: ColDef<Row>[];
  rows: Row[];
  /** Grid height in px */
  height?: number;
  /** Zebra striping via the vendor default row appearance */
  striped?: boolean;
  /** Show the floating filter row under headers */
  floatingFilters?: boolean;
  gridOptions?: GridOptions<Row>;
  className?: string;
}

/**
 * AG Grid wrapped in the vendor's `__s9cmpx-table` / `ag-theme-s9cmpx` theme —
 * the same stack the products use for Reports/Entities/Instruments grids.
 * Uses AG Grid's legacy CSS theming so the vendor rules apply.
 */
export function DataTable<Row>({
  columns,
  rows,
  height = 400,
  striped = true,
  floatingFilters = false,
  gridOptions,
  className,
}: DataTableProps<Row>) {
  const defaultColDef = React.useMemo<ColDef<Row>>(
    () => ({
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      filter: true,
      floatingFilter: floatingFilters,
    }),
    [floatingFilters],
  );

  // AG Grid's own horizontal scrollbar is opacity:0/visibility:hidden until an active scroll
  // or hover (its "Apple-style" scrollbar CSS), and that hover-to-reveal is itself broken on
  // macOS/iOS: the mouseenter listener AG Grid binds to fade it in is on the exact element
  // `visibility:hidden` excludes from hit-testing, so it can never fire from a real pointer
  // (confirmed live -- hovering the grid never revealed a scrollbar; overrides.css's own
  // ag-apple-scrollbar fix restores that listener's ability to fire, but the actual scrollbar
  // pixels are the macOS-native overlay indicator, whose on-screen appearance is driven by
  // OS/compositor-level hover detection that a DOM class toggle can't force into view either).
  // A mouse-only desktop user has no reliable way to discover or use horizontal scroll at all
  // -- so this is a real scroll *control*, not just a discoverability hint: a genuine button
  // that drives `scrollLeft` directly (confirmed live: reliable regardless of what the native
  // scrollbar does or doesn't render), shown whenever there's still unscrolled content to the
  // right and hidden once fully scrolled -- not a one-time hint that vanishes after the first
  // scroll regardless of how much content remains (the previous behavior: a user who scrolled
  // partway via trackpad lost their only affordance to keep going, even with more columns
  // still off-screen).
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = React.useState(false);

  // Two DISTINCT problems here, confirmed live against a real deployed page with two
  // overflowing DataTable instances, needing two different tools -- getting this wrong twice
  // before landing on the combination below:
  //
  // 1. AG Grid can recreate its internal .ag-body-horizontal-scroll-viewport node well after
  //    mount, not just once -- any code holding a *cached reference* to that node (scrollElRef,
  //    an earlier version of this fix) goes silently stale the moment AG Grid swaps it.
  // 2. Separately, and this is the part a MutationObserver genuinely cannot see: AG Grid can
  //    widen that *same, unswapped* node's scrollWidth via a mechanism that never touches its
  //    DOM tree structure or its style/class attribute strings -- confirmed live (a
  //    MutationObserver with `childList/attributes` watching the whole wrapper subtree recorded
  //    zero mutations across a column-add that measurably changed scrollWidth from 464 to 960).
  //    MutationObserver can only ever see DOM/attribute mutations; it has no visibility into an
  //    element's actual *rendered box size*, which is exactly what changed here. An earlier
  //    version of this fix replaced the original ResizeObserver with a MutationObserver
  //    specifically to solve problem 1 above -- and in doing so, silently reintroduced problem
  //    2 from scratch (the button stopped appearing on new overflow at all, not just going
  //    stale after a swap).
  //
  // The fix needs both tools, each solving the one problem it's actually suited to:
  // ResizeObserver on the *current* viewport node reliably detects any box-size change
  // regardless of what caused it (problem 2); a MutationObserver on the stable wrapper
  // (childList only, no attributes -- just existence/identity, not size) detects when that
  // node gets replaced and re-points the ResizeObserver at whichever one is current (problem
  // 1). Neither tool alone covers both failure modes.
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ro: ResizeObserver | undefined;
    let observedEl: HTMLElement | null = null;
    let rafId: number | undefined;

    const check = () => {
      rafId = undefined;
      const el = wrapper.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport');
      if (!el) return;
      setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    // rAF-coalesced since both a ResizeObserver and a MutationObserver can fire many times in
    // quick succession (a scroll-driven virtualization burst, or several columns changing
    // width in the same layout pass) -- none of that needs a synchronous re-check per event.
    const scheduleCheck = () => {
      if (rafId !== undefined) return;
      rafId = requestAnimationFrame(check);
    };

    // Re-points the ResizeObserver at whichever .ag-body-horizontal-scroll-viewport is
    // currently live, a no-op if it's still the same node. Called once up front (also covers
    // "the node doesn't exist yet at mount" -- AG Grid builds it asynchronously, and the
    // MutationObserver below re-calls this once it appears, no separate retry-with-setTimeout
    // needed) and again every time the wrapper's child DOM structure changes underneath it.
    const ensureResizeObserverAttached = () => {
      const el = wrapper.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport');
      if (el === observedEl) return;
      if (observedEl) ro?.unobserve(observedEl);
      observedEl = el;
      if (el) {
        if (!ro) ro = new ResizeObserver(scheduleCheck);
        ro.observe(el);
      }
      scheduleCheck();
    };
    ensureResizeObserverAttached();

    const mo = new MutationObserver(ensureResizeObserverAttached);
    mo.observe(wrapper, { childList: true, subtree: true });

    // 'scroll' doesn't bubble, but it does propagate through the capture phase to every
    // ancestor regardless -- listening here with capture:true catches a scroll on whichever
    // specific descendant node is currently live, without needing to know or re-bind to it.
    wrapper.addEventListener('scroll', scheduleCheck, { capture: true, passive: true });

    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      ro?.disconnect();
      mo.disconnect();
      wrapper.removeEventListener('scroll', scheduleCheck, { capture: true });
    };
  }, [rows, columns]);

  const scrollRight = () => {
    // Re-queried fresh, not cached -- same reasoning as the effect above. 80% of the visible
    // width, not the full width -- a "page" scroll with slight overlap so context (e.g. a
    // partially-visible column) carries over between clicks, the same convention most
    // paginated horizontal-scroll UIs use.
    const el = wrapperRef.current?.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport');
    el?.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div ref={wrapperRef} className={cx('__s9cmpx-table', 'ag-theme-s9cmpx', className)} style={{ position: 'relative', height, width: '100%' }}>
      <AgGridReact<Row>
        theme="legacy"
        columnDefs={columns}
        rowData={rows}
        defaultColDef={defaultColDef}
        rowClass={striped ? '__s9cmpx-table__row--default-appearance' : undefined}
        suppressCellFocus
        // AG Grid's base CSS sets `content-visibility: auto` on the grid wrapper as a
        // rendering optimization for off-screen grids. If the grid mounts while below
        // the fold (e.g. a table stacked under several charts), the browser can skip its
        // initial layout pass entirely, leaving AG Grid's internal column-width
        // calculations stuck at 0 even after the grid scrolls into view. This is AG
        // Grid's own documented escape hatch for that failure mode.
        suppressContentVisibilityAuto
        {...gridOptions}
      />
      {canScrollMore && (
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Scroll table right to see more columns"
          className="__s9cmpx-table__scroll-hint"
          style={{
            position: 'absolute',
            // Anchored to the bottom-right corner, not the top — the header
            // row is a single, persistent line that always has real column
            // labels right up to the edge on narrow/many-column tables, so a
            // top-right badge reliably obscured them. Body rows are lower
            // stakes: there are many of them, and covering one corner cell
            // until the table is fully scrolled is far less disruptive than
            // covering the only header row.
            bottom: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px',
            border: 'none',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.55)',
            cursor: 'pointer',
            zIndex: 5,
          }}
        >
          Scroll for more →
        </button>
      )}
    </div>
  );
}
