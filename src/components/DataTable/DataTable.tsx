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
  /**
   * Called when a row is activated: a real click anywhere in the row, or Enter/Space while a
   * cell in that row has keyboard focus. Use this (not a hand-rolled `gridOptions.onRowClicked`)
   * for any row that navigates or opens something on click -- a mouse-only `onRowClicked` is a
   * real, confirmed keyboard-accessibility gap otherwise (verified live: pressing Enter on a
   * keyboard-focused cell did nothing without this). Cell focus is otherwise suppressed
   * entirely (see `suppressCellFocus` below) for tables with no row-level action, since
   * Tab-stopping through every cell of a purely-informational table is worse for keyboard/
   * screen-reader users than skipping the table's internals altogether -- this prop is what
   * opts a table back into cell focus, only when there's actually something for Enter to do.
   * Also defaults `rowStyle` to a pointer cursor; pass your own `gridOptions.rowStyle` to
   * override.
   */
  onRowActivate?: (data: Row) => void;
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
  onRowActivate,
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

  // This went through three ResizeObserver-based attempts (each confirmed working in local
  // Storybook, each confirmed broken live) before landing on polling instead. The final
  // live diagnosis, done by reading canScrollMore's actual React fiber state directly rather
  // than trusting DOM/instrumentation proxies: overflow genuinely became true (scrollWidth
  // 960 vs clientWidth 464, both measured directly) while canScrollMore stayed false, with
  // ro.observe() confirmed called on the correct, current node throughout.
  //
  // Root cause: ResizeObserver watches an element's own border/content-box size -- it does
  // NOT fire when only scrollWidth changes while clientWidth stays fixed, which is exactly
  // what .ag-body-horizontal-scroll-viewport does by design (overflow-x: auto/scroll means
  // its own box is deliberately clamped by its container regardless of how wide its content
  // grows). This isn't a timing bug or a wrong-node bug like the previous two attempts --
  // it's the wrong API for the question ("does this element's content now overflow its own
  // fixed-size box" is a scrollWidth-vs-clientWidth comparison, not a box-size-change event).
  // A MutationObserver can't answer it either (see the git history on this file for that
  // attempt) since content growing inside an unchanged DOM structure fires no mutations.
  //
  // Polling sidesteps needing to identify a "correct" triggering event at all -- correct by
  // construction regardless of what caused the change (columns, row data, container resize,
  // AG Grid's own internal async layout passes), at the cost of a cheap comparison every
  // 250ms while the table is mounted.
  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const check = () => {
      const el = wrapper.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport');
      if (!el) return;
      setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    check();

    const intervalId = window.setInterval(check, 250);
    // Scroll response doesn't need to wait for the next poll tick.
    wrapper.addEventListener('scroll', check, { capture: true, passive: true });

    return () => {
      window.clearInterval(intervalId);
      wrapper.removeEventListener('scroll', check, { capture: true });
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

  // Only built when a caller actually wants row activation -- re-enables cell focus (off by
  // default below) and wires both the mouse and keyboard paths to the same handler, so a row
  // that opens something on click also opens on Enter/Space from a keyboard-focused cell.
  // `onRowClicked`/`onCellKeyDown` compose with any handler the caller also passes via
  // `gridOptions` (both fire) rather than silently overriding one another, since a plain
  // `{...activationGridOptions, ...gridOptions}` spread would let a caller's own
  // `gridOptions.onRowClicked` (e.g. for row-selection tracking) silently swallow activation.
  const activationGridOptions = React.useMemo<GridOptions<Row> | undefined>(() => {
    if (!onRowActivate) return undefined;
    return {
      suppressCellFocus: false,
      rowStyle: { cursor: 'pointer' },
      ...gridOptions,
      onRowClicked: (e) => {
        if (e.data) onRowActivate(e.data);
        gridOptions?.onRowClicked?.(e);
      },
      onCellKeyDown: (e) => {
        const keyEvent = 'event' in e ? (e.event as KeyboardEvent | undefined) : undefined;
        if (keyEvent && (keyEvent.key === 'Enter' || keyEvent.key === ' ') && e.data) {
          keyEvent.preventDefault();
          onRowActivate(e.data);
        }
        gridOptions?.onCellKeyDown?.(e);
      },
    };
  }, [onRowActivate, gridOptions]);

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
        {...(activationGridOptions ?? gridOptions)}
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
