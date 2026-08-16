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
  const scrollElRef = React.useRef<HTMLElement | null>(null);
  const [canScrollMore, setCanScrollMore] = React.useState(false);

  React.useEffect(() => {
    let ro: ResizeObserver | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      const el = scrollElRef.current;
      if (!el) return;
      setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    const attach = () => {
      const el = wrapperRef.current?.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport') ?? null;
      if (!el) {
        // AG Grid builds this element asynchronously after mount — it may not
        // exist on the very first effect run.
        retryTimer = setTimeout(attach, 150);
        return;
      }
      scrollElRef.current = el;
      check();
      ro = new ResizeObserver(check);
      ro.observe(el);
      el.addEventListener('scroll', check, { passive: true });
    };
    attach();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      ro?.disconnect();
      scrollElRef.current?.removeEventListener('scroll', check);
    };
  }, [rows, columns]);

  const scrollRight = () => {
    // 80% of the visible width, not the full width -- a "page" scroll with slight overlap so
    // context (e.g. a partially-visible column) carries over between clicks, the same
    // convention most paginated horizontal-scroll UIs use.
    scrollElRef.current?.scrollBy({ left: scrollElRef.current.clientWidth * 0.8, behavior: 'smooth' });
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
