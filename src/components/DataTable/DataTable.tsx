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

  // AG Grid's own horizontal scrollbar is opacity:0/visibility:hidden until an
  // active scroll or hover (its "Apple-style" scrollbar CSS) — on touch devices
  // that means there's no visible cue a table scrolls at all until a visitor
  // stumbles onto it. Show an explicit hint whenever content actually overflows,
  // and drop it the moment the visitor scrolls (they've found it; stop nagging).
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = React.useState(false);

  React.useEffect(() => {
    let scrollEl: HTMLElement | null = null;
    let ro: ResizeObserver | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      if (scrollEl && scrollEl.scrollLeft > 4) setIsScrollable(false);
    };

    const attach = () => {
      scrollEl = wrapperRef.current?.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport') ?? null;
      if (!scrollEl) {
        // AG Grid builds this element asynchronously after mount — it may not
        // exist on the very first effect run.
        retryTimer = setTimeout(attach, 150);
        return;
      }
      const check = () => setIsScrollable(scrollEl!.scrollWidth > scrollEl!.clientWidth + 1);
      check();
      ro = new ResizeObserver(check);
      ro.observe(scrollEl);
      scrollEl.addEventListener('scroll', onScroll, { passive: true });
    };
    attach();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      ro?.disconnect();
      scrollEl?.removeEventListener('scroll', onScroll);
    };
  }, [rows, columns]);

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
      {isScrollable && (
        <div
          aria-hidden="true"
          className="__s9cmpx-table__scroll-hint"
          style={{
            position: 'absolute',
            // Anchored to the bottom-right corner, not the top — the header
            // row is a single, persistent line that always has real column
            // labels right up to the edge on narrow/many-column tables, so a
            // top-right badge reliably obscured them. Body rows are lower
            // stakes: there are many of them, and covering one corner cell
            // for the moment before the user scrolls (which dismisses this)
            // is far less disruptive than covering the only header row.
            bottom: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.55)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          Scroll for more →
        </div>
      )}
    </div>
  );
}
