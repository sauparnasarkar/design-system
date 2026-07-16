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
 * AG Grid wrapped in the vendor's `sy-table` / `ag-theme-syena` theme —
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
  return (
    <div className={cx('sy-table', 'ag-theme-syena', className)} style={{ height, width: '100%' }}>
      <AgGridReact<Row>
        theme="legacy"
        columnDefs={columns}
        rowData={rows}
        defaultColDef={defaultColDef}
        rowClass={striped ? 'sy-table__row--default-appearance' : undefined}
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
    </div>
  );
}
